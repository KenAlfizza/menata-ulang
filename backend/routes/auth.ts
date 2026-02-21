import { Hono } from "hono";
import { prisma } from "../lib/prisma.ts";

import { setCookie, getCookie, deleteCookie} from "hono/cookie";

// Library imports
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt.ts";
import { hashPassword, comparePassword } from "../lib/hash.ts";
import { generateResetToken } from "../lib/resetToken.ts";
import { sendPasswordResetEmail } from "../lib/mail.ts";

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
    return c.json({ message: "Registration successful", ok: true }, 201);
})

/** Login endpoint 
 * Verify user information
 * On success, generate access token and refresh token.
 * Note: access token is in auth header and refresh token is in secure cookie
 * On failure, return 404 if the account not found, 401 if unauthorized 
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
    setCookie(c, "refresh_token", refreshToken, {
        httpOnly: true,
        secure: Deno.env.get("DENO_ENV") === "production",
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/auth/refresh",
    });

    // Access token in response body used in auth header
    return c.json({ 
        message: "Login successful", 
        ok: true,
        token: accessToken
    }, 200);
});

/** Refresh token endpoint 
 * If the user is active at any point under 15 minute window since the access token is issued, 
 * regenerate new access token and record the date. Otherwise, logout the user and remove the access token
*/
auth.post("/refresh", async (c) => {
    const refreshToken = getCookie(c, "refresh_token");
    if (!refreshToken) return c.json({ error: "Unauthorized" }, 401);
    
    // If refresh token expired or not found, force logout
    const storedRefreshToken = await prisma.token.findUnique({where: {token: refreshToken}});
    if (!storedRefreshToken || storedRefreshToken.expiresAt < new Date()) {
        await prisma.token.deleteMany({ where: { token: refreshToken } });
        deleteCookie(c, "refresh_token", { path: "/auth/refresh" });
        return c.json({ error: "Session expired, please login again" }, 401);
    }

    // 15 minute idle timeout check
    const idleTimeout = 15 * 60 * 1000;
    if (Date.now() - storedRefreshToken.lastAccessTokenAt.getTime() > idleTimeout) {
        await prisma.token.deleteMany({ where: { token: refreshToken } });
        deleteCookie(c, "refresh_token", { path: "/auth/refresh" });
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
        // return new access token
        return c.json({ ok: true, token: accessToken });

    } catch {
        await prisma.token.deleteMany({ where: { token: refreshToken } });
        deleteCookie(c, "refresh_token", { path: "/auth/refresh" });
        return c.json({ error: "Invalid token, please login again" }, 401);
    }
});

/** Logout endpoint 
 * Remove refresh token and clear cookie
*/
auth.post("/logout", async (c) => {
    const refreshToken = getCookie(c, "refresh_token");

    // Remove refresh token from db
    if (refreshToken) {
        await prisma.token.deleteMany({where : {token: refreshToken}}); 
    }
    // Remove refresh token form cookie
    deleteCookie(c, "refresh_token", { path: "/auth/refresh" });
    return c.json({ message: "Logout sucessfull", ok: true });
});

/** Forgot password endpoint
 * Allows the user to reset password when the user forgets them
 * Generate reset token and send email to user
 */
auth.post("/forgot-password", async (c) => {
    const { email } = await c.req.json();
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: {email: email}});
    
    // Always return success even if user not found to prevent email enumeration
    if (!user) return c.json({ message: "If that email exists, a reset link has been sent" }, 200);
    
    // Delete any existing reset token
    await prisma.token.deleteMany(
        {where: {userId: user.id, type: "RESET"}}
    )

    // Generate new reset token and store in DB
    const resetToken = generateResetToken();
    await prisma.token.create({
        data: {
            token: resetToken,
            type: "RESET",
            userId: user.id,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
    });

    // Send email to user
    await sendPasswordResetEmail(user.email, resetToken);
    // Return success
    return c.json({ message: "If that email exists, a reset link has been sent" }, 200);
});


export default auth;