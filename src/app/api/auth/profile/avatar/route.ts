import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.histeeria.com";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await getToken({
    req: request as never,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await signBackendToken(session);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { avatar_url?: string | null };
    const res = await fetch(`${API_URL}/v1/auth/me/avatar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatar_url: body.avatar_url ?? null }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Unable to update profile photo" }, { status: 502 });
  }
}
