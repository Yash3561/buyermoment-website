// Public contact address. Mailbox delivery is managed by the email provider.
export const site = {
  name: "ContextLumen",
  url: "https://www.contextlumen.com",
  email: "yashchaudhary@contextlumen.com",
  bookingUrl: calendarUrl(
    import.meta.env.VITE_CALENDLY_URL ??
      "https://calendly.com/yashchaudhary3561/30min",
  ),
};

function calendarUrl(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !["calendly.com", "www.calendly.com"].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.port ||
      !/^\/[^/]+\/[^/]+\/?$/.test(url.pathname)
    )
      return "";
    return url.origin + url.pathname;
  } catch {
    return "";
  }
}

export const contactEmailUrl =
  "mailto:" +
  site.email +
  "?subject=" +
  encodeURIComponent("A conversation with " + site.name) +
  "&body=" +
  encodeURIComponent(
    "Hi Yash,\n\nOur website: \nWho we want to reach: \nWhat we would like help with: \n\nA good time to talk: \n\nBest,\n",
  );

export const examples = [
  {
    name: "Software",
    source: "An example buyer question",
    quote:
      "Which project management tool works for a small team without a complicated migration?",
    highlight: "without a complicated migration",
    signal: "The buyer needs an answer about switching, as well as features.",
    angle: "Make the move understandable.",
    test: "Explain the migration steps, supported imports, and likely effort on a page buyers and search systems can read.",
    measure: "Relevant mentions, citations, and qualified demo enquiries",
    check: "Check migration claims with the product team before publishing.",
  },
  {
    name: "Commerce",
    source: "An example buyer question",
    quote:
      "What shoes can I wear to the office that are comfortable for a long walk home?",
    highlight: "comfortable for a long walk home",
    signal: "The buying context is a whole day, rather than a single feature.",
    angle: "Answer the everyday-use question.",
    test: "Bring fit, materials, care guidance, and relevant customer feedback together on the product page. Use that same evidence in campaign messaging.",
    measure: "Product citations, referral visits, and purchases",
    check:
      "Support comfort claims with product evidence and authorised reviews.",
  },
  {
    name: "Services",
    source: "An example buyer question",
    quote:
      "Which web design agency can help a local business and explain what happens after launch?",
    highlight: "what happens after launch",
    signal:
      "The buyer is comparing ongoing support as well as the initial project.",
    angle: "Show what working together involves.",
    test: "Clarify the process, service area, maintenance options, and scope on the service page, with accurate business details across public profiles.",
    measure: "Relevant recommendations and qualified project enquiries",
    check:
      "Confirm the service area and support commitments with the business.",
  },
];

export const deliverables = [
  {
    number: "01",
    title: "A baseline you can inspect",
    description:
      "A dated baseline of relevant search questions, the answers we observe, and the sources they cite. Clear findings, with the evidence attached.",
    detail: "Baseline & opportunity report",
  },
  {
    number: "02",
    title: "Changes ready for review",
    description:
      "Prioritised content, technical, and messaging improvements. We agree the scope with your team and help carry the work through.",
    detail: "Approved improvements & implementation",
  },
  {
    number: "03",
    title: "A comparison, not a promise",
    description:
      "Repeat the agreed checks and compare results. You receive a record of what shipped, what moved, and what deserves attention next.",
    detail: "Before-and-after review & next steps",
  },
];

export const faqs = [
  {
    question: "What do AEO and GEO actually mean?",
    answer:
      "Answer engine optimisation and generative engine optimisation are names for work that helps search engines and AI assistants find, understand, and use a business’s public information. In practice, we look at crawlability, useful content, accurate business details, and the sources that support an answer.",
  },
  {
    question: "What would our first project look like?",
    answer:
      "We start with one audience, one product or service, and a set of questions that matter to your buyers. We establish a baseline, agree the improvements, implement the approved work, and repeat the checks. Your proposal sets out the deliverables, responsibilities, timeline, and fees.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We discuss fees once we understand your website, priorities, and the work involved. You receive a written scope and proposal before committing. Advertising spend, if part of the engagement, is agreed separately from our service fees.",
  },
  {
    question: "Will we need a new website?",
    answer:
      "Often, the useful work can happen on the site you already have. We review the existing setup and work with your developers or approved access. Any changes to content, code, or configuration are agreed with your team first.",
  },
  {
    question: "How do you measure AI search visibility?",
    answer:
      "We agree a sample of buyer questions and record the platforms, dates, mentions, citations, and source URLs for each test. We repeat the same checks to make comparisons useful. Answers can vary between runs, so the report describes the sample and its limitations. Where you provide analytics access, we also review referrals and enquiries.",
  },
  {
    question: "Can you help with paid campaigns too?",
    answer:
      "We can scope customer research, messaging, campaign planning, and implementation support alongside search work. The proposed channel depends on your audience, budget, measurement setup, and account access. Access to emerging advertising platforms is confirmed before a campaign is proposed.",
  },
  {
    question: "Can you guarantee a mention or a ranking?",
    answer:
      "No. Search engines and AI platforms control their own answers and placements. We commit to the agreed work, document the changes, and report the observed results clearly. We use those results to decide what to try next.",
  },
];
