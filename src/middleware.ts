import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

/**
 * Protege las APIs privadas: exige una sesión firmada válida
 * y le pasa el slug del perfil a las rutas vía header.
 * Las rutas de registro, login y health quedan públicas.
 */
export async function middleware(request: NextRequest) {
  const slug = await verifyToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (!slug) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión en tu perfil para hacer eso." },
      { status: 401 },
    );
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-profile-slug", slug);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/api/profile",
    "/api/profile/:path*",
    "/api/broadcasts",
    "/api/broadcasts/:path*",
    "/api/discord/send",
  ],
};
