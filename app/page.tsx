import { headers } from "next/headers";
import ProfileView from "@/components/profile-view";
import { ensureSeed, getProfileBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Dominios personalizados gratis (ej: Firebase → tunombre.web.app).
 * Se mapean con la variable de entorno DOMAIN_MAP:
 *   DOMAIN_MAP='{"ytk1.web.app":"ytk1","amigo.web.app":"amigo"}'
 * Si el host coincide, la portada muestra ese perfil.
 */
function slugForHost(host: string | null): string {
  if (host) {
    try {
      const map = JSON.parse(process.env.DOMAIN_MAP || "{}") as Record<string, string>;
      const mapped = map[host] ?? map[host.split(":")[0]];
      if (mapped) return mapped;
    } catch {
      // DOMAIN_MAP inválido → usar el perfil principal
    }
  }
  return "ytk1";
}

export default async function HomePage() {
  await ensureSeed();
  let host: string | null = null;
  try {
    host = (await headers()).get("host");
  } catch {
    host = null;
  }
  const slug = slugForHost(host);
  const profile = (await getProfileBySlug(slug)) ?? (await getProfileBySlug("ytk1"));
  if (!profile) return null;
  return <ProfileView profile={profile} cta />;
}
