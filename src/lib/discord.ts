import type { ProfileRecord } from "@/db/schema";

export interface SendResult {
  ok: boolean;
  status: number;
  message: string;
}

const WEBHOOK_RE =
  /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+\/?$/;

export function isValidWebhook(url: string): boolean {
  return WEBHOOK_RE.test(url.trim());
}

export function channelHint(url: string): string | null {
  if (!isValidWebhook(url)) return null;
  const match = url.match(/webhooks\/(\d+)\//);
  return match ? match[1] : null;
}

const EMBED_COLOR = parseInt("f2a93b", 16); // brass

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  thumbnail?: { url: string };
  footer?: { text: string };
  timestamp?: string;
}

interface DiscordPayload {
  content?: string;
  username?: string;
  embeds?: DiscordEmbed[];
}

function buildProfileEmbed(profile: ProfileRecord): DiscordPayload {
  const topSkills = [...profile.skills]
    .sort((a, b) => b.level - a.level)
    .slice(0, 6)
    .map((s) => `${s.name} · ${s.level}%`)
    .join("\n");

  const socials = profile.socials
    .slice(0, 6)
    .map((s) => `[${s.label}](${s.url})`)
    .join(" · ");

  const fields: DiscordEmbedField[] = [];
  if (profile.location)
    fields.push({ name: "📍 Ubicación", value: profile.location, inline: true });
  if (profile.availability)
    fields.push({
      name: "🟢 Estado",
      value: profile.availability,
      inline: true,
    });
  if (topSkills) fields.push({ name: "⚡ Stack destacado", value: topSkills });
  if (profile.projects.length > 0) {
    fields.push({
      name: "🗂️ Último proyecto",
      value: `**${profile.projects[0].title}** — ${profile.projects[0].description.slice(0, 120)}…`,
    });
  }
  if (socials) fields.push({ name: "🔗 Redes", value: socials });

  return {
    username: "Perfil Digital",
    content: `📡 **${profile.name}** actualizó su perfil digital`,
    embeds: [
      {
        title: `${profile.name} — ${profile.tagline.slice(0, 80)}`,
        description: profile.about.slice(0, 300),
        color: EMBED_COLOR,
        fields,
        footer: { text: "Perfil Digital · enviado desde la web" },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function buildTestPayload(): DiscordPayload {
  return {
    username: "Perfil Digital",
    content:
      "✅ **Conexión establecida.** Tu web ya puede mandar mensajes a este canal.",
    embeds: [
      {
        title: "Canal vinculado correctamente",
        description:
          "Desde el panel de tu web (`/admin`) podés enviar tu perfil completo a este canal cuando quieras, o activar el envío automático al guardar cambios.",
        color: parseInt("4fe0b0", 16),
        footer: { text: "Perfil Digital · mensaje de prueba" },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export async function sendToDiscord(
  webhookUrl: string,
  payload: DiscordPayload,
): Promise<SendResult> {
  try {
    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return { ok: true, status: res.status, message: "Mensaje enviado al canal." };
    }
    if (res.status === 429) {
      return {
        ok: false,
        status: res.status,
        message: "Discord pidió esperar un poco (rate limit). Probá de nuevo en unos segundos.",
      };
    }
    return {
      ok: false,
      status: res.status,
      message: `Discord respondió ${res.status}. Revisá que el webhook siga activo en el canal.`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: `No se pudo conectar con Discord (${err instanceof Error ? err.message : "error de red"}).`,
    };
  }
}

export async function sendProfileToDiscord(
  profile: ProfileRecord,
  webhookUrl: string,
): Promise<SendResult> {
  return sendToDiscord(webhookUrl, buildProfileEmbed(profile));
}

export async function sendTestToDiscord(
  webhookUrl: string,
): Promise<SendResult> {
  return sendToDiscord(webhookUrl, buildTestPayload());
}
