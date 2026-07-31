import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCENTS, SOCIAL_ICONS, THEMES } from "@/lib/types";
import type { ProfileData, Project, Skill, Social } from "@/lib/types";
import { ensureSeed, getProfileBySlug, updateProfileBySlug } from "@/lib/data";
import { isValidWebhook } from "@/lib/discord";

export const dynamic = "force-dynamic";

const HEX_RE = /^#[0-9a-f]{6}$/i;

function sanitizeProfile(body: unknown): ProfileData | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "El cuerpo de la petición no es válido." };
  }
  const b = body as Record<string, unknown>;

  const str = (v: unknown, fallback = ""): string =>
    typeof v === "string" ? v.slice(0, 600) : fallback;

  const name = str(b.name).trim();
  if (!name) return { error: "El nombre no puede quedar vacío." };

  const skills: Skill[] = Array.isArray(b.skills)
    ? b.skills
        .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
        .slice(0, 40)
        .map((s) => ({
          group: str(s.group, "General") || "General",
          name: str(s.name) || "Skill",
          level: Math.max(0, Math.min(100, Number(s.level) || 0)),
        }))
    : [];

  const socials: Social[] = Array.isArray(b.socials)
    ? b.socials
        .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
        .slice(0, 12)
        .map((s) => ({
          icon: SOCIAL_ICONS.includes(s.icon as Social["icon"])
            ? (s.icon as Social["icon"])
            : "globe",
          label: str(s.label, "Red") || "Red",
          handle: str(s.handle),
          url: str(s.url),
        }))
    : [];

  const projects: Project[] = Array.isArray(b.projects)
    ? b.projects
        .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
        .slice(0, 12)
        .map((p) => ({
          title: str(p.title, "Proyecto") || "Proyecto",
          description: str(p.description),
          tags: Array.isArray(p.tags)
            ? p.tags.filter((t): t is string => typeof t === "string").slice(0, 8)
            : [],
          link: str(p.link),
          year: str(p.year, "2026"),
          accent: ACCENTS.includes(p.accent as Project["accent"])
            ? (p.accent as Project["accent"])
            : "brass",
        }))
    : [];

  const accent =
    typeof b.accent === "string" &&
    (HEX_RE.test(b.accent) || THEMES.some((t) => t.hex === b.accent))
      ? b.accent
      : "#f2a93b";

  const webhook = typeof b.discordWebhook === "string" ? b.discordWebhook.trim() : "";
  if (webhook && !isValidWebhook(webhook)) {
    return {
      error: "La URL del webhook no parece válida. Debe verse como https://discord.com/api/webhooks/…",
    };
  }

  const cleanUrl = (v: unknown): string => {
    if (typeof v !== "string") return "";
    const trimmed = v.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) return "";
    return trimmed.slice(0, 800);
  };

  return {
    name,
    tagline: str(b.tagline),
    about: str(b.about),
    location: str(b.location),
    availability: str(b.availability),
    online: b.online !== false,
    accent,
    skills,
    socials,
    projects,
    discordWebhook: webhook,
    avatarUrl: cleanUrl(b.avatarUrl),
    bannerUrl: cleanUrl(b.bannerUrl),
  };
}

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
  const { passwordHash: _secret, ...publicProfile } = profile;
  return NextResponse.json({ profile: publicProfile });
}

export async function PATCH(request: NextRequest) {
  await ensureSeed();
  const slug = request.headers.get("x-profile-slug");
  if (!slug) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const clean = sanitizeProfile(body);
  if ("error" in clean) {
    return NextResponse.json({ error: clean.error }, { status: 400 });
  }

  const profile = await updateProfileBySlug(slug, clean);
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }
  // Nada se envía a Discord al guardar: los envíos son siempre manuales desde el panel.
  return NextResponse.json({ profile, broadcast: null });
}
