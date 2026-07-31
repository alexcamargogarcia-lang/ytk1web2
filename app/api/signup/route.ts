import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { hashPassword, SESSION_COOKIE, SESSION_DAYS, signToken } from "@/lib/auth";
import { createProfile, ensureSeed, slugTaken } from "@/lib/data";
import { RESERVED_SLUGS, SLUG_RE } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await ensureSeed();
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { slug, password, name } = body as {
    slug?: unknown;
    password?: unknown;
    name?: unknown;
  };

  const cleanSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
  if (!SLUG_RE.test(cleanSlug)) {
    return NextResponse.json(
      { error: "El nombre debe tener entre 3 y 16 caracteres: solo letras minúsculas y números." },
      { status: 400 },
    );
  }
  if (RESERVED_SLUGS.includes(cleanSlug)) {
    return NextResponse.json(
      { error: "Ese nombre está reservado. Probá con otro." },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || password.length < 4) {
    return NextResponse.json(
      { error: "La contraseña necesita al menos 4 caracteres." },
      { status: 400 },
    );
  }
  if (await slugTaken(cleanSlug)) {
    return NextResponse.json(
      { error: `"${cleanSlug}" ya está ocupado. Probá con otro.` },
      { status: 409 },
    );
  }

  const hash = await hashPassword(password);
  const profile = await createProfile(
    cleanSlug,
    hash,
    typeof name === "string" ? name.trim().slice(0, 40) : cleanSlug,
  );

  const token = await signToken(profile.slug);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return NextResponse.json({ slug: profile.slug, url: `/p/${profile.slug}` });
}
