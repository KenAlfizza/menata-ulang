import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secret = new TextEncoder().encode(Deno.env.get("JWT_SECRET"));
const alg = 'HS256';
const expTime = '2h'

export interface TokenPayload extends JWTPayload {
    id: number,
    email: string,
    role: string,
}

export const signToken = async (payload: TokenPayload) => {
    return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expTime)
    .sign(secret)
}

export const verifyToken = async (token: string) => {
  const { payload } = await jwtVerify(token, secret);
  return payload;
};