"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  AlertIcon,
  ArrowUpRight,
  CheckIcon,
  GlobeIcon,
  LockIcon,
  ZapIcon,
} from "@/components/icons";

const inputCls =
  "w-full border border-pine-600 bg-ink px-3.5 py-3 text-sm text-bone placeholder:text-sage/50 outline-none transition-colors focus:border-brass/70 focus:bg-pine-900";
const labelCls = "mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-sage uppercase";

type SlugState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok" }
  | { status: "taken"; reason: string };

const STEPS = [
  {
    n: "01",
    title: "Reclamá tu nombre",
    text: "Elegí tu usuario: será tu link para siempre. Letras minúsculas y números, de 3 a 16 caracteres.",
  },
  {
    n: "02",
    title: "Personalizalo a tu gusto",
    text: "Nombre, bio, ubicación, skills, proyectos, redes y hasta el color de tu página. Todo desde tu panel.",
  },
  {
    n: "03",
    title: "Compartí tu link",
    text: "Te damos /p/tunombre al instante. Y si querés dominio propio gratis: tunombre.web.app con Firebase o tunombre.vercel.app.",
  },
];

export default function CrearPage() {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [slugState, setSlugState] = useState<SlugState>({ status: "idle" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // verificación de disponibilidad en vivo
  useEffect(() => {
    if (!/^[a-z0-9]{3,16}$/.test(slug)) {
      setSlugState({ status: "idle" });
      return;
    }
    setSlugState({ status: "checking" });
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slugs/check?slug=${encodeURIComponent(slug)}`);
        const data = (await res.json()) as { available: boolean; reason: string | null };
        setSlugState(
          data.available
            ? { status: "ok" }
            : { status: "taken", reason: data.reason ?? "No disponible." },
        );
      } catch {
        setSlugState({ status: "idle" });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [slug]);

  const canSubmit =
    slugState.status === "ok" && password.length >= 4 && !busy;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password, name }),
      });
      const data = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok || !data.slug) {
        setError(data.error ?? "No se pudo crear el perfil.");
        return;
      }
      setCreated(data.slug);
    } catch {
      setError("Error de red. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${created}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-dots" />
        <div className="absolute -top-32 right-0 h-[28rem] w-[28rem] animate-drift-b rounded-full bg-brass/8 blur-[130px]" />
        <div className="absolute -bottom-40 -left-32 h-[30rem] w-[30rem] animate-drift-a rounded-full bg-mint/7 blur-[130px]" />
      </div>
      <div className="noise-overlay" />

      <header className="sticky top-0 z-40 border-b border-pine-700/70 bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center border border-brass/60 bg-pine-900 font-display text-sm font-bold text-brass">
              p//s
            </span>
            <span className="font-mono text-[11px] tracking-[0.22em] text-sage uppercase">
              perfil<span className="text-brass">//</span>sync
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/musica"
              aria-label="Ir a la radio"
              className="grid h-8 w-8 place-items-center border border-ember/60 font-display text-base font-bold text-ember transition-colors hover:bg-ember hover:text-ink"
            >
              ♪
            </Link>
            <Link
              href="/editar"
              className="border border-pine-600 px-3 py-1.5 font-mono text-[11px] tracking-[0.16em] text-sage uppercase transition-colors hover:border-brass/60 hover:text-brass"
            >
              ya tengo perfil →
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ---------- pitch + pasos ---------- */}
          <div>
            <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] text-brass uppercase">
              <span className="inline-block h-px w-10 bg-brass/70" />
              gratis · sin tarjeta · 30 segundos
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-7xl">
              Reclamá
              <br />
              tu <span className="text-brass">nombre</span>
              <span className="animate-blink text-brass">_</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-bone-dim">
              Tu propia página tipo{" "}
              <strong className="text-bone">tunombre.web</strong>, con tu info, tus
              proyectos y tus redes — personalizada a tu gusto.
            </p>

            <ol className="mt-12 border-t border-pine-700">
              {STEPS.map((step, i) => (
                <li
                  key={step.n}
                  className="group grid grid-cols-[4.5rem_1fr] gap-4 border-b border-pine-700 py-6 transition-colors hover:bg-pine-900/50"
                  style={{ paddingLeft: `${i * 1.25}rem` }}
                >
                  <span className="font-display text-4xl font-extrabold text-pine-600 transition-colors group-hover:text-brass">
                    {step.n}
                  </span>
                  <span>
                    <span className="font-display text-xl font-bold text-bone">
                      {step.title}
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-bone-dim">
                      {step.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex items-start gap-4 border border-mint/30 bg-mint/5 p-5">
              <GlobeIcon className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
              <p className="font-mono text-[11px] leading-relaxed tracking-[0.12em] text-sage">
                <span className="text-mint">¿DOMINIO PROPIO GRATIS?</span> El TLD{" "}
                <span className="text-bone">.web</span> puro no existe en venta, pero la
                versión real y gratuita es{" "}
                <span className="text-mint">tunombre.web.app</span> (Firebase Hosting, $0) o{" "}
                <span className="text-mint">tunombre.vercel.app</span> (Vercel, $0). Apuntás el
                dominio a esta web y listo: tu link queda corto y pro.
              </p>
            </div>
          </div>

          {/* ---------- formulario / éxito ---------- */}
          <div className="lg:pt-16">
            {created ? (
              <div className="border border-mint/50 bg-pine-900/90 shadow-[0_30px_80px_-30px_rgba(79,224,176,0.3)]">
                <div className="flex items-center justify-between border-b border-pine-700 px-6 py-4">
                  <span className="font-mono text-[10px] tracking-[0.24em] text-mint uppercase">
                    perfil creado ✓
                  </span>
                  <CheckIcon className="h-4 w-4 text-mint" />
                </div>
                <div className="space-y-5 p-6">
                  <div>
                    <p className="font-display text-3xl font-extrabold">
                      /p/<span className="text-mint">{created}</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-bone-dim">
                      Ese es tu link. Ya está vivo — compartilo donde quieras.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={copyLink}
                      className="inline-flex items-center justify-center gap-2 bg-mint px-4 py-3 font-display text-sm font-bold text-ink uppercase transition-all hover:brightness-110 active:translate-y-0.5">
                      {copied ? "¡Copiado!" : "Copiar link"}
                    </button>
                    <Link href={`/p/${created}`}
                      className="inline-flex items-center justify-center gap-2 border border-pine-600 px-4 py-3 font-display text-sm font-bold text-bone uppercase transition-colors hover:border-mint/60 hover:text-mint">
                      Ver perfil <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <Link href="/editar"
                    className="flex w-full items-center justify-center gap-2 bg-brass px-4 py-3.5 font-display text-sm font-bold text-ink uppercase transition-all hover:bg-brass-soft active:translate-y-0.5">
                    <ZapIcon className="h-4 w-4" />
                    Ir a mi panel y personalizar
                  </Link>
                  <p className="font-mono text-[10px] leading-relaxed tracking-[0.14em] text-sage uppercase">
                    entrás con <span className="text-bone">{created}</span> + la contraseña que elegiste
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="border border-brass/40 bg-pine-900/90 shadow-[0_30px_80px_-30px_rgba(242,169,59,0.3)]">
                <div className="flex items-center justify-between border-b border-pine-700 px-6 py-4">
                  <span className="font-mono text-[10px] tracking-[0.24em] text-sage uppercase">
                    nuevo perfil
                  </span>
                  <LockIcon className="h-4 w-4 text-brass" />
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <label className={labelCls} htmlFor="slug">tu nombre de usuario *</label>
                    <div className="flex">
                      <span className="grid place-items-center border border-r-0 border-pine-600 bg-pine-800 px-3 font-mono text-sm text-sage">
                        /p/
                      </span>
                      <input
                        id="slug"
                        className={`${inputCls} font-mono`}
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                        placeholder="tunombre"
                        maxLength={16}
                        autoFocus
                      />
                    </div>
                    <p className={`mt-2 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase ${
                      slugState.status === "ok"
                        ? "text-mint"
                        : slugState.status === "taken"
                          ? "text-ember"
                          : "text-sage"
                    }`}>
                      {slugState.status === "ok" && (
                        <><CheckIcon className="h-3.5 w-3.5" /> disponible — es tuyo</>
                      )}
                      {slugState.status === "taken" && (
                        <><AlertIcon className="h-3.5 w-3.5" /> {slugState.reason}</>
                      )}
                      {slugState.status === "checking" && "verificando…"}
                      {slugState.status === "idle" && "3–16 caracteres · minúsculas y números"}
                    </p>
                  </div>

                  <div>
                    <label className={labelCls} htmlFor="name">nombre para mostrar</label>
                    <input id="name" className={inputCls} value={name}
                      onChange={(e) => setName(e.target.value.slice(0, 40))}
                      placeholder="Cómo querés aparecer (opcional)" />
                  </div>

                  <div>
                    <label className={labelCls} htmlFor="password">contraseña *</label>
                    <input id="password" type="password" autoComplete="new-password"
                      className={`${inputCls} font-mono`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="mínimo 4 caracteres" />
                  </div>

                  {error && (
                    <p key={error} className="animate-shake flex items-center gap-2 border border-ember/50 bg-ember/10 px-3 py-2.5 font-mono text-[11px] tracking-[0.12em] text-ember uppercase">
                      <AlertIcon className="h-3.5 w-3.5 shrink-0" /> {error}
                    </p>
                  )}

                  <button type="submit" disabled={!canSubmit}
                    className="flex w-full items-center justify-center gap-2.5 bg-brass px-5 py-3.5 font-display text-sm font-bold tracking-wide text-ink uppercase transition-all hover:bg-brass-soft active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
                    <ZapIcon className="h-4 w-4" />
                    {busy ? "Creando…" : "Crear mi perfil gratis"}
                  </button>
                  <p className="text-center font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
                    al crearlo quedás con sesión iniciada en tu panel
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
