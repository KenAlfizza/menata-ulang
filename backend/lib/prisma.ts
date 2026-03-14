/**
 * Prisma database client configuration.
 *
 * Behavior: Initializes and exports a singleton instance of the PrismaClient
 * configured to use the PostgreSQL adapter. The database connection string is
 * read from the `DATABASE_URL` environment variable and validated to ensure it
 * is a valid Postgres URL containing a password. Logging verbosity depends on
 * the environment: development logs queries, warnings, and errors, while
 * production logs only errors.
 *
 * In non-production environments, the client instance is stored on
 * `globalThis.prisma` to prevent multiple Prisma clients from being created
 * during hot reloads or repeated module imports.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client.ts";

export { Prisma };

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Create and configure a new PrismaClient instance.
 *
 * Behavior: Reads and validates the `DATABASE_URL` environment variable,
 * initializes the PostgreSQL adapter, and returns a configured Prisma client
 * with environment-specific logging settings.
 *
 * Throws:
 * - Error: if `DATABASE_URL` is missing or invalid.
 */
const createPrismaClient = () => {
  const connectionString = Deno.env.get("DATABASE_URL");
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable. Set DATABASE_URL to your Postgres connection string.");
  }

  // Basic validation: ensure password is present in the connection string
  try {
    const url = new URL(connectionString);
    if (!url.password) {
      throw new Error("Database connection string missing password.");
    }
  } catch (e) {
    // If parsing fails, rethrow a helpful error
    throw new Error("Invalid DATABASE_URL. Ensure it's a valid Postgres URL, e.g. postgresql://user:password@host:5432/db?schema=public");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
    log:
      Deno.env.get("DENO_ENV") === "production"
        ? ["error"]
        : ["query", "error", "warn"],
  });
};

export const prisma = globalThis.prisma ?? createPrismaClient();

if (Deno.env.get("DENO_ENV") !== "production") {
  globalThis.prisma = prisma;
}