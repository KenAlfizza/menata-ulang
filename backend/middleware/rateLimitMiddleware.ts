import { createMiddleware } from "hono/factory";
import { prisma } from "../lib/prisma.ts";


export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  // Get the ip address
  const ip = (c.req.header("X-Forwarded-For") ?? c.req.header("X-Real-IP")) || "unknown";

  const now = new Date();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  // Find existing ip record
  const record = await prisma.rateLimit.findUnique({
    where: { ip }
  });

  // Window Reset or New IP
  if (!record || now > record.reset) {
    await prisma.rateLimit.upsert({
      where: { ip },
      create: {
        ip,
        count: 1,
        reset: new Date(now.getTime() + windowMs),
      },
      update: {
        count: 1,
        reset: new Date(now.getTime() + windowMs),
      },
    });
    return await next();
  }

  // Check if Limit Exceeded
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.reset.getTime() - now.getTime()) / 1000);
    c.header("Retry-After", String(retryAfter));
    return c.json({
      error: `Too many requests. Try again in ${retryAfter} seconds.`
    }, 429);
  }

  // Increment the existing count
  await prisma.rateLimit.update({
    where: { ip },
    data: { count: { increment: 1 } }
  });

  await next();
});
