import type { Report } from "../components/WebsiteChecker";
export function signInErrorMessage(
  error: { code?: string; status?: number } | null | undefined,
  verifying?: boolean,
): string;
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
