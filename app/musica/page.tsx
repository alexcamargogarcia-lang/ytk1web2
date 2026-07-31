import type { Metadata } from "next";
import Link from "next/link";
import MusicRadio from "@/components/music-radio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "radio//ytk1 — canciones completas",
  description:
    "Escuchá canciones completas de MegaR, Byaki Rap, Víctor Mendívil y Lana Del Rey. Buscá, adelantá y agregá tus propios links de YouTube.",
};

export default function MusicaPage() {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-dots" />
        <div className="absolute -top-40 -left-40 h-[34rem] w-[34rem] animate-drift-a rounded-full bg-ember/8 blur-[130px]" />
        <div className="absolute -bottom-52 -right-40 h-[38rem] w-[38rem] animate-drift-b rounded-full bg-[#a970ff]/10 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-[26rem] w-[26rem] rounded-full bg-pine-600/25 blur-[120px]" />
      </div>
      <div className="noise-overlay" />
      <Link
        href="/"
        className="fixed left-5 top-5 z-50 flex items-center gap-3 border border-pine-600 bg-ink/85 px-3.5 py-2 backdrop-blur-md transition-colors hover:border-brass/60"
      >
        <span className="grid h-7 w-7 place-items-center border border-brass/60 bg-pine-900 font-display text-xs font-bold text-brass">
          p//s
        </span>
        <span className="font-mono text-[10px] tracking-[0.22em] text-sage uppercase">
          ← volver al perfil
        </span>
      </Link>
      <MusicRadio />
    </main>
  );
}
