/**
 * Sesiones firmadas con HMAC — funciona en edge (middleware) y en Node.
 * Nunca se guarda la contraseña en claro: solo su hash SHA-256.
 */
export const SESSION_COOKIE = "perfil_session";
export const SESSION_DAYS = 30;

const SECRET = process.env.SESSION_SECRET || "ytk1-perfil-sync-2026";

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`perfil-sync:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signToken(slug: string): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = btoa(`${slug}|${exp}`);
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifyToken(
  token: string | undefined | null,
): Promise<string | null> {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await hmac(payload);
  if (expected !== sig) return null;
  try {
    const decoded = atob(payload);
    const [slug, exp] = decoded.split("|");
    if (!slug || !exp) return null;
    if (Date.now() > Number(exp)) return null;
    return slug;
  } catch {
    return null;
  }
}
