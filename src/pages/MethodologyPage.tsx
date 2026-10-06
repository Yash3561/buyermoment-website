import {
  ArrowRight,
  ArrowUpRight,
  FileSearch,
  MessageSquareText,
  Wrench,
} from "lucide-react";

export function MethodologyPage() {
  return (
    <>
      <section className="container page-hero" aria-labelledby="method-heading">
        <p className="eyebrow">OUR METHODOLOGY</p>
        <h1 id="method-heading">
          Clear evidence.
          <br />
          Clear limits.
        </h1>
        <p className="page-intro">
          A website can be technically readable without appearing in the answers
          your customers see. We assess those questions separately and explain
          exactly what each result supports.
        </p>
      </section>
      <div className="container editorial-layout">
        <nav className="editorial-nav" aria-label="Methodology sections">
          <a href="#readiness">01 / Website readiness</a>
          <a href="#visibility">02 / AI visibility studies</a>
          <a href="#comparison">03 / Changes and comparison</a>
          <a href="#principles">04 / Reporting principles</a>
        </nav>
        <div className="editorial-body">
          <section id="readiness">
            <FileSearch size={25} aria-hidden="true" />
            <p className="eyebrow">01 / THE FREE WEBSITE CHECK</p>
            <h2>What a page lets us observe.</h2>
            <p>
              The current automated checker inspects a public HTTPS homepage and
              its robots.txt rules. It reads the initial HTML without executing
              the website’s JavaScript, signing in, or changing the site.
            </p>
            <ul>
              <li>
                Page access, limited same-site redirects, and crawl policies.
              </li>
              <li>
                Page-level indexing controls, title, description, and headings.
              </li>
              <li>Readable text and JSON-LD presence or syntax.</li>
            </ul>
            <p>
              Each report identifies its scope, method version, timestamp,
              source, evidence, interpretation, and next step. A scan failure is
              not a zero score. A missing JSON-LD block is not an automatic
              failure. Word-count thresholds are screening heuristics, not
              platform ranking rules.
            </p>
            <div className="method-status-key">
              <p>
                <strong>Observed</strong> A checked signal was present. This
                does not establish that the entire site is optimised.
              </p>
              <p>
                <strong>Review</strong> A specific finding deserves attention.
                Context or owner confirmation may change the recommendation.
              </p>
              <p>
                <strong>Note</strong> Useful context, a limitation, or an
                optional opportunity. Not a failed requirement.
              </p>
            </div>
            <p>
              A robots policy tells us what the published file permits. It does
              not prove that a real crawler reached the page. Search discovery
              and model-training permissions are assessed separately.
            </p>
            <p>
              Google states that its AI search features do not require special
              AI files or new machine-readable markup. We do not sell llms.txt
              or schema as a guaranteed path to recommendations.{" "}
              <a
                href="https://developers.google.com/search/docs/appearance/ai-features"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Google’s guidance{" "}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </p>
            <p>
              The public check does not collect live ChatGPT, Gemini,
              Perplexity, or Google AI answers. It cannot establish brand
              visibility, search rankings, traffic, conversions, or the quality
              of every page on a website.
            </p>
          </section>
          <section id="visibility">
            <MessageSquareText size={25} aria-hidden="true" />
            <p className="eyebrow">02 / A SEPARATELY SCOPED STUDY</p>
            <h2>What AI answers actually say.</h2>
            <p>
              For a visibility engagement, we agree the audience, buyer
              questions, competitors, platforms, location, and repeat count
              before collecting a baseline. We distinguish branded questions
              from discovery questions that do not name the business.
            </p>
            <p>
              Each observation records the exact prompt, time, platform or
              model, collection method, relevant settings, answer text, and
              citation URLs where available. A provider-collected response is
              labelled as such. An API response is not silently presented as a
              consumer-app screenshot or a personalised user experience.
            </p>
            <ul>
              <li>
                <strong>Mention rate:</strong> valid collected answers that
                explicitly name the brand, divided by valid answers in the
                stated sample.
              </li>
              <li>
                <strong>Recommendation rate:</strong> valid answers that
                actually recommend the brand, rather than simply mentioning it.
              </li>
              <li>
                <strong>Owned-source citation rate:</strong> valid answers with
                at least one citation to a verified owned domain, divided by
                valid answers in the sample.
              </li>
              <li>
                <strong>Listed position:</strong> reported only when the answer
                explicitly orders recommendations. Unranked prose is not
                assigned an invented rank.
              </li>
            </ul>
            <p>
              Reports show counts and denominators, with failed or unavailable
              observations listed separately. An answer without citations is
              different from a citation field we could not retrieve. We do not
              call a recommendation rate “market share” or claim it represents
              all AI users.
            </p>
            <p>
              A third-party citation is an opportunity to investigate, not proof
              that the page should mention the client. We inspect the actual
              page before describing a content gap or suggesting relevant,
              disclosed outreach.
            </p>
          </section>
          <section id="comparison">
            <Wrench size={25} aria-hidden="true" />
            <p className="eyebrow">03 / IMPLEMENTATION AND RETESTING</p>
            <h2>Record the changes. Repeat the checks.</h2>
            <p>
              Your team approves the content, technical changes, and publication
              route. We keep a change log with affected URLs and launch dates,
              then repeat the agreed measurement protocol after publication.
            </p>
            <p>
              Technical changes can be verified when deployed. Search indexing
              and AI answers may take longer and can vary between runs. We
              report the actual interval between baseline and retest, along with
              changes in platform behaviour, settings, or available data.
            </p>
            <p>
              A before-and-after difference does not, by itself, prove that our
              changes caused the difference. We describe unchanged findings and
              uncertainty alongside improvements. Broader claims need stronger
              evidence.
            </p>
          </section>
          <section id="principles">
            <p className="eyebrow">04 / THE STANDARD WE WORK TO</p>
            <h2>No evidence, no outcome claim.</h2>
            <ul>
              <li>
                No invented testimonials, endorsements, client logos, or
                historical results.
              </li>
              <li>
                No fabricated visibility scores or guaranteed recommendations.
              </li>
              <li>
                No automatic website changes or advertising spend from a free
                audit.
              </li>
              <li>No private agency records exposed to visitor accounts.</li>
              <li>Demonstration data is labelled on screen and in exports.</li>
              <li>Client examples are published only with permission.</li>
            </ul>
            <a className="button button-dark" href="/sample-report">
              Explore a sample report{" "}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </section>
        </div>
      </div>
    </>
  );
}
