import { load } from "cheerio";
import robotsParser from "robots-parser";
import { AuditError, normalizeWebsite, safeFetch } from "./safe-fetch.mjs";

export const VERSION = "homepage-readiness/1.0";
export const SOURCES = {
  google: "https://developers.google.com/search/docs/appearance/ai-features",
  robots:
    "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
  openai: "https://developers.openai.com/api/docs/bots",
  structured:
    "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
};
const compact = (value, limit = 280) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);

export function parseRobots(result) {
  if ([404, 410].includes(result.status))
    return {
      parser: robotsParser(result.url, ""),
      present: false,
      url: result.url,
      status: result.status,
      text: "",
    };
  if (
    result.status !== 200 ||
    /^text\/html/i.test(result.headers["content-type"] || "") ||
    /<!doctype html|<html[\s>]/i.test(result.body)
  )
    throw new AuditError(
      "ROBOTS_UNVERIFIED",
      "We couldn't verify this website's robots.txt rules. This is an incomplete check, not a low visibility score.",
    );
  return {
    parser: robotsParser(result.url, result.body),
    present: true,
    url: result.url,
    status: result.status,
    text: result.body,
  };
}

export function analysePage(page, robots, requestedUrl, now = new Date()) {
  if (page.status !== 200)
    throw new AuditError(
      "PAGE_UNAVAILABLE",
      "The homepage returned HTTP " +
        page.status +
        ". We can't assess content that we couldn't retrieve.",
    );
  if (
    !/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(
      page.headers["content-type"] || "",
    )
  )
    throw new AuditError(
      "NOT_HTML",
      "This address didn't return an HTML homepage.",
    );
  const $ = load(page.body);
  const title = compact($("title").first().text());
  const description = compact(
    $('meta[name="description" i]').first().attr("content"),
  );
  const h1s = $("h1")
    .map((_, el) => compact($(el).text()))
    .get()
    .filter(Boolean)
    .slice(0, 10);
  const robotTags = $(
    'meta[name="robots" i],meta[name="googlebot" i],meta[name="bingbot" i]',
  )
    .map((_, el) => ({
      agent: ($(el).attr("name") || "").toLowerCase(),
      value: compact($(el).attr("content")),
    }))
    .get();
  const directives = [
    ...robotTags.map((x) => x.agent + ": " + x.value),
    compact(page.headers["x-robots-tag"]),
  ].filter(Boolean);
  const noindex = directives.some((x) =>
    /\bnoindex\b|(?:^|[\s,:])none(?:$|[\s,])/i.test(x),
  );
  const noSnippet = directives.some((x) =>
    /\bnosnippet\b|\bmax-snippet\s*:\s*0\b/i.test(x),
  );
  const canonicalRaw = $('link[rel~="canonical" i]').first().attr("href");
  let canonical = "";
  try {
    if (canonicalRaw) canonical = new URL(canonicalRaw, page.url).href;
  } catch {
    /* reported as absent/invalid */
  }
  const schemaTypes = new Set();
  let jsonCount = 0,
    jsonInvalid = 0;
  const visit = (value, depth = 0) => {
    if (depth > 16 || !value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value.slice(0, 100)) visit(item, depth + 1);
      return;
    }
    const types = Array.isArray(value["@type"])
      ? value["@type"]
      : [value["@type"]];
    for (const type of types)
      if (typeof type === "string") schemaTypes.add(compact(type, 100));
    for (const child of Object.values(value))
      if (typeof child === "object") visit(child, depth + 1);
  };
  $('script[type="application/ld+json" i]').each((_, el) => {
    jsonCount++;
    try {
      visit(JSON.parse($(el).text()));
    } catch {
      jsonInvalid++;
    }
  });
  $(
    "script,style,noscript,template,svg,nav,footer,header,[hidden],[aria-hidden='true']",
  ).remove();
  const text = compact(
    $("main").length ? $("main").text() : $("body").text(),
    150000,
  );
  const words = text.split(/\s+/).filter(Boolean).length;
  if (
    /just a moment|verify you are human|checking your browser|access denied/i.test(
      title,
    ) &&
    words < 300
  )
    throw new AuditError(
      "BOT_CHALLENGE",
      "The website returned a bot challenge rather than its content. We haven't treated this as zero visibility.",
    );
  const findings = [];
  const add = (
    id,
    title,
    status,
    evidence,
    meaning,
    action,
    priority,
    source,
  ) =>
    findings.push({
      id,
      title,
      status,
      evidence,
      meaning,
      action,
      priority,
      source,
    });
  for (const [agent, label, source] of [
    ["Googlebot", "Google Search crawl rules", SOURCES.google],
    ["bingbot", "Bing crawl rules", SOURCES.robots],
    ["OAI-SearchBot", "ChatGPT search crawl rules", SOURCES.openai],
  ]) {
    const allowed = robots.parser.isAllowed(page.url, agent);
    add(
      "robots-" + agent.toLowerCase(),
      label,
      allowed === false ? "review" : "observed",
      (robots.present
        ? "robots.txt HTTP 200"
        : "No robots file (HTTP " + robots.status + ")") +
        "; " +
        agent +
        ": " +
        (allowed === false
          ? "disallowed for this URL"
          : "no disallow rule matched for this URL") +
        ".",
      "This is a declared robots.txt policy, not a test from the real crawler's IP or proof of indexing.",
      allowed === false
        ? "Confirm the block is intentional. If you want this public page discoverable, review the rule with your website team."
        : "Keep intended search access available and verify CDN/firewall behaviour separately.",
      allowed === false ? 1 : 4,
      source,
    );
  }
  add(
    "indexing",
    "Page-level indexing directives",
    noindex ? "review" : "observed",
    directives.join("; ") || "No robots meta tag or X-Robots-Tag observed.",
    "Any detected noindex/none directive deserves review; some may be agent-specific. Absence does not prove the page is indexed.",
    noindex
      ? "Confirm the intended audience of each directive before changing it. Don't remove deliberate privacy or staging exclusions."
      : "Use verified Search Console access to confirm actual indexing.",
    noindex ? 1 : 4,
    SOURCES.google,
  );
  add(
    "snippets",
    "Search snippet directives",
    noSnippet ? "review" : "observed",
    directives.join("; ") ||
      "No snippet restriction observed in page headers or robots meta tags.",
    "Snippet restrictions can affect how content is surfaced. This check does not inspect per-element data-nosnippet.",
    noSnippet
      ? "Review nosnippet/max-snippet settings with your content owner."
      : "Keep preview settings aligned with how you want public content shown.",
    noSnippet ? 1 : 4,
    SOURCES.google,
  );
  add(
    "title",
    "Page title",
    title ? "observed" : "review",
    title || "No non-empty title element found.",
    "A descriptive title helps explain the page. Presence alone doesn't establish quality or relevance.",
    title
      ? "Check that this accurately names the business and page."
      : "Add an accurate, descriptive page title.",
    title ? 4 : 2,
    SOURCES.google,
  );
  add(
    "description",
    "Page description",
    description ? "observed" : "review",
    description || "No non-empty meta description found.",
    "A description can help explain the offer, but isn't an AI ranking factor or a required inclusion signal.",
    description
      ? "Check the description against your actual offer."
      : "Write a concise, factual description of this page.",
    description ? 4 : 3,
    SOURCES.google,
  );
  add(
    "heading",
    "Main page heading",
    h1s.length ? "observed" : "review",
    h1s.length ? h1s.join(" | ") : "No non-empty H1 found in the initial HTML.",
    "We check that a main heading exists, not whether it answers buyers' questions. Multiple H1s aren't automatically a failure.",
    h1s.length
      ? "Review the heading for clarity and relevance to the visitor."
      : "Make the main page topic clear in an accessible heading.",
    h1s.length ? 4 : 2,
    SOURCES.google,
  );
  add(
    "text",
    "Text in the initial HTML",
    words >= 80 ? "observed" : "review",
    words +
      " approximate whitespace-separated words in main/body, excluding navigation, scripts and hidden attributes.",
    "80 words is our screening heuristic, not a platform requirement. We don't render JavaScript or evaluate content quality.",
    words >= 80
      ? "Verify that the important product or service facts are present and accurate."
      : "Check whether important content only appears after JavaScript. Provide useful initial HTML where appropriate.",
    words >= 80 ? 4 : 2,
    SOURCES.google,
  );
  const canonicalMatch =
    canonical && canonical.split("#")[0] === page.url.split("#")[0];
  add(
    "canonical",
    "Preferred page URL",
    canonicalMatch ? "observed" : "review",
    canonical || "No valid canonical link found.",
    "A missing or different canonical may be intentional; it isn't automatically an indexing blocker.",
    canonicalMatch
      ? "Keep redirects, sitemap URLs, and canonical tags consistent."
      : "Review this page's intended canonical URL and align it with your domain configuration.",
    canonicalMatch ? 4 : 3,
    SOURCES.google,
  );
  add(
    "structured",
    "JSON-LD structured data",
    jsonInvalid ? "review" : jsonCount ? "observed" : "note",
    jsonCount
      ? jsonCount +
          " block(s); " +
          jsonInvalid +
          " unparseable; types: " +
          ([...schemaTypes].join(", ") || "none detected") +
          "."
      : "No JSON-LD blocks observed. Other formats aren't checked.",
    "This is JSON syntax and type detection, not full schema validation. Special AI schema isn't required; markup must match visible facts.",
    jsonInvalid
      ? "Correct JSON syntax, then validate supported markup and its factual accuracy."
      : "Only add or expand relevant structured data when it accurately represents the visible page.",
    jsonInvalid ? 2 : 4,
    SOURCES.structured,
  );
  const trainingAllowed = robots.parser.isAllowed(page.url, "GPTBot") !== false;
  return {
    version: VERSION,
    checkedAt: now.toISOString(),
    requestedUrl: requestedUrl.href,
    finalUrl: page.url,
    scope: "Public homepage initial HTML and robots.txt only",
    evidence: {
      title,
      description,
      headings: h1s,
      words,
      schemaTypes: [...schemaTypes],
      redirects: page.trace,
      robotsUrl: robots.url,
      robotsStatus: robots.status,
    },
    findings,
    summary: {
      observed: findings.filter((x) => x.status === "observed").length,
      review: findings.filter((x) => x.status === "review").length,
      notes: findings.filter((x) => x.status === "note").length,
      total: findings.length,
    },
    training: {
      agent: "GPTBot",
      allowedByRobots: trainingAllowed,
      note: "Training permission is separate from search access. Blocking training is not counted as a readiness problem.",
    },
    limitations: [
      "No ChatGPT, Gemini, Perplexity, or other AI answer was queried. Mentions, citations, market share, and rankings are not measured.",
      "This is one homepage snapshot, not a site-wide audit. JavaScript rendering, actual indexing, real-crawler access, competitors, and conversions weren't tested.",
      "Checks use ContextLumen's published checklist, not a platform-certified score. An observed signal does not guarantee eligibility, recommendation, or traffic.",
    ],
  };
}

export async function runAudit(value, fetchPage = safeFetch) {
  const url = normalizeWebsite(value);
  const base = url.hostname.replace(/^www\./, "");
  const hosts = new Set([base, "www." + base]);
  const signal = AbortSignal.timeout(22000);
  const robotsResult = await fetchPage(new URL("/robots.txt", url), {
    hosts,
    maxBytes: 500000,
    signal,
  });
  const robots = parseRobots(robotsResult);
  const page = await fetchPage(url, {
    hosts,
    signal,
    beforeRequest: (next) => {
      if (robots.parser.isAllowed(next.href, "ContextLumenAudit") === false)
        throw new AuditError(
          "CRAWL_DECLINED",
          "This site's robots.txt does not permit our checker to read its homepage. We respect that choice and haven't produced a score.",
        );
    },
  });
  // A robots redirect to www and a homepage staying on apex must not be conflated.
  if (new URL(robots.url).origin !== new URL(page.url).origin)
    throw new AuditError(
      "ROBOTS_HOST_MISMATCH",
      "The homepage and robots file resolve to different hosts. Review the domain setup before treating the crawl rules as verified.",
    );
  return analysePage(page, robots, url);
}
