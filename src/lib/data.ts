import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import {
  broadcasts,
  profiles,
  type BroadcastRecord,
  type ProfileRecord,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { DEFAULT_PROFILE, starterProfile, type ProfileData } from "./types";

/** Crea el perfil del dueño (ytk1) la primera vez que se toca la base. */
export async function ensureSeed(): Promise<void> {
  const existing = await db.select({ id: profiles.id }).from(profiles).limit(1);
  if (existing.length === 0) {
    const passwordHash = await hashPassword(process.env.PANEL_PASSWORD || "alexxx");
    await db.insert(profiles).values({
      ...DEFAULT_PROFILE,
      slug: "ytk1",
      passwordHash,
      isPrimary: true,
      updatedAt: new Date(),
    });
  }
}

export async function getProfileBySlug(
  slug: string,
): Promise<ProfileRecord | null> {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProfileById(
  id: number,
): Promise<ProfileRecord | null> {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function countProfiles(): Promise<number> {
  const rows = await db.select({ id: profiles.id }).from(profiles);
  return rows.length;
}

export async function slugTaken(slug: string): Promise<boolean> {
  const rows = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function updateProfileBySlug(
  slug: string,
  patch: Partial<ProfileData> & { lastSentAt?: Date | null },
): Promise<ProfileRecord | null> {
  await db
    .update(profiles)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(profiles.slug, slug));
  return getProfileBySlug(slug);
}

export async function createProfile(
  slug: string,
  passwordHash: string,
  name: string,
): Promise<ProfileRecord> {
  const starter = starterProfile(slug);
  const rows = await db
    .insert(profiles)
    .values({
      ...starter,
      slug,
      name: name || slug,
      passwordHash,
      isPrimary: false,
      updatedAt: new Date(),
    })
    .returning();
  return rows[0];
}

export async function logBroadcast(
  profileId: number,
  kind: string,
  status: string,
  detail: string,
): Promise<void> {
  await db
    .insert(broadcasts)
    .values({ profileId, kind, status, detail });
  // Mantener el historial del perfil acotado
  const rows = await db
    .select({ id: broadcasts.id })
    .from(broadcasts)
    .where(eq(broadcasts.profileId, profileId))
    .orderBy(broadcasts.id)
    .limit(100);
  if (rows.length > 30) {
    const cutoff = rows[rows.length - 30]?.id;
    if (cutoff) {
      await db
        .delete(broadcasts)
        .where(
          and(
            eq(broadcasts.profileId, profileId),
            lt(broadcasts.id, cutoff),
          ),
        );
    }
  }
}

export async function listBroadcasts(
  profileId: number,
  limit = 14,
): Promise<BroadcastRecord[]> {
  return db
    .select()
    .from(broadcasts)
    .where(eq(broadcasts.profileId, profileId))
    .orderBy(desc(broadcasts.createdAt), desc(broadcasts.id))
    .limit(limit);
}
