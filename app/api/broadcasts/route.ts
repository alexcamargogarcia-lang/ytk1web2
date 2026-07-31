import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ensureSeed, getProfileBySlug, listBroadcasts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await ensureSeed();
  const slug = request.headers.get("x-profile-slug");
  if (!slug) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  const profile = await getProfileBySlug(slug);
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }
  const broadcasts = await listBroadcasts(profile.id, 14);
  return NextResponse.json({ broadcasts });
}
