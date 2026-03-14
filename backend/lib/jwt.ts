import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * JWT configuration and helpers.
 *
 * Behavior: Uses the `jose` library to sign and verify JSON Web Tokens (JWTs)
 * for authentication. Tokens are signed with an HMAC SHA-256 algorithm (HS256)
 * using a secret from the environment variable `JWT_SECRET`.
 *
 * Environment variables:
 * - JWT_SECRET: Secret key used for signing and verifying tokens.
 */
const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET"));
const alg = 'HS256';


/**
 * Payload structure for access and refresh tokens.
 */
export interface TokenPayload extends JWTPayload {
    id: number,
    email: string,
    role: string,
}

/**
 * Sign a short-lived access token.
 *
 * @param payload The payload containing user information.
 *
 * Behavior: Generates a JWT access token valid for 15 minutes using HS256.
 *
 * Returns:
 * - string: The signed JWT access token.
 */
export const signAccessToken = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setExpirationTime("15m")
    .sign(secret);
};

/**
 * Sign a long-lived refresh token.
 *
 * @param payload The payload containing user information.
 *
 * Behavior: Generates a JWT refresh token valid for 30 days using HS256.
 *
 * Returns:
 * - string: The signed JWT refresh token.
 */
export const signRefreshToken = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setExpirationTime("30d")
    .sign(secret);
};

/**
 * Verify a JWT token.
 *
 * @param token The JWT string to verify.
 *
 * Behavior: Verifies the token signature and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 *
 * Returns:
 * - TokenPayload: The decoded payload containing user info.
 */
export const verifyToken = async (token: string) => {
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
};