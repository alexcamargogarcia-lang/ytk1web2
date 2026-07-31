"use client";

/**
 * radio//ytk1 — reproductor de canciones completas vía YouTube IFrame API.
 * - Catálogo curado de MegaR, Byaki Rap, Víctor Mendívil y Lana Del Rey.
 * - Buscador sobre el catálogo + chips por artista.
 * - Pegá cualquier link de YouTube y se agrega a "tu cola" (localStorage).
 * - Controles: play/pausa, anterior/siguiente, adelantar/retroceder, volumen.
 * - Si una pista no existe (video caído), salta sola a la siguiente.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { ScrambleText, Reveal } from "@/components/motion";
import {
  AlertIcon,
  CheckIcon,
  RadioIcon,
  YouTubeIcon,
} from "@/components/icons";

/* ---------------- tipos mínimos de la IFrame API ---------------- */
type PlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (s: number, allowSeekAhead?: boolean) => void;
  setVolume: (v: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getVideoData: () => { title?: string; author?: string; video_id?: string };
  loadVideoById: (id: string) => void;
  destroy: () => void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      height?: number | string;
      width?: number | string;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (e: { target: PlayerInstance }) => void;
        onStateChange?: (e: { target: PlayerInstance; data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => PlayerInstance;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
};
function getYT(): YTNamespace | undefined {
  return (window as unknown as { YT?: YTNamespace }).YT;
}

function onApiReady(cb: () => void) {
  const w = window as unknown as { onYouTubeIframeAPIReady?: () => void };
  const prev = w.onYouTubeIframeAPIReady;
  w.onYouTubeIframeAPIReady = () => {
    prev?.();
    cb();
  };
}

/* ---------------- catálogo ---------------- */
interface Track {
  id: string;
  title: string;
  artist: string;
  custom?: boolean;
}

const CATALOG: Track[] = [
  /* ---------------- Lana Del Rey ---------------- */
  { id: "uNuMH2i6wdI", title: "Summertime Sadness", artist: "Lana Del Rey" },
  { id: "cE6wxDqdOV0", title: "Video Games", artist: "Lana Del Rey" },
  { id: "Bag1gUkU0gk", title: "Born to Die", artist: "Lana Del Rey" },
  { id: "QnxpHJ5dWmA", title: "Young and Beautiful", artist: "Lana Del Rey" },
  { id: "xYtsL9znopI", title: "Doin' Time", artist: "Lana Del Rey" },
  { id: "o3eP6Ys68qg", title: "West Coast", artist: "Lana Del Rey" },
  { id: "AiayWQnUKPc", title: "Blue Jeans", artist: "Lana Del Rey" },
  /* ---------------- MegaR ---------------- */
  { id: "-MRXZ90kT8o", title: "Mágico (Mashle Rap)", artist: "MegaR" },
  { id: "PvcG5ahJS-4", title: "Hades Rap", artist: "MegaR" },
  { id: "hduVlFWAjbw", title: "Este Spider-Man M4ta! (Superior Spider-Man)", artist: "MegaR" },
  { id: "PRuB1kuotdw", title: "España vs Argentina (Mundial Blue Lock)", artist: "MegaR" },
  { id: "Xy7suYp32lM", title: "Musashi Miyamoto vs Luchadores 2 (Baki)", artist: "MegaR" },
  { id: "kqChIgDinR0", title: "Francia vs Japón (Blue Lock) Mundial Sub 20 #2", artist: "MegaR" },
  { id: "BiqhTLDUhak", title: "Homelander vs Butcher (The Boys)", artist: "MegaR" },
  { id: "dA8J_tWrjlY", title: "Invencible 4 — Guerra Viltrumita", artist: "MegaR" },
  { id: "b7mVT23Ygqs", title: "Módulo (Jujutsu Kaisen)", artist: "MegaR" },
  { id: "XDOZd_hxGKI", title: "Musashi Miyamoto vs Luchadores (Baki)", artist: "MegaR" },
  { id: "0eyHyIrlCOQ", title: "Rudo y Duro (Gachiakuta)", artist: "MegaR" },
  { id: "PxzHEQOQKHQ", title: "New Gen (Blue Lock)", artist: "MegaR" },
  { id: "-WaEy7nZIfc", title: "Victory Road (Inazuma Eleven)", artist: "MegaR" },
  { id: "ZJ_s5rzDAjk", title: "Liga Neo Egoísta (Blue Lock) — Todos los Partidos", artist: "MegaR" },
  { id: "AYSGJ4aWRkM", title: "Nigeria vs Japón (Blue Lock) Mundial Sub 20 #1", artist: "MegaR" },
  { id: "i2X8lO-PIkg", title: "Peculiar (Lyric Video)", artist: "MegaR" },
  /* ---------------- Byaki Rap ---------------- */
  { id: "vXystMiE448", title: "DÚOS (Blue Lock) — Reacción Química", artist: "Byaki Rap" },
  { id: "EiK927lIX44", title: "Los 7 Pecados Capitales vs Arthur (Nanatsu No Taizai)", artist: "Byaki Rap" },
  { id: "2KOfU77BO-8", title: "Japón vs Francia — Partido Completo (Blue Lock)", artist: "Byaki Rap" },
  { id: "2Zf4HEjwfr8", title: "Japón vs Francia — Segundo Tiempo (Blue Lock)", artist: "Byaki Rap" },
  { id: "Fx-vvyExtKU", title: "Sakura vs Yamato Endo (Wind Breaker)", artist: "Byaki Rap" },
  { id: "hLq9aLuBh_I", title: "La Coalición de Planetas (Invencible)", artist: "Byaki Rap" },
  { id: "vqEcpaABKc4", title: "Nirei (Wind Breaker) — El Valor del Más Débil", artist: "Byaki Rap" },
  { id: "hT46x8e7a4w", title: "Japón vs Francia — Primer Tiempo (Blue Lock)", artist: "Byaki Rap" },
  { id: "kjxmNTZkO5g", title: "Nagi Team vs Kiyora Team (Blue Lock)", artist: "Byaki Rap" },
  { id: "pzloEvvkhjE", title: "Itadori vs Higuruma (Jujutsu Kaisen)", artist: "Byaki Rap" },
  { id: "0FoPnfeeyWw", title: "Maki vs el Clan Zenin (Jujutsu Kaisen)", artist: "Byaki Rap" },
  { id: "wh2RCiWJHMQ", title: "Nueva Generación de Konoha (Boruto)", artist: "Byaki Rap" },
  { id: "KxsPbkkTTqI", title: "Los 4 Jinetes del Apocalipsis (Nanatsu No Taizai)", artist: "Byaki Rap" },
  { id: "2k_9liudK9w", title: "Itadori vs Yuta (Jujutsu Kaisen)", artist: "Byaki Rap" },
  { id: "_HddyUtJ0PU", title: "Ojo del Depredador (MacroRap Blue Lock)", artist: "Byaki Rap" },
  { id: "S3sB7glU8Ic", title: "Sacrificios Rap (Jujutsu Kaisen)", artist: "Byaki Rap" },
  { id: "hKKaCBmswsw", title: "Shinobu vs Douma Rap (Demon Slayer)", artist: "Byaki Rap" },
  { id: "8qKZQqNQQPo", title: "Rap del Equipo Bakugou (My Hero Academia)", artist: "Byaki Rap" },
  /* ---------------- Víctor Mendívil ---------------- */
  { id: "RN1fONt4uKM", title: "Un Scar ft. Luis R. Conriquez", artist: "Víctor Mendívil" },
  { id: "0-DNvU0RtMU", title: "Mix 2024 — Un Scar y más éxitos", artist: "Víctor Mendívil" },
  { id: "W4FCvRgeLM0", title: "Álbum Completo 2024 — Grandes Éxitos", artist: "Víctor Mendívil" },
];

const ARTISTS = [
  { name: "Todos", color: "#f2a93b" },
  { name: "MegaR", color: "#ff6b5a" },
  { name: "Byaki Rap", color: "#f2a93b" },
  { name: "Víctor Mendívil", color: "#4fe0b0" },
  { name: "Lana Del Rey", color: "#a970ff" },
  { name: "Tu cola", color: "#6fd3ff" },
];

const QUEUE_KEY = "radio-ytk1:queue";
const VOL_KEY = "radio-ytk1:volume";

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ---------------- ecualizador animado ---------------- */
function EqBars({ active }: { active: boolean }) {
  return (
    <span className="flex h-4 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-sm bg-current ${active ? "animate-pulse" : ""}`}
          style={{
            height: active ? `${40 + ((i * 37) % 60)}%` : "18%",
            animationDelay: `${i * 110}ms`,
            animationDuration: `${420 + i * 90}ms`,
          }}
        />
      ))}
    </span>
  );
}

