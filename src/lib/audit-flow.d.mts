import type { Report } from "../components/WebsiteChecker";
export function googleSignInOptions(origin: string): {
  provider: "google";
  options: { redirectTo: string };
};
export function authReturnState(href: string): {
  failed: boolean;
  hasCode: boolean;
  cleanPath: string;
};
export function isReadinessReport(value: unknown): value is Report;
