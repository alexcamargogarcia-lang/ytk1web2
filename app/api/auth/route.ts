import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  hashPassword,
  SESSION_COOKIE,
  SESSION_DAYS,
  signToken,
  verifyToken,
} from "@/lib/auth";
import { getProfileBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const slug = await verifyToken(store.get(SESSION_COOKIE)?.value);
  if (!slug) return NextResponse.json({ authorized: false, slug: null });
  const profile = await getProfileBySlug(slug);
  if (!profile) return NextResponse.json({ authorized: false, slug: null });
  return NextResponse.json({
    authorized: true,
    slug: profile.slug,
    isPrimary: profile.isPrimary,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { slug, password } = body as { slug?: unknown; password?: unknown };
  if (typeof slug !== "string" || typeof password !== "string" || !slug || !password) {
    return NextResponse.json(
      { error: "Ingresá tu usuario y tu contraseña." },
      { status: 400 },
    );
  }

  const profile = await getProfileBySlug(slug.toLowerCase().trim());
  if (!profile) {
    return NextResponse.json(
      { error: "Ese usuario no existe. Podés crearlo gratis." },
      { status: 401 },
    );
  }
  const hash = await hashPassword(password);
  if (hash !== profile.passwordHash) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const token = await signToken(profile.slug);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return NextResponse.json({ authorized: true, slug: profile.slug });
}

export async function DELETE() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return NextResponse.json({ authorized: false });
}
