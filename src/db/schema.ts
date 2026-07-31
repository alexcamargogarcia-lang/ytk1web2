import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Project, Skill, Social } from "@/lib/types";

/** Un perfil por usuario — el dueño del sitio es isPrimary */
export const profiles = pgTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    passwordHash: text("password_hash").notNull().default(""),
    isPrimary: boolean("is_primary").notNull().default(false),
    name: text("name").notNull().default(""),
    tagline: text("tagline").notNull().default(""),
    about: text("about").notNull().default(""),
    location: text("location").notNull().default(""),
    availability: text("availability").notNull().default(""),
    online: boolean("online").notNull().default(true),
    accent: text("accent").notNull().default("#f2a93b"),
    skills: jsonb("skills").$type<Skill[]>().notNull().default([]),
    socials: jsonb("socials").$type<Social[]>().notNull().default([]),
    projects: jsonb("projects").$type<Project[]>().notNull().default([]),
    discordWebhook: text("discord_webhook").notNull().default(""),
    avatarUrl: text("avatar_url").notNull().default(""),
    bannerUrl: text("banner_url").notNull().default(""),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("profiles_slug_idx").on(table.slug)],
);

/** Historial de mensajes enviados a Discord por perfil */
export const broadcasts = pgTable("broadcasts", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  kind: text("kind").notNull().default("profile"), // "profile" | "test"
  status: text("status").notNull().default("ok"), // "ok" | "error"
  detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ProfileRecord = typeof profiles.$inferSelect;
export type BroadcastRecord = typeof broadcasts.$inferSelect;
