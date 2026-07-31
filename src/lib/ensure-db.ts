/**
 * Creamos las tablas con SQL directo (IF NOT EXISTS) y sembramos el perfil del
 * dueño (ytk1) si no existe. Así no hace falta correr drizzle-kit push en
 * producción: cuando la app arranca se asegura sola.
 */
import { db } from "@/db";
import { sql } from "drizzle-orm";

const SKILLS = [
  { group: "Minecraft", name: "PvP & combate", level: 92 },
  { group: "Minecraft", name: "Redstone técnico", level: 76 },
  { group: "Minecraft", name: "Farmeo & granjas", level: 88 },
  { group: "Minecraft", name: "Conocimiento de versiones", level: 84 },
  { group: "Desarrollo", name: "Hacks / clientes", level: 90 },
  { group: "Desarrollo", name: "Java", level: 80 },
  { group: "Desarrollo", name: "Forge & Fabric", level: 83 },
  { group: "Desarrollo", name: "Python para tools", level: 66 },
  { group: "Contenido", name: "Edición de video", level: 86 },
  { group: "Contenido", name: "Miniaturas", level: 89 },
  { group: "Contenido", name: "OBS & directos", level: 78 },
];

const SOCIALS = [
  { icon: "github", label: "GitHub", handle: "@ytk1we", url: "https://github.com/ytk1we" },
  { icon: "youtube", label: "YouTube", handle: "ytk1", url: "https://www.youtube.com/channel/UCLyTJuIOThAw7gEulpgGYvQ" },
  { icon: "tiktok", label: "TikTok", handle: "@.shxd_1", url: "https://www.tiktok.com/@.shxd_1" },
  { icon: "discord", label: "Discord", handle: ".shxd_2", url: "https://discord.com" },
];

const PROJECTS = [
  {
    title: "YouTuber",
    description:
      "Canal de YouTube con contenido de Minecraft: hacks, mods, retos y todo lo que se rompa dentro del juego.",
    tags: ["YouTube", "Minecraft", "Contenido"],
    link: "https://www.youtube.com/channel/UCLyTJuIOThAw7gEulpgGYvQ",
    year: "activo",
    accent: "brass",
  },
  {
    title: "Hacks para MC",
    description:
      "Cliente con utilidades y hacks para Minecraft: PvP, movimiento, visuales y esas cosas que nadie explica cómo funcionan.",
    tags: ["Minecraft", "Cliente", "Java"],
    link: "https://github.com/ytk1we",
    year: "activo",
    accent: "mint",
  },
  {
    title: "Creador de mods",
    description:
      "Mods propios para Minecraft con items, mecánicas nuevas y cosas rotas que la comunidad va pidiendo.",
    tags: ["Mods", "Forge", "Fabric"],
    link: "https://github.com/ytk1we",
    year: "activo",
    accent: "ember",
  },
];

async function ownerPasswordHash(): Promise<string> {
  const password = process.env.PANEL_PASSWORD || "alexxx";
  const data = new TextEncoder().encode(`perfil-sync:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

let ensured = false;

export async function ensureDatabase(): Promise<void> {
  if (ensured) return;
  if (!process.env.DATABASE_URL) return;

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
        id            SERIAL PRIMARY KEY,
        slug          TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL DEFAULT '',
        is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
        name          TEXT NOT NULL DEFAULT '',
        tagline       TEXT NOT NULL DEFAULT '',
        about         TEXT NOT NULL DEFAULT '',
        location      TEXT NOT NULL DEFAULT '',
        availability  TEXT NOT NULL DEFAULT '',
        online        BOOLEAN NOT NULL DEFAULT TRUE,
        accent        TEXT NOT NULL DEFAULT '#f2a93b',
        skills        JSONB NOT NULL DEFAULT '[]'::jsonb,
        socials       JSONB NOT NULL DEFAULT '[]'::jsonb,
        projects      JSONB NOT NULL DEFAULT '[]'::jsonb,
        discord_webhook TEXT NOT NULL DEFAULT '',
        avatar_url      TEXT NOT NULL DEFAULT '',
        banner_url      TEXT NOT NULL DEFAULT '',
        last_sent_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- columnas nuevas para perfiles viejos
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT '';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT NOT NULL DEFAULT '';

      CREATE TABLE IF NOT EXISTS broadcasts (
        id         SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL,
        kind       TEXT NOT NULL DEFAULT 'profile',
        status     TEXT NOT NULL DEFAULT 'ok',
        detail     TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const existing = await db.execute(
      `SELECT id FROM profiles WHERE slug = 'ytk1' LIMIT 1`,
    );
    if ((existing.rowCount ?? 0) === 0) {
      const hash = await ownerPasswordHash();
      await db.execute(sql`
        INSERT INTO profiles (
          slug, password_hash, is_primary, name, tagline, about, location,
          availability, online, accent, skills, socials, projects, discord_webhook
        ) VALUES (
          'ytk1', ${hash}, TRUE, 'ytk1',
          'creador de contenido · hacks y mods para Minecraft',
          'Soy ytk1, desde Sinaloa, México. Subo contenido de Minecraft a YouTube, desarrollo hacks y utilidades para el juego y creo mods propios con mecánicas que la comunidad pide. Si se puede romper en Minecraft, seguramente ya lo estoy probando.',
          'Sinaloa, México', 'Disponible', TRUE, '#f2a93b',
          ${JSON.stringify(SKILLS)}::jsonb,
          ${JSON.stringify(SOCIALS)}::jsonb,
          ${JSON.stringify(PROJECTS)}::jsonb,
          ''
        )
      `);
    }

    ensured = true;
  } catch (err) {
    console.warn("[ensure-db] no se pudo preparar la base:", err);
  }
}
