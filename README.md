# ⚡ perfil//sync — tu tarjeta digital + radio propia

> Una plataforma gratuita donde cada persona crea su **perfil digital público**
> (`/p/sunombre`), lo personaliza con avatar, banner, color, stack, proyectos y
> redes, y además tiene una **radio** para escuchar canciones completas de
> YouTube con buscador, cola propia y atajos de teclado.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-336791?style=for-the-badge&logo=postgresql)
![YouTube](https://img.shields.io/badge/Radio-YouTube_IFrame-FF0000?style=for-the-badge&logo=youtube)

---

## ✨ Qué hace

### 🪪 Perfiles públicos multi-usuario
- Cualquiera entra a `/crear`, elige un nombre libre (verificación en vivo) y
  obtiene su link **`/p/sunombre`** al instante.
- Cada perfil tiene su propio **color de acento**, avatar por URL, banner por
  URL, bio, ubicación, skills con barras animadas, proyectos y redes (GitHub,
  YouTube, TikTok, Twitch, Discord, Instagram, X, LinkedIn, mail, web).
- Login por usuario + contraseña, sesiones firmadas con HMAC (cookie
  `httpOnly`), hash SHA-256 de contraseñas. Las APIs están protegidas por
  middleware: sin sesión todo devuelve 401.

### 🎛️ Panel de edición (`/editar`)
- Edición en vivo de todo el perfil; los cambios se ven al instante en la
  página pública.
- Selector de color con 6 temas que tiñen botones, barras y detalles.
- Campo de avatar y banner (URL directa de Imgur/Discord/etc).
- Botón para copiar tu link.
- Conexión opcional a Discord por webhook: **nada se envía solo**, solo cuando
  apretás "Probar canal" o "Enviar perfil", con historial de envíos.

### 📻 radio//ytk1 (`/musica`)
- Reproductor de **canciones completas** vía la IFrame API oficial de YouTube.
- Catálogo curado de **MegaR, Byaki Rap, Víctor Mendívil y Lana Del Rey**.
- Buscador sobre el catálogo + chips por artista.
- Pegás cualquier link de YouTube y se agrega a **"Tu cola"** (persistida en
  `localStorage`) y suena al toque.
- Controles: play/pausa, anterior/siguiente, **barra para adelantar/retroceder**,
  volumen, mute. Atajos: `espacio` = play/pausa, `→` +10s, `←` −10s.
- Si un video está caído, salta solo a la siguiente pista.
- Video oficial visible en pantalla mientras suena.

### 🎨 Diseño
- Identidad propia: verde pino profundo + ámbar + menta + acentos por artista.
- Tipografías: Bricolage Grotesque (display), Instrument Sans (texto),
  JetBrains Mono (detalles).
- Movimientos de firma: texto que se **decodifica** (scramble), barras de
  skills que se llenan al scroll, cinta transportadora (marquee) con los
  artistas, revelado por secciones, reloj en vivo, ecualizador animado, ruido
  de grano, scanlines sobre la credencial, placa creeper pixelada para ytk1.
- Respeta `prefers-reduced-motion`.

---

## 🗂️ Rutas

| Ruta | Qué es |
|------|--------|
| `/` | Perfil principal (ytk1) + banda "crear perfil gratis" |
| `/p/[slug]` | Perfil público de cualquier usuario |
| `/crear` | Registro gratis con verificación de nombre en vivo |
| `/editar` | Panel privado (login por usuario + contraseña) |
| `/musica` | radio//ytk1 — canciones completas |
| `/admin` | Redirige a `/editar` (compatibilidad) |
| `/api/...` | Auth, signup, perfil, broadcasts, discord, slugs |

---

## 🚀 Deploy a Vercel (gratis, 5 minutos)

1. Subí el repo a GitHub:
   ```bash
   git init
   git add .
   git commit -m "perfil sync listo"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/ytk1web2.git
   git push -u origin main
   ```
   (Si te pide credenciales, usá `gh auth login` y entrás por navegador — **nunca
   pegues un token en un chat**.)
2. Creá una base gratis en [Neon](https://neon.tech) (login con GitHub, sin
   tarjeta) y copiá tu `DATABASE_URL` (`postgresql://…`).
3. En [Vercel](https://vercel.com) → **New Project** → importá el repo.
4. En **Environment Variables** agregá:
   - `DATABASE_URL` → la URL de Neon (obligatoria).
   - `PANEL_PASSWORD` → contraseña del perfil dueño (opcional, default `alexxx`).
   - `SESSION_SECRET` → una frase larga cualquiera (opcional, para firmar sesiones).
5. **Deploy**. La primera visita crea las tablas y siembra el perfil `ytk1`
   automáticamente — no hay que correr migraciones.

> ⚠️ No uses bun como instalador en Vercel si te falla la detección: el
> `vercel.json` ya fuerza `npm install`. La carpeta `app/` vive en la raíz del
> proyecto para que Vercel la detecte sin problemas.

### Dominio propio corto (gratis)
- `tunombre.vercel.app` lo da Vercel automático.
- `tunombre.web.app` con Firebase Hosting apuntando a tu deploy.
- Con dominio propio, mapealo al perfil con la variable
  `DOMAIN_MAP='{"ytk1.web.app":"ytk1"}'`.

---

## 🔐 Credenciales por defecto

- Perfil dueño: usuario **`ytk1`** / contraseña **`alexxx`** (cambiala con
  `PANEL_PASSWORD`).
- Perfil Corvelan: usuario **`corvelan`** / contraseña **`alexxx`**.
- Cada usuario nuevo elige la suya al registrarse.

---

## 🛠️ Desarrollo local

```bash
cp .env.example .env.local   # poné tu DATABASE_URL
npm install
npm run dev                  # http://localhost:3000
```

Scripts útiles: `npm run build`, `npm run start`, `npm run typecheck`,
`npm run db:push` (fuerza el schema con Drizzle; normalmente no hace falta).

---

## 🧱 Estructura

```
app/                  # App Router: /, /p/[slug], /crear, /editar, /musica, /api
src/components/       # profile-view, admin-panel, music-radio, music-player, icons…
src/db/               # cliente Drizzle + schema (profiles, broadcasts)
src/lib/              # auth (HMAC), data, discord, ensure-db (auto-migración)
```

---

Hecho con 🔥 para ytk1, Corvelan y toda la comunidad.