export default function MusicRadio() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<PlayerInstance | null>(null);
  const readyRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<Track | null>(null);
  const [nowTitle, setNowTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [station, setStation] = useState("Todos");
  const [query, setQuery] = useState("");
  const [queue, setQueue] = useState<Track[]>([]);
  const [link, setLink] = useState("");
  const [linkMsg, setLinkMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  // lista que se está reproduciendo (para anterior/siguiente)
  const playListRef = useRef<Track[]>([]);
  const indexRef = useRef(0);

  /* ---------- carga de la API + cola persistida ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (raw) setQueue(JSON.parse(raw) as Track[]);
      const v = localStorage.getItem(VOL_KEY);
      if (v) setVolume(Math.max(0, Math.min(100, Number(v) || 70)));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
      /* noop */
    }
  }, [queue]);

  useEffect(() => {
    let cancelled = false;
    function loadAPI(): Promise<void> {
      return new Promise((resolve) => {
        if (getYT()?.Player) {
          resolve();
          return;
        }
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
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
    loadAPI().then(() => {
      const yt = getYT();
      if (cancelled || !mountRef.current || !yt) return;
      const player = new yt.Player(mountRef.current, {
        height: "100%",
        width: "100%",
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (e) => {
            readyRef.current = true;
            setReady(true);
            try {
              e.target.setVolume(Number(localStorage.getItem(VOL_KEY)) || 70);
            } catch {
              /* noop */
            }
          },
          onStateChange: (e) => {
            const st = getYT()?.PlayerState;
            if (!st) return;
            if (e.data === st.PLAYING) {
              setPlaying(true);
              setError(null);
              const data = e.target.getVideoData();
              if (data?.title) setNowTitle(data.title);
              // sincronizar título para tracks custom
              if (current?.custom && data?.title) {
                setQueue((q) =>
                  q.map((t) =>
                    t.id === current.id && t.title.startsWith("Pista") ? { ...t, title: data.title ?? t.title } : t,
                  ),
                );
              }
            } else if (e.data === st.PAUSED || e.data === st.CUED) {
              setPlaying(false);
            } else if (e.data === st.ENDED) {
              handleNext();
            }
          },
          onError: () => {
            setError("Esa pista no está disponible en YouTube. Saltando…");
            setTimeout(() => handleNext(), 900);
          },
        },
      });
      playerRef.current = player;
    });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- progreso ---------- */
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      setProgress(p.getCurrentTime() || 0);
      setDuration(p.getDuration() || 0);
    }, 500);
    return () => clearInterval(id);
  }, [playing]);

  /* ---------- acciones ---------- */
  const playTrack = useCallback((track: Track, list: Track[]) => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    playListRef.current = list;
    indexRef.current = Math.max(0, list.findIndex((t) => t.id === track.id));
    setCurrent(track);
    setNowTitle(track.title);
    setError(null);
    try {
      p.loadVideoById(track.id);
    } catch {
      setError("No se pudo cargar la pista.");
    }
  }, []);

  const handleNext = useCallback(() => {
    const list = playListRef.current;
    if (!list.length) return;
    const next = (indexRef.current + 1) % list.length;
    indexRef.current = next;
    const track = list[next];
    setCurrent(track);
    setNowTitle(track.title);
    try {
      playerRef.current?.loadVideoById(track.id);
    } catch {
      /* noop */
    }
  }, []);

  const handlePrev = useCallback(() => {
    const list = playListRef.current;
    if (!list.length) return;
    // si ya pasaron 3s, reinicia; si no, pista anterior
    const p = playerRef.current;
    if (p && p.getCurrentTime() > 3) {
      p.seekTo(0, true);
      return;
    }
    const prev = (indexRef.current - 1 + list.length) % list.length;
    indexRef.current = prev;
    const track = list[prev];
    setCurrent(track);
    setNowTitle(track.title);
    try {
      p?.loadVideoById(track.id);
    } catch {
      /* noop */
    }
  }, []);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const st = getYT()?.PlayerState;
    if (!st) return;
    if (p.getPlayerState() === st.PLAYING) p.pauseVideo();
    else p.playVideo();
  }, []);

  const seek = (value: number) => {
    playerRef.current?.seekTo(value, true);
    setProgress(value);
  };

  const changeVolume = (value: number) => {
    setVolume(value);
    setMuted(value === 0);
    try {
      localStorage.setItem(VOL_KEY, String(value));
      const p = playerRef.current;
      if (p) {
        p.setVolume(value);
        if (value === 0) p.mute();
        else p.unMute();
      }
    } catch {
      /* noop */
    }
  };

  const addLink = (e: FormEvent) => {
    e.preventDefault();
    setLinkMsg(null);
    const id = extractYouTubeId(link.trim());
    if (!id) {
      setLinkMsg({ tone: "error", text: "Ese link no parece de YouTube. Probá con watch?v=… o youtu.be/…" });
      return;
    }
    const track: Track = { id, title: `Pista ${queue.length + 1}`, artist: "Tu cola", custom: true };
    setQueue((q) => [...q, track]);
    setLink("");
    setLinkMsg({ tone: "ok", text: "Agregada a tu cola y sonando." });
    setStation("Tu cola");
    playTrack(track, [...queue, track]);
  };

  const removeQueue = (id: string) => {
    setQueue((q) => q.filter((t) => t.id !== id));
  };

  /* ---------- filtros ---------- */
  const list = useMemo(() => {
    const base = station === "Tu cola" ? queue : station === "Todos" ? CATALOG : CATALOG.filter((t) => t.artist === station);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q),
    );
  }, [station, query, queue]);

  /* ---------- teclado ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        const p = playerRef.current;
        if (p) seek(Math.min(p.getDuration() || 0, p.getCurrentTime() + 10));
      } else if (e.code === "ArrowLeft") {
        const p = playerRef.current;
        if (p) seek(Math.max(0, p.getCurrentTime() - 10));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [togglePlay]);

  const accent = ARTISTS.find((a) => a.name === station)?.color ?? "#f2a93b";

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-5 pb-40 pt-10 sm:px-8">
      {/* ---------- encabezado ---------- */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] text-brass uppercase">
            <RadioIcon className="h-4 w-4" />
            radio//ytk1 · canciones completas
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            <ScrambleText text="sube el volumen" />
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-bone-dim">
            MegaR, Byaki Rap, Víctor Mendívil y Lana Del Rey en un solo lugar.
            Buscá, dale play, adelantá — y si no está, pegá el link de YouTube y
            queda en tu cola.
          </p>
        </div>
        <div className="flex items-center gap-3 border border-pine-600 bg-pine-900/80 px-4 py-3">
          <EqBars active={playing} />
          <span className="font-mono text-[10px] tracking-[0.2em] text-sage uppercase">
            {playing ? "sonando ahora" : "en pausa"}
          </span>
        </div>
      </header>

      {/* ---------- cinta ---------- */}
      <div className="marquee-mask mt-10 -rotate-1 overflow-hidden border-y border-brass/30 bg-brass/8 py-3">
        <div className="marquee-track">
          {[...ARTISTS.slice(1), ...ARTISTS.slice(1)].map((a, i) => (
            <span key={`${a.name}-${i}`} className="flex items-center gap-6 pr-6 font-display text-lg font-semibold uppercase tracking-wide whitespace-nowrap">
              <span style={{ color: a.color }}>{a.name}</span>
              <span className="text-brass">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- buscador + chips ---------- */}
      <div className="mt-10 space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="relative"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar canción o artista…"
            className="w-full border border-pine-600 bg-pine-900/70 px-5 py-4 pr-14 font-mono text-sm text-bone placeholder:text-sage/50 outline-none transition-colors focus:border-brass/70"
          />
          <svg viewBox="0 0 24 24" className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-sage" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <circle cx="11" cy="11" r="6.5" />
            <path d="M20 20l-4.2-4.2" strokeLinecap="round" />
          </svg>
        </form>

        <div className="flex flex-wrap gap-2">
          {ARTISTS.map((a) => (
            <button
              key={a.name}
              type="button"
              onClick={() => setStation(a.name)}
              className={`border px-4 py-2 font-mono text-[11px] tracking-[0.16em] uppercase transition-all ${
                station === a.name
                  ? "border-transparent text-ink"
                  : "border-pine-600 text-sage hover:text-bone"
              }`}
              style={station === a.name ? { backgroundColor: a.color } : undefined}
            >
              {a.name}
              {a.name === "Tu cola" && <span className="ml-1.5 opacity-70">({queue.length})</span>}
            </button>
          ))}
        </div>

        {/* pegar link */}
        <form onSubmit={addLink} className="flex flex-col gap-2 border border-pine-700 bg-pine-900/50 p-4 sm:flex-row sm:items-center">
          <YouTubeIcon className="hidden h-5 w-5 shrink-0 text-ember sm:block" />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="pegá un link de YouTube que no esté y se agrega a tu cola…"
            className="w-full border border-pine-600 bg-ink px-4 py-2.5 font-mono text-xs text-bone placeholder:text-sage/50 outline-none focus:border-ember/60"
          />
          <button
            type="submit"
            className="shrink-0 bg-ember px-5 py-2.5 font-display text-xs font-bold tracking-wide text-ink uppercase transition-all hover:brightness-110 active:translate-y-0.5"
          >
            + agregar y reproducir
          </button>
        </form>
        {linkMsg && (
          <p className={`flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase ${linkMsg.tone === "ok" ? "text-mint" : "text-ember"}`}>
            {linkMsg.tone === "ok" ? <CheckIcon className="h-3.5 w-3.5" /> : <AlertIcon className="h-3.5 w-3.5" />}
            {linkMsg.text}
          </p>
        )}
      </div>

      {/* ---------- grilla: lista + video ---------- */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* lista */}
        <Reveal>
          <div className="border border-pine-700 bg-pine-900/50">
            <div className="flex items-center justify-between border-b border-pine-700 px-5 py-3.5">
              <h2 className="font-display text-lg font-bold">
                {station === "Todos" ? "Catálogo" : station}
              </h2>
              <span className="font-mono text-[10px] tracking-[0.2em] text-sage uppercase">
                {list.length} pistas
              </span>
            </div>
            <ul className="max-h-[26rem] divide-y divide-pine-700/60 overflow-y-auto">
              {list.length === 0 && (
                <li className="px-5 py-8 text-center font-mono text-[11px] tracking-[0.16em] text-sage uppercase">
                  {station === "Tu cola"
                    ? "tu cola está vacía — pegá un link arriba"
                    : "sin resultados para esa búsqueda"}
                </li>
              )}
              {list.map((track, i) => {
                const isActive = current?.id === track.id;
                return (
                  <li key={`${track.id}-${i}`}>
                    <div
                      className={`group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors ${
                        isActive ? "bg-pine-800/80" : "hover:bg-pine-800/40"
                      }`}
                      onClick={() => playTrack(track, list)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && playTrack(track, list)}
                    >
                      <span
                        className="w-7 shrink-0 font-display text-lg font-extrabold"
                        style={{ color: isActive ? accent : "var(--color-sage)" }}
                      >
                        {isActive ? (
                          <EqBars active={playing} />
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-semibold ${isActive ? "text-bone" : "text-bone-dim group-hover:text-bone"}`}>
                          {track.title}
                        </span>
                        <span className="block truncate font-mono text-[10px] tracking-[0.16em] text-sage uppercase">
                          {track.artist}
                        </span>
                      </span>
                      {track.custom && (
                        <button
                          type="button"
                          aria-label="Quitar de tu cola"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQueue(track.id);
                          }}
                          className="grid h-7 w-7 shrink-0 place-items-center border border-pine-600 text-sage transition-colors hover:border-ember/60 hover:text-ember"
                        >
                          ✕
                        </button>
                      )}
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-sage opacity-0 transition-opacity group-hover:opacity-100" fill="currentColor" aria-hidden>
                        <path d="M7 4.5v15l13-7.5L7 4.5z" />
                      </svg>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>

        {/* video */}
        <Reveal delay={120}>
          <div className="lg:sticky lg:top-24">
            <div className="border border-pine-700 bg-pine-900/50">
              <div className="flex items-center justify-between border-b border-pine-700 px-5 py-3.5">
                <h2 className="font-display text-lg font-bold">En pantalla</h2>
                <span className="font-mono text-[10px] tracking-[0.2em] text-sage uppercase">
                  video oficial
                </span>
              </div>
              <div className="relative aspect-video w-full bg-ink">
                {!ready && (
                  <div className="absolute inset-0 grid place-items-center font-mono text-[11px] tracking-[0.2em] text-sage uppercase">
                    cargando reproductor…
                  </div>
                )}
                <div ref={mountRef} className="absolute inset-0 h-full w-full" />
                {ready && !current && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/85 text-center">
                    <div>
                      <RadioIcon className="mx-auto h-8 w-8 text-brass" />
                      <p className="mt-3 font-mono text-[11px] tracking-[0.2em] text-sage uppercase">
                        elegí una pista de la lista
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-pine-700 px-5 py-4">
                <p className="truncate font-display text-base font-bold text-bone">
                  {nowTitle || "—"}
                </p>
                <p className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-sage uppercase">
                  {current?.artist ?? "sin pista"}
                </p>
                {error && (
                  <p className="mt-2 flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-ember">
                    <AlertIcon className="h-3.5 w-3.5" /> {error}
                  </p>
                )}
              </div>
            </div>

            {/* atajos */}
            <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px] tracking-[0.14em] text-sage uppercase">
              <div className="border border-pine-700 bg-pine-900/50 px-3 py-2 text-center">
                <span className="text-brass">espacio</span> play/pausa
              </div>
              <div className="border border-pine-700 bg-pine-900/50 px-3 py-2 text-center">
                <span className="text-brass">→</span> +10s
              </div>
              <div className="border border-pine-700 bg-pine-900/50 px-3 py-2 text-center">
                <span className="text-brass">←</span> −10s
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ---------- barra de reproducción ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-pine-700 bg-ink/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5 sm:px-8">
          {/* controles */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={handlePrev} aria-label="Anterior / reiniciar"
              className="grid h-10 w-10 place-items-center border border-pine-600 text-sage transition-colors hover:border-brass/60 hover:text-brass">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M6 5h2v14H6zM20 5v14L9 12l11-7z" />
              </svg>
            </button>
            <button type="button" onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproducir"}
              className="grid h-12 w-12 place-items-center bg-brass text-ink transition-all hover:bg-brass-soft active:translate-y-0.5">
              {playing ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                  <path d="M7 4.5v15l13-7.5L7 4.5z" />
                </svg>
              )}
            </button>
            <button type="button" onClick={handleNext} aria-label="Siguiente"
              className="grid h-10 w-10 place-items-center border border-pine-600 text-sage transition-colors hover:border-brass/60 hover:text-brass">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M16 5h2v14h-2zM4 5v14l11-7L4 5z" />
              </svg>
            </button>
          </div>

          {/* seek */}
          <div className="flex min-w-[12rem] flex-1 items-center gap-3">
            <span className="w-11 text-right font-mono text-[11px] text-sage tabular-nums">{fmt(progress)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(duration, 1)}
              step={1}
              value={Math.min(progress, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full"
              aria-label="Adelantar o retroceder"
            />
            <span className="w-11 font-mono text-[11px] text-sage tabular-nums">{fmt(duration)}</span>
          </div>

          {/* volumen */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => changeVolume(muted ? 70 : 0)} aria-label={muted ? "Activar sonido" : "Silenciar"}
              className="grid h-9 w-9 place-items-center border border-pine-600 text-sage transition-colors hover:border-brass/60 hover:text-brass">
              {muted ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M4 9v6h4l5 4V5L8 9H4zM16 9l5 6M21 9l-5 6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-24"
              aria-label="Volumen"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
