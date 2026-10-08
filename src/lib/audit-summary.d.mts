import type { Report } from "../components/WebsiteChecker";
export function summarizeAudit(report: Report): {
  headline: string;
  explanation: string;
  areas: {
    name: string;
    observed: number;
    review: number;
    notes: number;
    total: number;
  }[];
  priorities: Report["findings"];
  nextStep: string;
  visibility: string;
};
