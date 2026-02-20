import { Hono } from 'hono';
import { prisma } from "../lib/prisma.ts";

import { setCookie, getCookie, deleteCookie} from 'hono/cookie'

// Library imports
import { signAccessToken, signRefreshToken } from "../lib/jwt.ts";
import { hashPassword, comparePassword } from '../lib/hash.ts';

const auth = new Hono();

/** Register endpoint */
auth.post("/register", async (c) => {
    const { email, password, name } = await c.req.json();
    // Check if any fields missing
    if (!email || !password || !name) {
        return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if user exists, return 409 if user exists
    const user = await prisma.user.findFirst({
        where: {email: email}
    });
    if (user) return c.json({ error: "Account with specified email exists" }, 409);

    // Encrypt password
    const hashedPassword = await hashPassword(password);

    // Create user
    await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: "user",
        },
    });

    // Return status
    return c.json({ message: "Account created", ok: true }, 201);
})

/** Login endpoint */
auth.post("/login", async (c) => {
    const { email, password } = await c.req.json();
    
    // Get user with specified email
    const user = await prisma.user.findUnique({
        where: {email: email}
    })
    // Return 404 if account is not found
    if (!user) return c.json({ error: "Account not found" }, 404);

    // Verify password
    const verified = await comparePassword(password, user.password);
    if (!verified) return c.json({ error: "Invalid credentials" }, 401);
    
    // Create token
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Store refresh token in DB
    await prisma.token.create({
        data: {
        token: refreshToken,
        type: "LOGIN",
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
    });

    // Set cookie
    setCookie(c, "access_token", accessToken, {
        httpOnly: true,
        secure: Deno.env.get("DENO_ENV") === "production",
        sameSite: "Lax",
        maxAge: 60 * 15, // 15 min
        path: "/",
    });

    setCookie(c, "refresh_token", refreshToken, {
        httpOnly: true,
        secure: Deno.env.get("DENO_ENV") === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
    });
    return c.json({ message: "Login successfull", ok: true }, 200);
});

/** Logout endpoint */
auth.post("/logout", (c) => {
  setCookie(c, "token", "", { maxAge: 0, path: "/" });
  return c.json({ ok: true });
});

export default auth;