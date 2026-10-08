export class AuditRequestError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status?: number);
}
export function requestAudit(options: {
  accessToken: string;
  website?: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<unknown>;
