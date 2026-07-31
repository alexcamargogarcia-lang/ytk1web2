import Link from "next/link";
import type { Metadata } from "next";
import AdminPanel from "@/components/admin-panel";
import { LiveClock } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi panel — perfil//sync",
  description: "Editá tu perfil digital y sincronizalo con tu canal de Discord.",
};

export default function EditarPage() {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-dots" />
        <div className="absolute -top-32 right-0 h-[28rem] w-[28rem] animate-drift-b rounded-full bg-brass/8 blur-[130px]" />
        <div className="absolute -bottom-40 -left-32 h-[30rem] w-[30rem] animate-drift-a rounded-full bg-mint/7 blur-[130px]" />
      </div>
      <div className="noise-overlay" />

      <header className="sticky top-0 z-40 border-b border-pine-700/70 bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center border border-brass/60 bg-pine-900 font-display text-sm font-bold text-brass">
              ⌘
            </span>
            <div>
              <p className="font-display text-base leading-tight font-bold">Panel de control</p>
              <p className="font-mono text-[10px] tracking-[0.22em] text-sage uppercase">
                perfil<span className="text-brass">//</span>sync
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LiveClock className="hidden font-mono text-xs tabular-nums text-sage sm:block" />
            <Link
              href="/musica"
              aria-label="Ir a la radio"
              className="grid h-8 w-8 place-items-center border border-ember/60 font-display text-base font-bold text-ember transition-colors hover:bg-ember hover:text-ink"
            >
              ♪
            </Link>
            <Link
              href="/"
              className="border border-pine-600 px-3 py-1.5 font-mono text-[11px] tracking-[0.16em] text-sage uppercase transition-colors hover:border-brass/60 hover:text-brass"
            >
              ← inicio
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] text-brass uppercase">
            <span className="inline-block h-px w-10 bg-brass/70" />
            edición en vivo
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Tu página se actualiza <span className="text-brass">al instante</span>
          </h1>
        </div>

        <AdminPanel />
      </div>
    </main>
  );
}
