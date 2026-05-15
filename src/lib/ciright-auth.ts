/**
 * Ciright sign-in always uses the live API URL (local `next dev` and production).
 *
 * Set NEXA_CIRIGHT_LIVE_AUTH=false (or 0) to skip the remote call and accept any
 * credentials (cookie-only mock) — useful for offline UI work.
 */

const CIRIGHT_LOGIN_URL =
  "https://www.myciright.com/Ciright/api/commonrestapi/m1342055" as const;

const FIXED = {
  subscriptionId: 9329,
  verticalId: 18,
  appId: 2970,
  sphereTypeUrl: "nexapeople-analytics.htm",
} as const;

export function isCirightLiveAuthEnabled(): boolean {
  const v = process.env.NEXA_CIRIGHT_LIVE_AUTH?.trim().toLowerCase();
  if (v === "false" || v === "0") return false;
  return true;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isExplicitFailure(data: unknown): boolean {
  if (!isRecord(data)) return false;
  const r = data;
  if (r.success === false || r.Success === false) return true;
  if (r.isSuccess === false || r.IsSuccess === false) return true;
  if (typeof r.error === "string" && r.error.trim().length > 0) return true;
  if (typeof r.Error === "string" && r.Error.trim().length > 0) return true;
  if (typeof r.message === "string" && /invalid|fail|denied|unauthor|error/i.test(r.message)) {
    return true;
  }
  if (typeof r.Message === "string" && /invalid|fail|denied|unauthor|error/i.test(r.Message)) {
    return true;
  }
  return false;
}

function isExplicitSuccess(data: unknown): boolean {
  if (!isRecord(data)) return false;
  const r = data;
  if (r.success === true || r.Success === true) return true;
  if (r.isSuccess === true || r.IsSuccess === true) return true;
  if (r.token || r.Token || r.accessToken || r.AccessToken) return true;
  if (typeof r.status === "number" && r.status === 1) return true;
  if (typeof r.Status === "number" && r.Status === 1) return true;
  if (typeof r.statusCode === "number" && r.statusCode === 200) return true;
  return false;
}

/** Prefer a stable session value from Ciright when present; otherwise a placeholder. */
export function sessionValueFromCirightResponse(data: unknown): string {
  if (!isRecord(data)) return "1";
  const r = data;
  const t =
    r.token ??
    r.Token ??
    r.accessToken ??
    r.AccessToken ??
    r.SessionId ??
    r.sessionId ??
    r.authToken;
  if (typeof t === "string" && t.length > 0) {
    return t.length > 3800 ? t.slice(0, 3800) : t;
  }
  return "1";
}

export type CirightAuthResult =
  | { ok: true; sessionValue: string }
  | { ok: false; error: string };

export async function authenticateWithCiright(
  username: string,
  password: string
): Promise<CirightAuthResult> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(CIRIGHT_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...FIXED,
        username,
        password,
      }),
      signal: controller.signal,
    });

    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        if (!response.ok) {
          return { ok: false, error: "Sign-in service returned an invalid response." };
        }
        return { ok: false, error: "Sign-in service returned an unexpected response." };
      }
    }

    if (response.status === 401 || response.status === 403) {
      return { ok: false, error: "Invalid email or password." };
    }

    if (!response.ok) {
      return { ok: false, error: "Sign-in service is unavailable. Try again later." };
    }

    if (isExplicitFailure(data)) {
      return { ok: false, error: "Invalid email or password." };
    }

    if (isExplicitSuccess(data)) {
      return { ok: true, sessionValue: sessionValueFromCirightResponse(data) };
    }

    // HTTP 200 with JSON object/array and no explicit failure — treat as signed in.
    if (data !== null && data !== undefined) {
      return { ok: true, sessionValue: sessionValueFromCirightResponse(data) };
    }

    // Empty body on success — session cookie only (middleware checks presence).
    return { ok: true, sessionValue: "1" };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return { ok: false, error: "Sign-in timed out. Try again." };
    }
    return { ok: false, error: "Network error contacting sign-in service." };
  } finally {
    clearTimeout(t);
  }
}
