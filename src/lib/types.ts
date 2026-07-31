export type SocialIcon =
  | "github"
  | "discord"
  | "x"
  | "instagram"
  | "youtube"
  | "linkedin"
  | "tiktok"
  | "twitch"
  | "mail"
  | "globe";

export interface Skill {
  group: string;
  name: string;
  level: number; // 0–100
}

export interface Social {
  icon: SocialIcon;
  label: string;
  handle: string;
  url: string;
}

export type ProjectAccent = "brass" | "ember" | "mint";

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
  year: string;
  accent: ProjectAccent;
}

export interface ProfileData {
  name: string;
  tagline: string;
  about: string;
  location: string;
  availability: string;
  online: boolean;
  accent: string;
  skills: Skill[];
  socials: Social[];
  projects: Project[];
  discordWebhook: string;
  avatarUrl: string;
  bannerUrl: string;
}

export const THEMES = [
  { id: "oro", label: "Oro", hex: "#f2a93b" },
  { id: "menta", label: "Menta", hex: "#4fe0b0" },
  { id: "fuego", label: "Fuego", hex: "#ff6b5a" },
  { id: "hielo", label: "Hielo", hex: "#6fd3ff" },
  { id: "lima", label: "Lima", hex: "#9dff57" },
  { id: "rosa", label: "Rosa", hex: "#ff6b9d" },
];

export const SLUG_RE = /^[a-z0-9]{3,16}$/;

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "p",
  "u",
  "crear",
  "editar",
  "login",
  "signup",
  "panel",
  "web",
  "www",
  "app",
  "health",
  "perfil",
  "sync",
];

export const DEFAULT_PROFILE: ProfileData = {
  name: "ytk1",
  tagline: "creador de contenido · hacks y mods para Minecraft",
  about:
    "Soy ytk1, desde Sinaloa, México. Subo contenido de Minecraft a YouTube, desarrollo hacks y utilidades para el juego y creo mods propios con mecánicas que la comunidad pide. Si se puede romper en Minecraft, seguramente ya lo estoy probando.",
  location: "Sinaloa, México",
  availability: "Disponible",
  online: true,
  accent: "#f2a93b",
  skills: [
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
  ],
  avatarUrl: "",
  bannerUrl: "",
  socials: [
    { icon: "github", label: "GitHub", handle: "@ytk1we", url: "https://github.com/ytk1we" },
    { icon: "youtube", label: "YouTube", handle: "ytk1", url: "https://www.youtube.com/channel/UCLyTJuIOThAw7gEulpgGYvQ" },
    { icon: "tiktok", label: "TikTok", handle: "@.shxd_1", url: "https://www.tiktok.com/@.shxd_1" },
    { icon: "discord", label: "Discord", handle: ".shxd_2", url: "https://discord.com" },
  ],
  projects: [
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
  ],
  discordWebhook: "",
};

/** Contenido inicial para perfiles recién creados */
export function starterProfile(slug: string): ProfileData {
  return {
    name: slug,
    tagline: "nuevo en perfil//sync",
    about:
      "Acabo de crear mi perfil. Todavía estoy acomodando esto — vuelve pronto para ver mi stack, mis proyectos y mis redes.",
    location: "",
    availability: "Disponible",
    online: true,
    accent: "#4fe0b0",
    skills: [{ group: "General", name: "Por definir", level: 50 }],
    socials: [],
    projects: [],
    discordWebhook: "",
    avatarUrl: "",
    bannerUrl: "",
  };
}

export const STATS = [
  { value: "100+", label: "videos en el canal" },
  { value: "10+", label: "mods creados" },
  { value: "3", label: "proyectos activos" },
  { value: "∞", label: "horas de Minecraft" },
];

export const SOCIAL_ICONS: SocialIcon[] = [
  "github",
  "discord",
  "x",
  "instagram",
  "youtube",
  "linkedin",
  "tiktok",
  "twitch",
  "mail",
  "globe",
];

export const ACCENTS: ProjectAccent[] = ["brass", "ember", "mint"];
