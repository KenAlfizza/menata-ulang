import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie} from "hono/cookie";

// Library imports
import { prisma, Prisma } from "../lib/prisma.ts";
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt.ts";
import { hashPassword, comparePassword } from "../lib/hash.ts";
import { generateResetToken } from "../lib/resetToken.ts";
import { sendPasswordResetEmail } from "../lib/mail.ts";

import { validate } from "../lib/validators/index.ts";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "../lib/validators/auth.ts";

const auth = new Hono();

/**
 * POST /register - Register new account
 *
 * Middleware: `authMiddleware`, `validate("json", registerSchema)`.
 * Authorization: users with role `AUTHOR` or `SUPERUSER` may create stories.
 *
 * Accepted form fields: `email`, `password`, `email`.
 * Behavior: register a new account and error if account already exists
 *
 * Responses:
 * - 201: regsitration successful
 * - 409: account already exists
 * - 500: internal server error
 */
auth.post("/register", 
    validate("json", registerSchema),
    async (c) => {
    const { email, password, name } = c.req.valid("json");

    // Encrypt password
    const hashedPassword = await hashPassword(password);

    try {
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
    } catch (error) {
        // If account with email exists return 409
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return c.json({ error: "Account with specified email exists" }, 409);
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return c.json({ error: "Internal server error" }, 500);
        }
        return c.json({ error: 'Failed to process request' }, 500);
    }
});

/**
 * POST /login - Login a user
 *
 * Middleware: `validate("json", loginSchema)`.
 * Authorization: None.
 *
 * Accepted form fields: `email`, `password`.
 * Behavior: Verify user information
 * On success, generate access token and refresh token.
 * Note: access token is in auth header and refresh token is in secure cookie
 * On failure, return 404 if the account not found, 401 if unauthorized 
 *
 * Responses:
 * - 200: login successful
 * - 404: account not found
 * - 401: invalid credentials
 * - 500: internal server error
 */
auth.post("/login", 
    validate("json", loginSchema),
    async (c) => {
    const { email, password } = c.req.valid("json");
    
    // Get user with specified email
    try {
        const user = await prisma.user.findUnique({
            where: {email}
        });
        // Return 404 if account is not found
        if (!user) return c.json({ error: "Account not found" }, 404);

        // Verify password
        if (user.password === null) {
            return c.json({ error: "Unauthorized" }, 401)
        }
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
            path: "/",
        });

        // Access token in response body used in auth header
        return c.json({ 
            message: "Login successful", 
            ok: true,
            token: accessToken
        }, 200);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return c.json({ error: "Internal server error" }, 500);
        }
        return c.json({ error: 'Failed to process request' }, 500);
    }

});

/**
 * POST /refresh - Refresh an access token
 *
 * Middleware: None.
 * Authorization: Requires valid refresh token in secure cookie `refresh_token`.
 *
 * Accepted form fields: None.
 * Behavior: Validate the refresh token stored in the secure cookie.
 * If the refresh token exists, is not expired, and the user has been active
 * within the 15 minute idle window since the last access token was issued,
 * generate and return a new access token and update the last activity timestamp.
 * If the refresh token is expired, invalid, or the idle timeout has been exceeded,
 * delete the refresh token, clear the cookie, and force the user to login again.
 *
 * Responses:
 * - 200: access token refreshed successfully
 * - 401: unauthorized, invalid token, expired session, or inactivity timeout
 * - 500: internal server error
 */
auth.post("/refresh", async (c) => {
    const refreshToken = getCookie(c, "refresh_token");
    if (!refreshToken) return c.json({ error: "Unauthorized" }, 401);

    try {
        // If refresh token expired or not found, force logout
        const storedRefreshToken = await prisma.token.findUnique({ where: { token: refreshToken } });
        if (!storedRefreshToken || storedRefreshToken.expiresAt < new Date()) {
            await prisma.token.deleteMany({ where: { token: refreshToken } });
            deleteCookie(c, "refresh_token", { path: "/" });
            return c.json({ error: "Session expired, please login again" }, 401);
        }

        // 15 minute idle timeout check
        const idleTimeout = 15 * 60 * 1000;
        if (Date.now() - storedRefreshToken.lastAccessTokenAt.getTime() > idleTimeout) {
            await prisma.token.deleteMany({ where: { token: refreshToken } });
            deleteCookie(c, "refresh_token", { path: "/" });
            return c.json({ error: "Session expired due to inactivity" }, 401);
        }

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

        return c.json({ ok: true, token: accessToken });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return c.json({ error: "Internal server error" }, 500);
        }

        // JWT error
        await prisma.token.deleteMany({ where: { token: refreshToken } });
        deleteCookie(c, "refresh_token", { path: "/" });
        return c.json({ error: "Invalid token, please login again" }, 401);
    }
});

