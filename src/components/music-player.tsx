"use client";

/**
 * Reproductor de música usando la IFrame Player API de YouTube.
 * - Se carga 1 sola vez en el layout.
 * - Los navegadores bloquean autoplay con sonido sin interacción, así que
 *   esperamos al primer clic/keydown/touch del usuario para arrancar con audio.
 * - El botón flotante permite pausar/reanudar manualmente.
 * - La preferencia (play/pausa) se recuerda en localStorage.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const VIDEO_ID = "uNuMH2i6wdI";
const STORAGE_KEY = "perfil-sync:music";
const DEFAULT_VOLUME = 35;

type YT = {
  Player: new (
    el: HTMLElement,
    opts: {
      height: number;
      width: number;
      videoId: string;
      playerVars?: {
        autoplay?: 0 | 1;
        controls?: 0 | 1;
        disablekb?: 0 | 1;
        loop?: 0 | 1;
        playlist?: string;
        modestbranding?: 1;
        origin?: string;
        playsinline?: 1;
        rel?: 0;
        volume?: number;
      };
      events?: {
        onReady?: (e: { target: PlayerInstance }) => void;
        onStateChange?: (e: { target: PlayerInstance; data: number }) => void;
        onError?: () => void;
      };
    },
  ) => PlayerInstance;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING: number;
    CUED: number;
  };
};

type PlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getPlayerState: () => number;
  loadVideoById: (id: string) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PREFERRED_WHEN_PLAYING = "playing";

export default function MusicPlayer() {
  const pathname = usePathname();
  const isRadio = pathname?.startsWith("/musica");
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<PlayerInstance | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [muted, setMuted] = useState(false);
  const triggeredRef = useRef(false);

  const setPreference = (state: "playing" | "paused") => {
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch {
      /* noop */
    }
  };

  const readPreference = (): "playing" | "paused" | null => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "playing" || v === "paused") return v;
    } catch {
      /* noop */
    }
    return null;
  };

  const start = useCallback(() => {
    if (!playerRef.current || triggeredRef.current) return;
    triggeredRef.current = true;
    const player = playerRef.current;
    try {
      player.unMute();
      player.setVolume(DEFAULT_VOLUME);
      player.playVideo();
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const state = p.getPlayerState();
    if (state === window.YT?.PlayerState.PLAYING) {
      p.pauseVideo();
      setPlaying(false);
      setPreference("paused");
    } else {
      triggeredRef.current = true;
      p.unMute();
      p.setVolume(DEFAULT_VOLUME);
      p.playVideo();
      setPlaying(true);
      setPreference(PREFERRED_WHEN_PLAYING);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (isRadio) return;

    function loadAPI(): Promise<void> {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve();
          return;
        }
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src="https://www.youtube.com/iframe_api"]',
        );
        if (!existing) {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(tag);
        }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve();
        };
      });
    }

    async function init() {
      await loadAPI();
      if (cancelled || !mountRef.current || !window.YT) return;
      const pref = readPreference();

      const player = new window.YT.Player(mountRef.current, {
        height: 0,
        width: 0,
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          loop: 1,
          playlist: VIDEO_ID, // necesario para que loop funcione
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            playerRef.current = e.target;
            setLoading(false);
            try {
              e.target.setVolume(DEFAULT_VOLUME);
              e.target.mute();
            } catch {
              /* ignore */
            }
            // Si el usuario ya había dado play antes, intentamos arrancar
            // silenciado hasta la primera interacción (la política de autoplay lo requiere).
            if (pref !== "paused") {
              try {
                e.target.playVideo();
              } catch {
                /* ignore */
              }
            }
          },
          onStateChange: (e) => {
            const yt = window.YT;
            if (!yt) return;
            if (e.data === yt.PlayerState.PLAYING) {
              setPlaying(true);
              setMuted(e.target.isMuted());
            } else if (
              e.data === yt.PlayerState.PAUSED ||
              e.data === yt.PlayerState.ENDED
            ) {
              setPlaying(false);
            }
          },
          onError: () => setError(true),
        },
      });

      // Si el usuario nunca interactuó pero había preferencia playing,
      // arrancamos al primer clic/keydown/touch en cualquier parte.
      const onFirstInteract = () => {
        start();
        window.removeEventListener("pointerdown", onFirstInteract);
        window.removeEventListener("keydown", onFirstInteract);
        window.removeEventListener("touchstart", onFirstInteract);
      };
      if (pref !== "paused") {
        window.addEventListener("pointerdown", onFirstInteract, { once: true });
        window.addEventListener("keydown", onFirstInteract, { once: true });
        window.addEventListener("touchstart", onFirstInteract, { once: true });
      }
    }

    init().catch(() => setError(true));
    return () => {
      cancelled = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          /* noop */
        }
        playerRef.current = null;
      }
    };
  }, [start]);

  if (error || isRadio) return null;

  return (
    <>
      {/* YouTube mount point — cero tamaño, totalmente oculto */}
      <div
        ref={mountRef}
        aria-hidden
        className="pointer-events-none fixed -z-[1] h-px w-px overflow-hidden opacity-0"
      />

      {/* Botón flotante */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pausar música de fondo" : "Reproducir música de fondo"}
        className="group fixed bottom-5 right-5 z-[60] flex items-center gap-2.5 border border-brass/60 bg-ink/95 px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-bone shadow-[0_18px_44px_-18px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-all hover:border-brass hover:bg-brass hover:text-ink active:translate-y-0.5"
      >
        <span className="relative grid h-6 w-6 place-items-center">
          {loading ? (
            <span className="block h-2 w-2 animate-pulse rounded-full bg-brass/80 group-hover:bg-ink" />
          ) : playing ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M7 4.5v15l13-7.5L7 4.5z" />
            </svg>
          )}
          {playing && !muted && (
            <span className="absolute -right-1 -top-1 flex items-end gap-[2px]">
              <span className="h-1.5 w-px animate-pulse bg-brass group-hover:bg-ink" />
              <span className="h-2 w-px animate-pulse bg-brass [animation-delay:120ms] group-hover:bg-ink" />
              <span className="h-1 w-px animate-pulse bg-brass [animation-delay:240ms] group-hover:bg-ink" />
            </span>
          )}
        </span>
        <span className="hidden sm:inline">
          {loading ? "cargando" : playing ? "música: on" : "música: off"}
        </span>
      </button>
    </>
  );
}
