import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ensureSeed, slugTaken } from "@/lib/data";
import { RESERVED_SLUGS, SLUG_RE } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await ensureSeed();
  const slug = (request.nextUrl.searchParams.get("slug") ?? "")
    .trim()
    .toLowerCase();

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({
      available: false,
      reason: "Usá de 3 a 16 caracteres: letras minúsculas y números.",
    });
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json({ available: false, reason: "Ese nombre está reservado." });
  }
  if (await slugTaken(slug)) {
    return NextResponse.json({ available: false, reason: "Ya está ocupado." });
  }
  return NextResponse.json({ available: true, reason: null });
}
