import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProfileRecord } from "@/db/schema";
import type { Skill } from "@/lib/types";
import { STATS } from "@/lib/types";
import { countProfiles } from "@/lib/data";
import { LiveClock, Marquee, Reveal, ScrambleText } from "@/components/motion";
import {
  ArrowUpRight,
  PinIcon,
  RadioIcon,
  SOCIAL_ICON_MAP,
  ZapIcon,
} from "@/components/icons";

const ACCENT_TEXT: Record<string, string> = {
  brass: "text-brass",
  ember: "text-ember",
  mint: "text-mint",
};

/** Aclara un hex para el acento secundario */
function soften(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#f7c36f";
  const n = parseInt(clean, 16);
  const r = Math.round(((n >> 16) & 255) + (255 - ((n >> 16) & 255)) * 0.35);
  const g = Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * 0.35);
  const b = Math.round((n & 255) + (255 - (n & 255)) * 0.35);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function idNumber(seed: string): string {
  let hash = 7;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 999983;
  return String(hash).padStart(6, "0");
}

function Barcode() {
  const widths = [3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 5, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1];
  let x = 0;
  return (
    <svg viewBox="0 0 120 24" className="h-6 w-28 text-bone/70" aria-hidden>
      {widths.map((w, i) => {
        const rect = <rect key={i} x={x} y="0" width={w * 1.3} height="24" fill="currentColor" />;
        x += w * 1.3 + 2.2;
        return rect;
      })}
    </svg>
  );
}

const CREEPER_CELLS: Array<[number, number]> = [
  [1, 2], [2, 2], [1, 3], [2, 3],
  [5, 2], [6, 2], [5, 3], [6, 3],
  [3, 4], [4, 4],
  [2, 5], [3, 5], [4, 5], [5, 5],
  [2, 6], [3, 6], [4, 6], [5, 6],
  [2, 7], [5, 7],
];

function AvatarPlate({ profile }: { profile: ProfileRecord }) {
  const avatarUrl = (profile as unknown as { avatarUrl?: string }).avatarUrl?.trim();

  if (avatarUrl) {
    return (
      <div className="relative aspect-square w-full overflow-hidden bg-pine-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={`Avatar de ${profile.name}`}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
          }}
        />
        {/* corners overlay para que combine con la credencial */}
        <svg viewBox="0 0 400 400" className="pointer-events-none absolute inset-0 h-full w-full">
          <g stroke="var(--color-brass)" strokeWidth="3" fill="none">
            <path d="M14 38 V14 H38" />
            <path d="M362 14 H386 V38" />
            <path d="M386 362 V386 H362" />
            <path d="M38 386 H14 V362" />
          </g>
        </svg>
      </div>
    );
  }

  if (profile.slug === "ytk1") {
    const cell = 34;
    const offset = (400 - cell * 8) / 2;
    return (
      <svg viewBox="0 0 400 400" className="aspect-square w-full" role="img" aria-label="Avatar creeper de ytk1">
        <rect width="400" height="400" fill="#132620" />
        <g stroke="#1a332b" strokeWidth="1">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} />
          ))}
        </g>
        <g stroke="#f2a93b" strokeWidth="3" fill="none">
          <path d="M14 38 V14 H38" />
          <path d="M362 14 H386 V38" />
          <path d="M386 362 V386 H362" />
          <path d="M38 386 H14 V362" />
        </g>
        <g fill="#4fe0b0">
          {CREEPER_CELLS.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={offset + x * cell} y={offset + y * cell - 14} width={cell} height={cell} />
          ))}
        </g>
        <text x="200" y="372" textAnchor="middle" fill="#8faa9e" fontFamily="monospace" fontSize="15" letterSpacing="6">
          YTK1·MX
        </text>
      </svg>
    );
  }

  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <svg viewBox="0 0 400 400" className="aspect-square w-full" role="img" aria-label={`Avatar de ${profile.name}`}>
      <rect width="400" height="400" fill="#132620" />
      <g stroke="#1a332b" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} />
        ))}
      </g>
      <g stroke="var(--color-brass)" strokeWidth="3" fill="none">
        <path d="M14 38 V14 H38" />
        <path d="M362 14 H386 V38" />
        <path d="M386 362 V386 H362" />
        <path d="M38 386 H14 V362" />
      </g>
      <circle cx="200" cy="170" r="86" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeDasharray="4 8" />
      <text x="200" y="204" textAnchor="middle" fill="var(--color-brass)" fontFamily="monospace" fontSize="96" fontWeight="bold">
        {initials || "?"}
      </text>
      <text x="200" y="372" textAnchor="middle" fill="#8faa9e" fontFamily="monospace" fontSize="15" letterSpacing="6">
        /p/{profile.slug}
      </text>
    </svg>
  );
}

