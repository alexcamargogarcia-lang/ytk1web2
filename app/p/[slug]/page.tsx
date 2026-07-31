import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProfileView from "@/components/profile-view";
import { ensureSeed, getProfileBySlug } from "@/lib/data";
import { SLUG_RE } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug.toLowerCase());
  if (!profile) return { title: "Perfil no encontrado — perfil//sync" };
  return {
    title: `${profile.name} — perfil//sync`,
    description: profile.tagline || `Perfil digital de ${profile.name}`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureSeed();
  const { slug } = await params;
  const clean = slug.toLowerCase();
  if (!SLUG_RE.test(clean)) notFound();
  const profile = await getProfileBySlug(clean);
  if (!profile) notFound();
  return <ProfileView profile={profile} cta />;
}
