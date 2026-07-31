import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-dots" />
        <div className="absolute -top-32 left-1/3 h-[26rem] w-[26rem] animate-drift-a rounded-full bg-brass/8 blur-[120px]" />
      </div>
      <div className="noise-overlay" />
      <div className="relative z-10 max-w-xl text-center">
        <p className="font-mono text-[11px] tracking-[0.28em] text-ember uppercase">
          error 404 · señal perdida
        </p>
        <h1 className="mt-4 font-display text-6xl font-extrabold tracking-tight sm:text-8xl">
          Este perfil <span className="text-outline">no existe</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-bone-dim">
          O el link está mal escrito, o ese nombre todavía está libre…
          podrías reclamarlo vos.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/crear"
            className="bg-brass px-6 py-3.5 font-display text-sm font-bold tracking-wide text-ink uppercase transition-all hover:bg-brass-soft active:translate-y-0.5"
          >
            Reclamar un nombre
          </Link>
          <Link
            href="/"
            className="font-mono text-[11px] tracking-[0.2em] text-sage uppercase underline decoration-pine-600 underline-offset-8 transition-colors hover:text-brass"
          >
            ← volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
