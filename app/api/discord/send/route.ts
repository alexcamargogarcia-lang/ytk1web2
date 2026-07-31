import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ensureSeed, getProfileBySlug, logBroadcast, updateProfileBySlug } from "@/lib/data";
import { sendProfileToDiscord, sendTestToDiscord } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await ensureSeed();
  const slug = request.headers.get("x-profile-slug");
  if (!slug) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  const profile = await getProfileBySlug(slug);
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }
  if (!profile.discordWebhook) {
    return NextResponse.json(
      { error: "Primero guardá la URL del webhook del canal." },
      { status: 400 },
    );
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const kind = (body as { kind?: string }).kind === "test" ? "test" : "profile";

  const result =
    kind === "test"
      ? await sendTestToDiscord(profile.discordWebhook)
      : await sendProfileToDiscord(profile, profile.discordWebhook);

  await logBroadcast(profile.id, kind, result.ok ? "ok" : "error", result.message);
  if (result.ok) await updateProfileBySlug(slug, { lastSentAt: new Date() });
  return NextResponse.json({ result }, { status: result.ok ? 200 : 502 });
}
