import type { TokenPayload } from "./lib/jwt.ts";

export type AppVariables = {
  // Auth user info
  user: TokenPayload;
  
  // Rate limiting data
  rateLimitData: { count: number; reset: number };
};
