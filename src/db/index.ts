import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ensureDatabase } from "@/lib/ensure-db";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __dbEnsured?: boolean;
};

function buildPool(): Pool {
  if (databaseUrl) {
    return (
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
        max: 5,
        connectionTimeoutMillis: 10_000,
      })
    );
  }
  // Si no hay URL, devolvemos un pool que al conectar tira un error
  // amigable en lugar de romper el build.
  return new Pool({
    connectionString: "postgresql://0.0.0.0:1/no-db",
    connectionTimeoutMillis: 1,
  });
}

let pool: Pool;
if (databaseUrl) {
  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
      max: 5,
      connectionTimeoutMillis: 10_000,
    });
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
} else {
  pool = new Pool({
    connectionString: "postgresql://0.0.0.0:1/no-db",
    connectionTimeoutMillis: 1,
  });
}

export { pool };
export const db = drizzle(pool);

if (databaseUrl && !globalForDb.__dbEnsured) {
  globalForDb.__dbEnsured = true;
  void ensureDatabase().catch((err: unknown) => {
    console.warn("[ensure-db] falló, reintentará en la próxima request:", err);
    globalForDb.__dbEnsured = false;
  });
}
