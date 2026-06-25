import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { cookies, headers } from "next/headers";

import { signBackendToken } from "@/lib/backend-token";
import { authOptions } from "@/lib/auth";
import { getMe, type MeResponse } from "@/lib/api";

async function readSessionToken() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const session = await getToken({
    req: {
      headers: Object.fromEntries(headerStore.entries()),
      cookies: Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value])),
    } as never,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!session?.email) {
    return null;
  }

  return signBackendToken(session);
}

export async function getSessionToken() {
  return readSessionToken();
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }
  return session;
}

export async function getCurrentUserProfile(): Promise<MeResponse | null> {
  const session = await requireSession();
  if (!session) {
    return null;
  }

  const token = await readSessionToken();
  if (!token) {
    return null;
  }

  try {
    return await getMe(token);
  } catch {
    return null;
  }
}
