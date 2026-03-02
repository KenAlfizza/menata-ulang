import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client.ts";

export { Prisma };

declare global {
  var prisma: PrismaClient | undefined;
}

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