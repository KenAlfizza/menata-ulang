import { Hono } from 'hono';
import { prisma } from "../lib/prisma.ts";

import { setCookie, getCookie, deleteCookie} from 'hono/cookie'
import { signToken } from "../lib/jwt.ts";
import { userInfo } from "node:os";

const auth = new Hono();

/** Register endpoint */
auth.post("/register", async (c) => {

})

/** Login endpoint */
auth.post("/login", async (c) => {
    const { email, password } = c.req.json();
    // TODO: verify user here
    
    const token = ""; // TODO: update to sign token

    setCookie(c, "token", token, {
    httpOnly: true,
    secure: Deno.env.get("DENO_ENV") === "production",
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    });
});
