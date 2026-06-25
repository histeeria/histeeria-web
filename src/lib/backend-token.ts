import { SignJWT, type JWTPayload } from "jose";
import type { JWT } from "next-auth/jwt";

const TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

function getSigningSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function signBackendToken(session: JWT): Promise<string | null> {
  if (!session.email) {
    return null;
  }

  const payload: JWTPayload = {
    email: session.email,
    name: session.name,
    sub: (session.sub as string | undefined) ?? session.email,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE)
    .sign(getSigningSecret());
}
