type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

function firstHeaderValue(value: string | string[] | null | undefined): string | null {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  return raw.split(",")[0]?.trim() || null;
}

export function clientIpFromHeaders(
  headers: { get(name: string): string | null }
): string | null {
  return (
    firstHeaderValue(headers.get("cf-connecting-ip")) ||
    firstHeaderValue(headers.get("x-forwarded-for")) ||
    firstHeaderValue(headers.get("x-real-ip"))
  );
}

export async function verifyTurnstileToken(
  token: unknown,
  remoteIp?: string | null
): Promise<boolean> {
  if (typeof token !== "string" || token.length === 0) {
    return false;
  }

  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    console.error("ENCRYPTION_KEY is missing; refusing auth request");
    return false;
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as SiteverifyResponse;
  return data.success === true;
}
