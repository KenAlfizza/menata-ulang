import { Hono } from 'hono';
import { prisma } from "../lib/prisma.ts";

import { setCookie, getCookie, deleteCookie} from 'hono/cookie'

// Library imports
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt.ts";
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
            role: "USER",
        },
    });

    // Return status
    return c.json({ message: "Account created", ok: true }, 201);
})

/** Login endpoint 
 * Verify user information
 * On success, generate access token and refresh token.
 * On failure, return 404 if the account not found, 402 if unauthorized 
*/
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
    
    // Create access and refresh token
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Store refresh token in DB
    await prisma.token.create({
            data: {
            token: refreshToken,
            type: "REFRESH",
            userId: user.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            lastAccessTokenAt: new Date()
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
        path: "/auth/refresh",
    });
    return c.json({ message: "Login successfull", ok: true }, 200);
});

/** Refresh token endpoint 
 * If the user is active at any point under 15 minute window since the access token is issued, 
 * regenerate new access token and record the date. Otherwise, logout the user and remove the access token
 * 
*/
auth.post("/refresh", async (c) => {
    const refreshToken = getCookie(c, "refresh_token");
    if (!refreshToken) return c.json({ error: "Unauthorized" }, 401);
    
    // If refresh token expired or not found, force logout
    const storedRefreshToken = await prisma.token.findUnique({where: {token: refreshToken}});
    if (!storedRefreshToken || storedRefreshToken.expiresAt < new Date()) {
        await prisma.token.deleteMany({ where: { token: refreshToken } });
        deleteCookie(c, "access_token");
        deleteCookie(c, "refresh_token");
        return c.json({ error: "Session expired, please login again" }, 401);
    }

    // 15 minute idle timeout check
    const idleTimeout = 15 * 60 * 1000;
    if (Date.now() - storedRefreshToken.lastAccessTokenAt.getTime() > idleTimeout) {
        await prisma.token.deleteMany({ where: { token: refreshToken } });
        deleteCookie(c, "access_token");
        deleteCookie(c, "refresh_token");
        return c.json({ error: "Session expired due to inactivity" }, 401);
    }

    // Verify JWT
    try {
        // Get the payload from refresh token
        const payload = await verifyToken(refreshToken);
        // Generate new access token
        const accessToken = await signAccessToken({
            id: payload.id as number,
            email: payload.email as string,
            role: payload.role as string,
        });

        // Update the last active
        await prisma.token.update({
            where: { token: refreshToken },
            data: { lastAccessTokenAt: new Date() },
        });

        // Set cookie with new access token
        setCookie(c, "access_token", accessToken, {
            httpOnly: true,
            secure: Deno.env.get("DENO_ENV") === "production",
            sameSite: "Lax",
            maxAge: 60 * 15,
            path: "/",
        });

    } catch {
        await prisma.token.deleteMany({ where: { token: refreshToken } });
        deleteCookie(c, "access_token");
        deleteCookie(c, "refresh_token");
        return c.json({ error: "Invalid token, please login again" }, 401);
    }
    return c.json({ ok: true });
});

/** Logout endpoint */
auth.post("/logout", (c) => {
  setCookie(c, "token", "", { maxAge: 0, path: "/" });
  return c.json({ ok: true });
});

export default auth;