import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET"));
const alg = 'HS256';
const expTimeDefault = '2h'

export interface TokenPayload extends JWTPayload {
    id: number,
    email: string,
    role: string,
}

export const signAccessToken = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secret);
};

export const signRefreshToken = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
};

export const verifyToken = async (token: string) => {
  const { payload } = await jwtVerify(token, secret);
  return payload;
};