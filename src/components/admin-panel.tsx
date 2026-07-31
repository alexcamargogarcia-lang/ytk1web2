"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { BroadcastRecord, ProfileRecord } from "@/db/schema";
import {
  ACCENTS,
  SOCIAL_ICONS,
  THEMES,
  type ProfileData,
  type Project,
  type ProjectAccent,
  type Skill,
  type Social,
  type SocialIcon,
} from "@/lib/types";
import {
  AlertIcon,
  CheckIcon,
  DiscordIcon,
  GlobeIcon,
  LockIcon,
  SendIcon,
  ZapIcon,
} from "@/components/icons";

type Toast = { id: number; message: string; tone: "ok" | "error" };

const inputCls =
  "w-full border border-pine-600 bg-ink px-3.5 py-2.5 text-sm text-bone placeholder:text-sage/50 outline-none transition-colors focus:border-brass/70 focus:bg-pine-900";
const labelCls =
  "mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-sage uppercase";
const btnPrimary =
  "inline-flex items-center gap-2.5 bg-brass px-5 py-3 font-display text-sm font-bold tracking-wide text-ink uppercase transition-all hover:bg-brass-soft active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center gap-2.5 border border-pine-600 px-5 py-3 font-display text-sm font-bold tracking-wide text-bone-dim uppercase transition-all hover:border-brass/60 hover:text-brass active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";

function timeAgo(iso: string | Date): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `hace ${hs} h`;
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" }).format(then);
}

