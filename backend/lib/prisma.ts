import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client.ts";

export { Prisma };

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: Deno.env.get("DATABASE_URL")!,
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