/**
 * POST /logout - Logout a user
 *
 * Middleware: None.
 * Authorization: Requires refresh token in secure cookie `refresh_token`.
 *
 * Accepted form fields: None.
 * Behavior: Retrieve the refresh token from the secure cookie and remove the
 * corresponding token record from the database. The refresh token cookie is
 * then cleared so it can no longer be used to generate new access tokens.
 * If the token does not exist, the endpoint still clears the cookie and
 * returns a successful logout response.
 *
 * Responses:
 * - 200: logout successful
 * - 500: internal server error
 */
auth.post("/logout", async (c) => {
    const refreshToken = getCookie(c, "refresh_token");

    // Remove refresh token from db
    if (refreshToken) {
        try {
            await prisma.token.deleteMany({where : {token: refreshToken}}); 
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                deleteCookie(c, "refresh_token", { path: "/" });
                return c.json({ error: "Internal server error" }, 500);
            }
        }
    }
    // Remove refresh token form cookie
    deleteCookie(c, "refresh_token", { path: "/auth/refresh" });
    return c.json({ message: "Logout successful", ok: true });
});

/**
 * POST /forgot-password - Request a password reset
 *
 * Middleware: `validate("json", forgotSchema)`.
 * Authorization: None.
 *
 * Accepted form fields: `email`.
 * Behavior: Check if a user with the given email exists. To prevent email
 * enumeration, the endpoint always returns a success response regardless
 * of whether the account exists. If the user exists, any existing password
 * reset tokens for that user are removed, a new reset token is generated
 * and stored with a 15 minute expiration, and a password reset email
 * containing the token is sent to the user.
 *
 * Responses:
 * - 200: reset request processed (email sent if account exists)
 * - 500: internal server error
 */
auth.post("/forgot-password", validate("json", forgotSchema), async (c) => {
    const { email } = c.req.valid("json");
    
    try {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: {email: email}});
        
        // Always return success even if user not found to prevent email enumeration
        if (!user) return c.json({ message: "If that email exists, a reset link has been sent" }, 200);
        
        // Delete any existing reset token
        await prisma.token.deleteMany(
            {where: {userId: user.id, type: "RESET"}}
        );

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

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return c.json({ error: "Internal server error" }, 500);
        }
        return c.json({ error: "Failed to process request" }, 500);
    }
});

/**
 * POST /reset-password - Reset a user's password
 *
 * Middleware: `validate("json", resetSchema)`.
 * Authorization: None.
 *
 * Accepted form fields: `token`, `password`.
 * Behavior: Verify the provided password reset token. If the token does not
 * exist, is not of type `RESET`, or has expired, the token is removed (if it
 * exists) and the request is rejected. If the token is valid, the new password
 * is hashed and the user's password is updated. The reset token is then deleted
 * and all existing refresh tokens for the user are removed to force logout from
 * all sessions.
 *
 * Responses:
 * - 200: password reset successful
 * - 401: invalid or expired reset token
 * - 500: internal server error
 */
auth.post("/reset-password", validate("json", resetSchema), async (c) => {
    const { token, password } = c.req.valid("json");

    try {
        // Verify token
        const storedToken = await prisma.token.findUnique({ where: { token } });

        if (!storedToken || storedToken.type !== "RESET" || storedToken.expiresAt < new Date()) {
            if (storedToken) await prisma.token.delete({ where: { token } });
            return c.json({ error: "Invalid or expired reset token" }, 401);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Update password, delete reset and refresh tokens
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: storedToken.userId },
                data: { password: hashedPassword },
            });

            await tx.token.delete({ where: { token } });

            await tx.token.deleteMany({
                where: {
                    userId: storedToken.userId,
                    type: "REFRESH",
                }
            });
        });
        // Return success
        return c.json({ message: "Password reset successful, please login again" }, 200);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return c.json({ error: "Internal server error" }, 500);
        }
        return c.json({ error: "Failed to reset password" }, 500);
    }
});

export default auth;