function Section({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="border border-pine-700 bg-pine-900/60">
      <header className="flex items-center gap-3 border-b border-pine-700 px-6 py-4">
        <span className="font-mono text-[10px] tracking-[0.24em] text-brass uppercase">{index}</span>
        <h2 className="font-display text-lg font-bold text-bone">{title}</h2>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function AdminPanel() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [slug, setSlug] = useState("");
  const [log, setLog] = useState<BroadcastRecord[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<"test" | "profile" | null>(null);

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loginSlug, setLoginSlug] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const toast = useCallback((message: string, tone: Toast["tone"]) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const refreshLog = useCallback(async () => {
    const res = await fetch("/api/broadcasts");
    if (res.ok) {
      const data = (await res.json()) as { broadcasts: BroadcastRecord[] };
      setLog(data.broadcasts);
    }
  }, []);

  const loadAll = useCallback(async () => {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = (await res.json()) as { profile: ProfileRecord };
      const p = data.profile;
      setSlug(p.slug);
        setProfile({
          name: p.name,
          tagline: p.tagline,
          about: p.about,
          location: p.location,
          availability: p.availability,
          online: p.online,
          accent: p.accent,
          skills: p.skills,
          socials: p.socials,
          projects: p.projects,
          discordWebhook: p.discordWebhook,
          avatarUrl: (p as unknown as { avatarUrl?: string }).avatarUrl ?? "",
          bannerUrl: (p as unknown as { bannerUrl?: string }).bannerUrl ?? "",
        });
    }
    await refreshLog();
  }, [refreshLog]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth");
      const data = (await res.json()) as { authorized: boolean; slug: string | null };
      setAuthorized(data.authorized);
      if (data.authorized) {
        if (data.slug) setSlug(data.slug);
        await loadAll();
      }
    })();
  }, [loadAll]);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: loginSlug.toLowerCase().trim(), password }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        setAuthorized(true);
        setPassword("");
        await loadAll();
      } else {
        setAuthError(data.error ?? "No se pudo entrar.");
      }
    } catch {
      setAuthError("Error de red. Probá de nuevo.");
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthorized(false);
    setProfile(null);
    setLog([]);
  };

  const set = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast(data.error ?? "No se pudo guardar.", "error");
        return;
      }
      toast("Perfil guardado. Tu página pública ya muestra los cambios.", "ok");
    } catch {
      toast("Error de red al guardar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const sendToDiscord = async (kind: "test" | "profile") => {
    setSending(kind);
    try {
      const res = await fetch("/api/discord/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = (await res.json()) as {
        result?: { ok: boolean; message: string };
        error?: string;
      };
      const message = data.result?.message ?? data.error ?? "Algo salió mal.";
      toast(message, data.result?.ok ? "ok" : "error");
      await refreshLog();
    } catch {
      toast("Error de red al enviar.", "error");
    } finally {
      setSending(null);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link copiado al portapapeles.", "ok");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(url, "ok");
    }
  };

  if (authorized === null) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <p className="font-mono text-xs tracking-[0.24em] text-sage uppercase">
          verificando acceso<span className="animate-blink text-brass">▍</span>
        </p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-[62vh] items-start justify-end">
        <div className="w-[min(24rem,100%)] border border-brass/40 bg-pine-900/90 shadow-[0_30px_80px_-30px_rgba(242,169,59,0.35)]">
          <div className="flex items-center justify-between border-b border-pine-700 px-6 py-4">
            <span className="font-mono text-[10px] tracking-[0.24em] text-sage uppercase">
              acceso a tu panel
            </span>
            <LockIcon className="h-4 w-4 text-brass" />
          </div>
          <form onSubmit={login} className="space-y-4 p-6">
            <h2 className="font-display text-2xl leading-tight font-bold">
              Entrá a <span className="text-brass">tu perfil</span>
            </h2>
            <p className="text-sm leading-relaxed text-bone-dim">
              Usá el usuario que elegiste al crear tu perfil y tu contraseña.
            </p>
            <div key={authError ? "err" : "ok"} className={authError ? "animate-shake" : ""}>
              <label className={labelCls} htmlFor="login-slug">usuario</label>
              <input
                id="login-slug"
                className={inputCls}
                value={loginSlug}
                onChange={(e) => { setLoginSlug(e.target.value); setAuthError(""); }}
                placeholder="tunombre"
                autoFocus
              />
              <label className={`${labelCls} mt-3`} htmlFor="login-password">contraseña</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                className={`${inputCls} font-mono ${authError ? "border-ember/70" : ""}`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
                placeholder="••••••"
              />
              {authError && (
                <p className="mt-2 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-ember uppercase">
                  <AlertIcon className="h-3.5 w-3.5" /> {authError}
                </p>
              )}
            </div>
            <button type="submit" className={`${btnPrimary} w-full justify-center`} disabled={authBusy || !password || !loginSlug}>
              <LockIcon className="h-4 w-4" />
              {authBusy ? "Verificando…" : "Entrar al panel"}
            </button>
            <p className="text-center font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
              ¿no tenés perfil?{" "}
              <Link href="/crear" className="text-brass underline underline-offset-4 hover:text-brass-soft">
                crealo gratis
              </Link>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <p className="font-mono text-xs tracking-[0.24em] text-sage uppercase">
          cargando panel<span className="animate-blink text-brass">▍</span>
        </p>
      </div>
    );
  }

  const connected = profile.discordWebhook.length > 0;

  return (
    <>
      <div className="grid items-start gap-8 xl:grid-cols-[1fr_26rem]">
        {/* ==================== columna de edición ==================== */}
        <div className="space-y-6">
          <Section index="01" title="Identidad">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="name">Nombre *</label>
                <input id="name" className={inputCls} value={profile.name}
                  onChange={(e) => set("name", e.target.value)} placeholder="Tu nombre" />
              </div>
              <div>
                <label className={labelCls} htmlFor="location">Ubicación</label>
                <input id="location" className={inputCls} value={profile.location}
                  onChange={(e) => set("location", e.target.value)} placeholder="Tu ciudad" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="tagline">Bajada / tagline</label>
                <input id="tagline" className={inputCls} value={profile.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Qué hacés, en una línea" />
              </div>
              <div>
                <label className={labelCls} htmlFor="availability">Disponibilidad</label>
                <input id="availability" className={inputCls} value={profile.availability}
                  onChange={(e) => set("availability", e.target.value)}
                  placeholder="Disponible" />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => set("online", !profile.online)}
                  className={`flex w-full items-center justify-between border px-3.5 py-2.5 text-sm transition-colors ${
                    profile.online
                      ? "border-mint/50 bg-mint/10 text-mint"
                      : "border-ember/50 bg-ember/10 text-ember"
                  }`}
                >
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
                    estado: {profile.online ? "en línea" : "ausente"}
                  </span>
                  <span className={`h-2.5 w-2.5 rounded-full ${profile.online ? "bg-mint" : "bg-ember"}`} />
                </button>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="banner">URL del banner (encabezado de tu perfil)</label>
                <input id="banner" className={inputCls} value={profile.bannerUrl}
                  onChange={(e) => set("bannerUrl", e.target.value)}
                  placeholder="https://i.imgur.com/tubanner.jpg" />
                <p className="mt-1 font-mono text-[10px] tracking-[0.12em] text-sage uppercase">
                  recomendado: 1500×400px. Se usa como franja arriba de tu perfil.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="avatar">URL de tu avatar / foto</label>
                <input id="avatar" className={inputCls} value={profile.avatarUrl}
                  onChange={(e) => set("avatarUrl", e.target.value)}
                  placeholder="https://i.imgur.com/tuavatar.png" />
                <p className="mt-1 font-mono text-[10px] tracking-[0.12em] text-sage uppercase">
                  recomendado: cuadrado 512×512px. Si lo dejás vacío se muestra el avatar por defecto.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="about">Sobre mí</label>
                <textarea id="about" rows={5} className={`${inputCls} resize-y leading-relaxed`}
                  value={profile.about} onChange={(e) => set("about", e.target.value)}
                  placeholder="Contá quién sos y qué hacés…" />
              </div>
              <div className="sm:col-span-2">
                <span className={labelCls}>Color de tu perfil</span>
                <div className="flex flex-wrap items-center gap-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      title={theme.label}
                      onClick={() => set("accent", theme.hex)}
                      className={`h-9 w-9 border-2 transition-transform hover:scale-110 ${
                        profile.accent === theme.hex
                          ? "scale-110 border-bone"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: theme.hex }}
                    >
                      {profile.accent === theme.hex && (
                        <CheckIcon className="mx-auto h-4 w-4 text-ink" />
                      )}
                    </button>
                  ))}
                  <span className="font-mono text-[10px] tracking-[0.18em] text-sage uppercase">
                    tiñe botones, barras y detalles
                  </span>
                </div>
              </div>
            </div>
          </Section>

          <Section index="02" title="Stack y habilidades">
            <ul className="space-y-3">
              {profile.skills.map((skill, i) => (
                <li key={i} className="grid grid-cols-[1fr_1fr_7rem_auto] items-center gap-2 border border-pine-700 bg-ink/60 p-2.5">
                  <input className={inputCls} value={skill.group} placeholder="Grupo"
                    onChange={(e) => {
                      const next = [...profile.skills];
                      next[i] = { ...skill, group: e.target.value };
                      set("skills", next);
                    }} />
                  <input className={inputCls} value={skill.name} placeholder="Skill"
                    onChange={(e) => {
                      const next = [...profile.skills];
                      next[i] = { ...skill, name: e.target.value };
                      set("skills", next);
                    }} />
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} value={skill.level} className="w-full"
                      onChange={(e) => {
                        const next = [...profile.skills];
                        next[i] = { ...skill, level: Number(e.target.value) };
                        set("skills", next);
                      }} />
                    <span className="w-9 text-right font-mono text-[11px] text-sage tabular-nums">{skill.level}</span>
                  </div>
                  <button type="button" aria-label="Quitar skill"
                    className="grid h-9 w-9 place-items-center border border-pine-600 text-sage transition-colors hover:border-ember/60 hover:text-ember"
                    onClick={() => set("skills", profile.skills.filter((_, x) => x !== i))}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={`${btnGhost} mt-4 text-xs`}
              onClick={() => set("skills", [...profile.skills, { group: "General", name: "Nueva skill", level: 70 } as Skill])}>
              + agregar skill
            </button>
          </Section>

          <Section index="03" title="Redes y contacto">
            <ul className="space-y-3">
              {profile.socials.map((social, i) => (
                <li key={i} className="grid grid-cols-2 items-center gap-2 border border-pine-700 bg-ink/60 p-2.5 sm:grid-cols-[7.5rem_1fr_1fr_1.4fr_auto]">
                  <select className={inputCls} value={social.icon}
                    onChange={(e) => {
                      const next = [...profile.socials];
                      next[i] = { ...social, icon: e.target.value as SocialIcon };
                      set("socials", next);
                    }}>
                    {SOCIAL_ICONS.map((ic) => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                  <input className={inputCls} value={social.label} placeholder="Etiqueta"
                    onChange={(e) => {
                      const next = [...profile.socials];
                      next[i] = { ...social, label: e.target.value };
                      set("socials", next);
                    }} />
                  <input className={inputCls} value={social.handle} placeholder="@usuario"
                    onChange={(e) => {
                      const next = [...profile.socials];
                      next[i] = { ...social, handle: e.target.value };
                      set("socials", next);
                    }} />
                  <input className={inputCls} value={social.url} placeholder="https://…"
                    onChange={(e) => {
                      const next = [...profile.socials];
                      next[i] = { ...social, url: e.target.value };
                      set("socials", next);
                    }} />
                  <button type="button" aria-label="Quitar red"
                    className="grid h-9 w-9 place-items-center border border-pine-600 text-sage transition-colors hover:border-ember/60 hover:text-ember"
                    onClick={() => set("socials", profile.socials.filter((_, x) => x !== i))}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={`${btnGhost} mt-4 text-xs`}
              onClick={() => set("socials", [...profile.socials, { icon: "globe", label: "Web", handle: "@vos", url: "https://" } as Social])}>
              + agregar red
            </button>
          </Section>

          <Section index="04" title="Proyectos">
            <ul className="space-y-4">
              {profile.projects.map((project, i) => (
                <li key={i} className="space-y-2.5 border border-pine-700 bg-ink/60 p-3.5">
                  <div className="grid gap-2 sm:grid-cols-[1.4fr_5rem_6.5rem_auto]">
                    <input className={inputCls} value={project.title} placeholder="Título"
                      onChange={(e) => {
                        const next = [...profile.projects];
                        next[i] = { ...project, title: e.target.value };
                        set("projects", next);
                      }} />
                    <input className={inputCls} value={project.year} placeholder="Año"
                      onChange={(e) => {
                        const next = [...profile.projects];
                        next[i] = { ...project, year: e.target.value };
                        set("projects", next);
                      }} />
                    <select className={inputCls} value={project.accent}
                      onChange={(e) => {
                        const next = [...profile.projects];
                        next[i] = { ...project, accent: e.target.value as ProjectAccent };
                        set("projects", next);
                      }}>
                      {ACCENTS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    <button type="button" aria-label="Quitar proyecto"
                      className="grid h-9 w-9 place-items-center self-center border border-pine-600 text-sage transition-colors hover:border-ember/60 hover:text-ember"
                      onClick={() => set("projects", profile.projects.filter((_, x) => x !== i))}>
                      ✕
                    </button>
                  </div>
                  <textarea rows={2} className={`${inputCls} resize-y`} value={project.description}
                    placeholder="Descripción corta"
                    onChange={(e) => {
                      const next = [...profile.projects];
                      next[i] = { ...project, description: e.target.value };
                      set("projects", next);
                    }} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className={inputCls} value={project.tags.join(", ")}
                      placeholder="tags separados por coma"
                      onChange={(e) => {
                        const next = [...profile.projects];
                        next[i] = {
                          ...project,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        };
                        set("projects", next);
                      }} />
                    <input className={inputCls} value={project.link} placeholder="Link (https://…)"
                      onChange={(e) => {
                        const next = [...profile.projects];
                        next[i] = { ...project, link: e.target.value };
                        set("projects", next);
                      }} />
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className={`${btnGhost} mt-4 text-xs`}
              onClick={() =>
                set("projects", [
                  ...profile.projects,
                  { title: "Nuevo proyecto", description: "", tags: [], link: "https://", year: "2026", accent: "brass" } as Project,
                ])
              }>
              + agregar proyecto
            </button>
          </Section>

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className={btnPrimary} onClick={saveProfile} disabled={saving}>
              <CheckIcon className="h-4 w-4" />
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <Link href={`/p/${slug}`} className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase underline decoration-pine-600 underline-offset-8 transition-colors hover:text-brass">
              ver mi página ↗
            </Link>
            <span className="font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
              🔒 guardar no envía nada a ningún lado
            </span>
          </div>
        </div>

        {/* ==================== columna lateral ==================== */}
        <aside className="space-y-6 xl:sticky xl:top-24">
          {/* tu link */}
          <section className="border border-mint/40 bg-pine-900/80">
            <header className="flex items-center justify-between border-b border-pine-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <GlobeIcon className="h-5 w-5 text-mint" />
                <h2 className="font-display text-lg font-bold">Tu link</h2>
              </div>
              <span className="font-mono text-[10px] tracking-[0.18em] text-mint uppercase">gratis</span>
            </header>
            <div className="space-y-3 p-6">
              <p className="break-all border border-pine-600 bg-ink px-3.5 py-3 font-mono text-sm text-bone">
                /p/<span className="text-mint">{slug}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={copyLink} className={`${btnPrimary} justify-center !px-2 text-xs`}>
                  {copied ? "¡Copiado!" : "Copiar link"}
                </button>
                <Link href={`/p/${slug}`} className={`${btnGhost} justify-center !px-2 text-xs`}>
                  Abrir ↗
                </Link>
              </div>
              <p className="font-mono text-[10px] leading-relaxed tracking-[0.12em] text-sage uppercase">
                dominio propio gratis: <span className="text-mint">{slug}.web.app</span> con Firebase Hosting · o{" "}
                <span className="text-mint">{slug}.vercel.app</span>
              </p>
            </div>
          </section>

          {/* discord */}
          <section className="border border-brass/40 bg-pine-900/80">
            <header className="flex items-center justify-between border-b border-pine-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <DiscordIcon className="h-5 w-5 text-brass" />
                <h2 className="font-display text-lg font-bold">Conexión Discord</h2>
              </div>
              <span className={`flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase ${connected ? "text-mint" : "text-ember"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-mint" : "bg-ember"}`} />
                {connected ? "vinculado" : "sin canal"}
              </span>
            </header>

            <div className="space-y-5 p-6">
              <div>
                <label className={labelCls} htmlFor="webhook">URL del webhook del canal</label>
                <input id="webhook" className={`${inputCls} font-mono text-xs`}
                  value={profile.discordWebhook}
                  onChange={(e) => set("discordWebhook", e.target.value)}
                  placeholder="https://discord.com/api/webhooks/…" />
                <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-sage uppercase">
                  opcional · se guarda con «guardar cambios»
                </p>
              </div>

              <details className="group border border-pine-700 bg-ink/60">
                <summary className="cursor-pointer list-none px-4 py-3 font-mono text-[10px] tracking-[0.18em] text-sage uppercase transition-colors hover:text-brass">
                  ¿De dónde saco el webhook? <span className="text-brass">▾</span>
                </summary>
                <ol className="list-decimal space-y-1.5 border-t border-pine-700 px-4 py-3 pl-8 font-mono text-[11px] leading-relaxed text-bone-dim marker:text-brass">
                  <li>En Discord, clic derecho sobre el <strong className="text-bone">canal</strong>.</li>
                  <li><strong className="text-bone">Editar canal → Integraciones</strong>.</li>
                  <li>Creá un <strong className="text-bone">Webhook</strong> y copiá su URL.</li>
                  <li>Pegala acá y guardá. Ese canal queda vinculado.</li>
                </ol>
              </details>

              <div className="grid grid-cols-2 gap-2 border-t border-pine-700 pt-5">
                <button type="button" className={`${btnGhost} justify-center !px-2 text-xs`}
                  onClick={() => sendToDiscord("test")}
                  disabled={sending !== null || !connected}>
                  <ZapIcon className="h-4 w-4" />
                  {sending === "test" ? "Enviando…" : "Probar canal"}
                </button>
                <button type="button" className={`${btnPrimary} justify-center !px-2 text-xs`}
                  onClick={() => sendToDiscord("profile")}
                  disabled={sending !== null || !connected}>
                  <SendIcon className="h-4 w-4" />
                  {sending === "profile" ? "Enviando…" : "Enviar perfil"}
                </button>
              </div>
              {!connected && (
                <p className="flex items-start gap-2 font-mono text-[11px] leading-relaxed text-sage">
                  <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember" />
                  Sin webhook no se envía nada. Y aunque lo tengas, solo se envía cuando vos lo apretás.
                </p>
              )}
            </div>
          </section>

          {/* historial */}
          <section className="border border-pine-700 bg-pine-900/60">
            <header className="flex items-center justify-between border-b border-pine-700 px-6 py-4">
              <h2 className="font-display text-lg font-bold">Historial de envíos</h2>
              <button type="button" onClick={refreshLog}
                className="font-mono text-[10px] tracking-[0.18em] text-sage uppercase transition-colors hover:text-brass">
                ↻ actualizar
              </button>
            </header>
            <ul className="max-h-80 divide-y divide-pine-700/70 overflow-y-auto">
              {log.length === 0 && (
                <li className="px-6 py-6 font-mono text-[11px] tracking-[0.14em] text-sage uppercase">
                  todavía no hay envíos
                </li>
              )}
              {log.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 px-6 py-3.5">
                  <span className={`mt-1 grid h-6 w-6 shrink-0 place-items-center border ${entry.status === "ok" ? "border-mint/50 text-mint" : "border-ember/50 text-ember"}`}>
                    {entry.status === "ok" ? <CheckIcon className="h-3.5 w-3.5" /> : <AlertIcon className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] tracking-[0.18em] text-brass uppercase">
                        {entry.kind === "test" ? "prueba" : "perfil"}
                      </span>
                      <span className="font-mono text-[10px] text-sage">{timeAgo(entry.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-bone-dim">{entry.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {/* ---------- chip de sesión (esquina) ---------- */}
      <div className="fixed bottom-5 left-5 z-50 flex items-center gap-3 border border-pine-600 bg-ink/90 px-3.5 py-2 shadow-xl backdrop-blur-sm">
        <LockIcon className="h-3.5 w-3.5 text-mint" />
        <span className="font-mono text-[10px] tracking-[0.18em] text-sage uppercase">
          /p/{slug}
        </span>
        <button type="button" onClick={logout}
          className="border-l border-pine-600 pl-3 font-mono text-[10px] tracking-[0.18em] text-ember uppercase transition-colors hover:text-brass">
          salir
        </button>
      </div>

      {/* ---------- toasts ---------- */}
      <div className="pointer-events-none fixed right-5 bottom-5 z-50 flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto flex items-start gap-3 border px-4 py-3 shadow-xl backdrop-blur-sm ${
              t.tone === "ok"
                ? "border-mint/50 bg-pine-900/95 text-mint"
                : "border-ember/50 bg-pine-900/95 text-ember"
            }`}
          >
            {t.tone === "ok" ? <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />}
            <p className="text-sm leading-snug text-bone">{t.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}
