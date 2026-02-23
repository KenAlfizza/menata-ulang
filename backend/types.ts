import type { TokenPayload } from "./lib/jwt.ts";

export type AppVariables = {
    user: TokenPayload;
};