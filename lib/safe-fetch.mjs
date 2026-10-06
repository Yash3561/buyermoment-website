import https from "node:https";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";

export class AuditError extends Error {
  constructor(code, message, status = 422) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function normalizeWebsite(value) {
  if (typeof value !== "string" || value.length > 500 || !value.trim())
    throw new AuditError("INVALID_URL", "Enter a public website address.", 400);
  let url;
  try {
    url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(value.trim())
        ? value.trim()
        : "https://" + value.trim(),
    );
  } catch {
    throw new AuditError(
      "INVALID_URL",
      "Enter a valid website, such as example.com.",
      400,
    );
  }
  validateUrl(url);
  // Scan only the public homepage, never user-supplied paths or query strings.
  return new URL(url.origin + "/");
}

export function validateUrl(url) {
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    (url.port && url.port !== "443") ||
    url.username ||
    url.password ||
    isIP(host.replace(/^\[|\]$/g, "")) ||
    !host.includes(".") ||
    /(^|\.)(localhost|local|internal|test|invalid|onion|arpa)$/.test(host) ||
    host.endsWith(".") ||
    !/^[a-z\d.-]+$/i.test(host)
  )
    throw new AuditError(
      "UNSAFE_URL",
      "Use a public HTTPS domain without credentials or a custom port.",
      400,
    );
}

export function isPublicAddress(address) {
  try {
    return ipaddr.process(address).range() === "unicast";
  } catch {
    return false;
  }
}

export async function resolvePublic(hostname, resolver = lookup) {
  let timer;
  let addresses;
  try {
    addresses = await Promise.race([
      resolver(hostname, { all: true, verbatim: true }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("DNS timeout")), 4000);
      }),
    ]);
  } catch {
    throw new AuditError(
      "DNS_FAILED",
      "We couldn't resolve this website. Check the address or try again later.",
    );
  } finally {
    clearTimeout(timer);
  }
  if (
    !addresses.length ||
    addresses.some((item) => !isPublicAddress(item.address))
  )
    throw new AuditError(
      "UNSAFE_ADDRESS",
      "This address is not eligible for a public website check.",
      400,
    );
  // Validate every DNS answer and pin the connection to one approved answer.
  return addresses.find((item) => item.family === 4) || addresses[0];
}

function requestPage(url, address, maxBytes, signal) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(
        error instanceof AuditError
          ? error
          : new AuditError(
              "FETCH_FAILED",
              "We couldn't safely retrieve this page. Its firewall, certificate, or connection may prevent this check.",
            ),
      );
    };
    const req = https.request(
      url,
      {
        method: "GET",
        agent: false,
        signal,
        servername: url.hostname,
        lookup: (_host, options, callback) => {
          if (options?.all) callback(null, [address]);
          else callback(null, address.address, address.family);
        },
        headers: {
          "User-Agent":
            "ContextLumenAudit/1.0 (+https://www.contextlumen.com/#checker)",
          Accept: "text/html,text/plain,application/xhtml+xml;q=0.9",
          "Accept-Encoding": "identity",
        },
      },
      (response) => {
        const status = response.statusCode || 0;
        const headers = response.headers;
        if ([301, 302, 303, 307, 308].includes(status)) {
          response.destroy();
          settled = true;
          resolve({ status, headers, body: "" });
          return;
        }
        if (Number(headers["content-length"]) > maxBytes) {
          response.destroy();
          fail(
            new AuditError(
              "PAGE_TOO_LARGE",
              "The page exceeds this checker's safe reading limit. We haven't scored it.",
            ),
          );
          return;
        }
        if (
          headers["content-encoding"] &&
          headers["content-encoding"] !== "identity"
        ) {
          response.destroy();
          fail(
            new AuditError(
              "ENCODED_PAGE",
              "The server returned an encoded response this lightweight checker cannot inspect. We haven't scored it.",
            ),
          );
          return;
        }
        const chunks = [];
        let size = 0;
        response.on("data", (chunk) => {
          size += chunk.length;
          if (size > maxBytes) {
            response.destroy();
            fail(
              new AuditError(
                "PAGE_TOO_LARGE",
                "The page exceeds this checker's safe reading limit. We haven't scored it.",
              ),
            );
          } else chunks.push(chunk);
        });
        response.on("error", fail);
        response.on("end", () => {
          if (settled) return;
          settled = true;
          resolve({
            status,
            headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    req.on("error", fail);
    req.end();
  });
}

export async function safeFetch(
  input,
  {
    hosts,
    maxBytes = 1500000,
    signal,
    beforeRequest,
    resolver = lookup,
    request = requestPage,
  } = {},
) {
  let url = new URL(input);
  const trace = [];
  const seen = new Set();
  for (let hop = 0; hop <= 3; hop++) {
    validateUrl(url);
    if (hosts && !hosts.has(url.hostname))
      throw new AuditError(
        "OTHER_DOMAIN",
        "This website redirects to a different domain. Enter the final website address to check it.",
      );
    if (seen.has(url.href))
      throw new AuditError(
        "REDIRECT_LOOP",
        "This website has a redirect loop. Check its hosting and domain redirect settings.",
      );
    seen.add(url.href);
    if (signal?.aborted)
      throw new AuditError(
        "TIMEOUT",
        "The website took too long to respond. Try again later.",
      );
    if (beforeRequest) beforeRequest(url);
    const address = await resolvePublic(url.hostname, resolver);
    const result = await request(url, address, maxBytes, signal);
    trace.push({ url: url.origin + url.pathname, status: result.status });
    if ([301, 302, 303, 307, 308].includes(result.status)) {
      if (!result.headers.location)
        throw new AuditError(
          "INVALID_REDIRECT",
          "The website returned a redirect without a destination.",
        );
      url = new URL(result.headers.location, url);
      continue;
    }
    return { ...result, url: url.href, trace };
  }
  throw new AuditError(
    "TOO_MANY_REDIRECTS",
    "This website redirects too many times for the lightweight check. Enter its final address.",
  );
}
