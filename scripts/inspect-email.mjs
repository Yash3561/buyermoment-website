import { resolveMx, resolveTxt } from "node:dns/promises";
const domain = "contextlumen.com";
for (const [label, read] of [
  ["MX", () => resolveMx(domain)],
  [
    "SPF",
    async () =>
      (await resolveTxt(domain))
        .map((x) => x.join(""))
        .filter((x) => x.startsWith("v=spf1")),
  ],
  [
    "DMARC",
    async () =>
      (await resolveTxt("_dmarc." + domain))
        .map((x) => x.join(""))
        .filter((x) => x.startsWith("v=DMARC1")),
  ],
]) {
  try {
    console.log(JSON.stringify({ check: label, records: await read() }));
  } catch (error) {
    console.log(JSON.stringify({ check: label, error: error.code }));
  }
}
console.log(
  "DNS verifies public routing and policy only, not individual inbox delivery or outbound signing. No email was sent.",
);
