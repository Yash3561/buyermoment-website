export function normalizeWebsite(value: string): string;
export function cleanOtp(value: string): string;
export function consumeScanIntent(
  intent: { website: string; accountId: string } | null,
  state: string,
  accountId: string,
): string | null;
export const websiteStorageKey: string;
