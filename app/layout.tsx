import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import MusicPlayer from "@/components/music-player";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--ff-display",
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--ff-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Perfil Digital — tu tarjeta en línea sincronizada con Discord",
  description:
    "Tu perfil digital editable: mostrá quién sos, tu stack y tus proyectos, y enviá cada actualización directo a tu canal de Discord.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-ink text-bone antialiased">
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