function Background() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-dots" />
        <div className="absolute -top-40 -left-40 h-[34rem] w-[34rem] animate-drift-a rounded-full bg-brass/10 blur-[130px]" />
        <div className="absolute -bottom-52 -right-40 h-[38rem] w-[38rem] animate-drift-b rounded-full bg-mint/8 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-[26rem] w-[26rem] rounded-full bg-pine-600/25 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,20,18,0.4),transparent_30%,transparent_70%,rgba(10,20,18,0.75))]" />
      </div>
      <div className="noise-overlay" />
    </>
  );
}

export async function CreatorBand() {
  const total = await countProfiles();
  return (
    <section className="border-y border-brass/30 bg-pine-900/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-10 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.28em] text-brass uppercase">
            perfil//sync · gratis para siempre
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight font-extrabold sm:text-4xl">
            ¿Querés tu propio link tipo{" "}
            <span className="text-brass">tunombre.web</span>?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-bone-dim">
            Creá tu perfil en 30 segundos, personalizalo a tu gusto y compartí tu
            link. Ya somos <strong className="text-bone">{total}</strong> perfiles en la plataforma.
          </p>
        </div>
        <Link
          href="/crear"
          className="group inline-flex items-center gap-3 bg-brass px-7 py-4 font-display text-base font-bold tracking-wide text-ink uppercase transition-all hover:bg-brass-soft hover:shadow-[0_10px_36px_-10px_rgba(242,169,59,0.6)] active:translate-y-0.5"
        >
          Crear mi perfil gratis
          <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}

export default async function ProfileView({
  profile,
  cta = true,
}: {
  profile: ProfileRecord;
  cta?: boolean;
}) {
  const connected = profile.discordWebhook.length > 0;
  const groups = new Map<string, Skill[]>();
  for (const skill of profile.skills) {
    const list = groups.get(skill.group) ?? [];
    list.push(skill);
    groups.set(skill.group, list);
  }
  const updated = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(profile.updatedAt);
  const marqueeItems = profile.skills.map((s) => s.name);

  const themeStyle = {
    "--color-brass": profile.accent,
    "--color-brass-soft": soften(profile.accent),
  } as CSSProperties;

  return (
    <div style={themeStyle}>
      <main className="relative z-10">
        <Background />

        {/* ---------- banner ---------- */}
        <section className="relative z-0">
          {(profile as unknown as { bannerUrl?: string }).bannerUrl?.trim() ? (
            // banner personalizado
            <div className="relative h-56 w-full overflow-hidden sm:h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={(profile as unknown as { bannerUrl: string }).bannerUrl}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/20 to-ink" />
            </div>
          ) : (
            // banner por defecto: geométrico con el acento
            <div
              className="relative h-44 w-full overflow-hidden sm:h-60"
              style={{
                background: `linear-gradient(115deg, ${profile.accent}22 0%, #0a1412 40%, ${profile.accent}18 100%)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <svg
                viewBox="0 0 1200 300"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M0 180 L200 120 L400 200 L650 90 L900 170 L1200 80 L1200 300 L0 300 Z"
                  fill="var(--color-brass)"
                  opacity="0.12"
                />
                <path
                  d="M0 220 L250 160 L500 240 L800 150 L1050 210 L1200 160 L1200 300 L0 300 Z"
                  fill="var(--color-brass)"
                  opacity="0.22"
                />
              </svg>
              <div className="absolute right-8 top-8 font-mono text-[11px] tracking-[0.28em] text-sage uppercase">
                /p/{profile.slug}
              </div>
            </div>
          )}
        </section>

        {/* ---------- barra superior ---------- */}
        <header className="sticky top-0 z-40 border-b border-pine-700/70 bg-ink/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
            <a href="/" className="group flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center border border-brass/60 bg-pine-900 font-display text-sm font-bold text-brass transition-colors group-hover:bg-brass group-hover:text-ink">
                p//s
              </span>
              <span className="font-mono text-[11px] tracking-[0.22em] text-sage uppercase">
                perfil<span className="text-brass">//</span>sync
              </span>
            </a>

            <nav className="hidden items-center gap-6 font-mono text-[11px] tracking-[0.18em] text-sage uppercase md:flex">
              <a href="#sobre-mi" className="transition-colors hover:text-brass">Sobre mí</a>
              <a href="#stack" className="transition-colors hover:text-brass">Stack</a>
              <a href="#proyectos" className="transition-colors hover:text-brass">Proyectos</a>
              <a href="#redes" className="transition-colors hover:text-brass">Redes</a>
              <Link href="/musica" className="flex items-center gap-1.5 border border-ember/50 px-2.5 py-1 text-ember transition-colors hover:bg-ember hover:text-ink">
                ♪ música
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <LiveClock className="hidden font-mono text-xs tabular-nums text-sage lg:block" />
              <Link
                href="/musica"
                aria-label="Ir a la radio"
                title="radio//ytk1"
                className="grid h-8 w-8 shrink-0 place-items-center border border-ember/60 font-display text-base font-bold text-ember transition-colors hover:bg-ember hover:text-ink"
              >
                ♪
              </Link>
              <Link
                href="/crear"
                className="hidden border border-brass/60 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-brass uppercase transition-colors hover:bg-brass hover:text-ink sm:block"
              >
                crear perfil
              </Link>
              <span className="flex items-center gap-2 border border-mint/40 bg-mint/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-mint uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                </span>
                en línea
              </span>
            </div>
          </div>
        </header>

        {/* ---------- apertura ---------- */}
        <section id="top" className="mx-auto max-w-6xl px-5 pt-14 pb-10 sm:px-8 lg:pt-20">
          <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-5 flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] text-brass uppercase">
                <span className="inline-block h-px w-10 bg-brass/70" />
                tarjeta digital · /p/{profile.slug}
              </p>
              <h1 className="font-display text-[13vw] leading-[0.95] font-extrabold tracking-tight sm:text-7xl lg:text-[5.2rem]">
                <ScrambleText text={profile.name} />
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone-dim sm:text-xl">
                {profile.tagline || "creando su propia esquina de internet"}
                <span className="animate-blink text-brass">▍</span>
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.14em] uppercase">
                {profile.location && (
                  <span className="flex items-center gap-2 border border-pine-600 bg-pine-900/80 px-3 py-2 text-sage">
                    <PinIcon className="h-3.5 w-3.5 text-brass" />
                    {profile.location}
                  </span>
                )}
                {profile.availability && (
                  <span className="flex items-center gap-2 border border-pine-600 bg-pine-900/80 px-3 py-2 text-sage">
                    <ZapIcon className="h-3.5 w-3.5 text-mint" />
                    {profile.availability}
                  </span>
                )}
                <span className="border border-pine-600 bg-pine-900/80 px-3 py-2 text-sage">
                  act. {updated}
                </span>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <a
                  href="#proyectos"
                  className="group inline-flex items-center gap-3 bg-brass px-6 py-3.5 font-display text-sm font-bold tracking-wide text-ink uppercase transition-all hover:bg-brass-soft hover:shadow-[0_10px_36px_-10px_rgba(242,169,59,0.6)] active:translate-y-0.5"
                >
                  Ver proyectos
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                {profile.isPrimary ? (
                  <Link
                    href="/editar"
                    className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase underline decoration-pine-600 underline-offset-8 transition-colors hover:text-brass hover:decoration-brass"
                  >
                    editar en el panel →
                  </Link>
                ) : (
                  <Link
                    href="/crear"
                    className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase underline decoration-pine-600 underline-offset-8 transition-colors hover:text-brass hover:decoration-brass"
                  >
                    quiero uno así →
                  </Link>
                )}
              </div>
            </div>

            {/* credencial */}
            <Reveal className="lg:justify-self-end" delay={150}>
              <div className="relative w-[min(21rem,100%)] animate-floaty border border-pine-600 bg-pine-900/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between border-b border-pine-700 px-5 py-3 font-mono text-[10px] tracking-[0.24em] text-sage uppercase">
                  <span>credencial digital</span>
                  <RadioIcon className="h-4 w-4 text-brass" />
                </div>
                <div className="relative m-5 overflow-hidden border border-pine-600 bg-pine-800">
                  <AvatarPlate profile={profile} />
                  <div className="scanlines pointer-events-none absolute inset-0" />
                </div>
                <div className="px-5 pb-5">
                  <p className="font-display text-2xl font-bold">{profile.name}</p>
                  <p className="mt-1 font-mono text-[11px] tracking-[0.16em] text-sage uppercase">
                    {(profile.tagline || "perfil//sync").slice(0, 46)}
                  </p>
                  <dl className="mt-4 space-y-2 border-t border-pine-700 pt-4 font-mono text-[11px]">
                    <div className="flex justify-between gap-4">
                      <dt className="tracking-[0.18em] text-sage uppercase">N° ID</dt>
                      <dd className="text-bone-dim">MX-{idNumber(profile.slug)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="tracking-[0.18em] text-sage uppercase">Base</dt>
                      <dd className="text-bone-dim">{profile.location || "Remoto"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="tracking-[0.18em] text-sage uppercase">Canal</dt>
                      <dd className={connected ? "flex items-center gap-1.5 text-mint" : "text-sage"}>
                        <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-mint" : "bg-sage/50"}`} />
                        {connected ? "Discord vinculado" : "sin vincular"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-end justify-between">
                    <Barcode />
                    <span className="stamp px-2 py-1 font-mono text-[9px] font-bold tracking-[0.2em] uppercase">
                      {profile.isPrimary ? "sync·ok" : "nuevo"}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- cinta de skills ---------- */}
        <section className="marquee-paused -rotate-1 border-y border-brass/30 bg-brass/8 py-4">
          <Marquee items={marqueeItems.length ? marqueeItems : ["hola", "nuevo perfil", "personalizable"]} />
        </section>

        {cta && <CreatorBand />}

        {/* ---------- sobre mí ---------- */}
        <section id="sobre-mi" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.28em] text-brass uppercase">01 / sobre mí</p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight font-bold sm:text-5xl">
              {profile.about
                ? profile.about.slice(0, 90).replace(/\.?$/, "") + "…"
                : "Todavía no escribió su historia"}
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <Reveal delay={100}>
              {profile.about ? (
                <p className="text-lg leading-relaxed text-bone-dim">{profile.about}</p>
              ) : (
                <p className="border border-dashed border-pine-600 px-5 py-8 text-center font-mono text-xs tracking-[0.18em] text-sage uppercase">
                  bio pendiente — el dueño está en eso
                </p>
              )}
              <p className="mt-6 border-l-2 border-brass/60 pl-5 font-mono text-sm leading-relaxed text-sage">
                &gt; Este perfil vive en{" "}
                <span className="text-brass">/p/{profile.slug}</span> — creado gratis en perfil//sync.
              </p>
            </Reveal>

            {profile.isPrimary && (
              <Reveal delay={200} className="grid grid-cols-2 gap-px border border-pine-700 bg-pine-700">
                {STATS.map((stat) => (
                  <div key={stat.label} className="group bg-ink p-6 transition-colors hover:bg-pine-900 sm:p-8">
                    <p className="font-display text-4xl font-extrabold text-bone transition-colors group-hover:text-brass sm:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-sage uppercase">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        </section>

        {/* ---------- stack ---------- */}
        <section id="stack" className="border-t border-pine-700/70 bg-pine-900/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.28em] text-brass uppercase">02 / stack</p>
                  <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Herramientas de la casa</h2>
                </div>
                <p className="max-w-xs font-mono text-[11px] leading-relaxed tracking-[0.14em] text-sage uppercase">
                  niveles auto-reportados, honestidad incluida
                </p>
              </div>
            </Reveal>

            {groups.size === 0 ? (
              <Reveal delay={100}>
                <p className="mt-12 border border-dashed border-pine-600 px-5 py-10 text-center font-mono text-xs tracking-[0.18em] text-sage uppercase">
                  sin skills cargadas todavía
                </p>
              </Reveal>
            ) : (
              <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[...groups.entries()].map(([group, skills], gi) => (
                  <Reveal key={group} delay={gi * 120} className="card-lift border border-pine-700 bg-ink/70 p-7">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-bone">{group}</h3>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-brass uppercase">
                        {String(gi + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <ul className="mt-6 space-y-5">
                      {skills.map((skill) => (
                        <li key={`${group}-${skill.name}`}>
                          <div className="mb-1.5 flex items-baseline justify-between gap-3">
                            <span className="text-sm font-medium text-bone-dim">{skill.name}</span>
                            <span className="font-mono text-[11px] text-sage tabular-nums">{skill.level}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden bg-pine-700">
                            <div
                              className="skill-fill h-full bg-gradient-to-r from-brass to-brass-soft"
                              style={{ "--w": `${skill.level}%` } as CSSProperties}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---------- proyectos ---------- */}
        <section id="proyectos" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.28em] text-brass uppercase">03 / proyectos</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">
              Cosas que ya están <span className="text-mint">girando</span>
            </h2>
          </Reveal>

          {profile.projects.length === 0 ? (
            <Reveal delay={100}>
              <p className="mt-12 border border-dashed border-pine-600 px-5 py-10 text-center font-mono text-xs tracking-[0.18em] text-sage uppercase">
                sin proyectos cargados — pronto hay material
              </p>
            </Reveal>
          ) : (
            <ul className="mt-12 border-t border-pine-700">
              {profile.projects.map((project, i) => (
                <Reveal as="li" key={project.title} delay={i * 80}>
                  <a
                    href={project.link || "#"}
                    target={project.link.startsWith("http") ? "_blank" : undefined}
                    rel={project.link.startsWith("http") ? "noreferrer" : undefined}
                    className="group link-slide grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-pine-700 py-7 sm:grid-cols-[4rem_1fr_auto_2rem] sm:gap-8"
                  >
                    <span className={`font-display text-3xl font-extrabold ${ACCENT_TEXT[project.accent] ?? "text-brass"} opacity-70 transition-opacity group-hover:opacity-100 sm:text-4xl`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="font-display text-2xl font-bold text-bone transition-colors group-hover:text-brass sm:text-3xl">
                          {project.title}
                        </span>
                        <span className="font-mono text-[11px] tracking-[0.18em] text-sage uppercase">{project.year}</span>
                      </span>
                      <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-bone-dim">
                        {project.description}
                      </span>
                      <span className="mt-3 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-pine-600 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-sage uppercase transition-colors group-hover:border-brass/40 group-hover:text-brass-soft"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="hidden sm:block" />
                    <span className="col-start-3 row-start-1 self-center justify-self-end text-sage transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-brass sm:col-start-4">
                      <ArrowUpRight className="h-6 w-6" />
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- redes ---------- */}
        <section id="redes" className="border-t border-pine-700/70 bg-pine-900/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <Reveal>
                <p className="font-mono text-[11px] tracking-[0.28em] text-brass uppercase">04 / redes</p>
                <h2 className="mt-3 font-display text-3xl leading-tight font-bold sm:text-5xl">
                  Escribime, <br />
                  <span className="text-outline font-extrabold">respondo rápido</span>
                </h2>
                <p className="mt-6 max-w-sm text-base leading-relaxed text-bone-dim">
                  Cada perfil carga sus propias redes desde su panel y aparecen acá al instante.
                </p>
              </Reveal>

              <Reveal delay={120}>
                {profile.socials.length === 0 ? (
                  <p className="border border-dashed border-pine-600 px-5 py-10 text-center font-mono text-xs tracking-[0.18em] text-sage uppercase">
                    sin redes cargadas por ahora
                  </p>
                ) : (
                  <ul className="border-t border-pine-700">
                    {profile.socials.map((social) => {
                      const Icon = SOCIAL_ICON_MAP[social.icon];
                      return (
                        <li key={`${social.label}-${social.handle}`}>
                          <a
                            href={social.url}
                            target={social.url.startsWith("http") ? "_blank" : undefined}
                            rel={social.url.startsWith("http") ? "noreferrer" : undefined}
                            className="group link-slide flex items-center gap-5 border-b border-pine-700 py-5"
                          >
                            <span className="grid h-11 w-11 shrink-0 place-items-center border border-pine-600 text-sage transition-all group-hover:border-brass/60 group-hover:text-brass">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-display text-lg font-bold text-bone transition-colors group-hover:text-brass">
                                {social.label}
                              </span>
                              <span className="block truncate font-mono text-xs text-sage">{social.handle}</span>
                            </span>
                            <ArrowUpRight className="h-5 w-5 shrink-0 text-sage transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-brass" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- pie ---------- */}
        {/* botón flotante a la radio — visible en todas las pantallas */}
        <Link
          href="/musica"
          className="fixed bottom-20 right-5 z-50 flex items-center gap-2.5 border border-ember/60 bg-ink/90 px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-ember uppercase shadow-[0_18px_44px_-18px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all hover:bg-ember hover:text-ink active:translate-y-0.5"
        >
          <span className="font-display text-base font-bold leading-none">♪</span>
          radio
        </Link>

        <footer className="border-t border-pine-700/70">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
            <p className="font-mono text-[11px] tracking-[0.16em] text-sage uppercase">
              © 2026 perfil//sync — {profile.name}
            </p>
            <div className="flex items-center gap-5 font-mono text-[11px] tracking-[0.16em] uppercase">
              <Link href="/musica" className="text-ember transition-colors hover:brightness-125">
                ♪ radio
              </Link>
              <Link href="/crear" className="text-brass transition-colors hover:text-brass-soft">
                crear perfil gratis
              </Link>
              <Link
                href="/editar"
                className="border border-pine-600 px-3 py-1.5 text-sage transition-colors hover:border-brass/60 hover:text-brass"
              >
                mi panel
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
