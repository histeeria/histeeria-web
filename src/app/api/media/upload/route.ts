import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.histeeria.com";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const incoming = await request.formData();
  const purpose = incoming.get("purpose");
  const file = incoming.get("file");
  const email = incoming.get("email");
  const code = incoming.get("code");

  if (typeof purpose !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "purpose and file are required" }, { status: 400 });
  }

  const session = await getToken({
    req: request as never,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!session?.email) {
    // Registration flow is not authenticated yet. Permit only owner avatar uploads
    // when accompanied by a valid OTP code.
    if (
      purpose !== "owner_avatar" ||
      typeof email !== "string" ||
      typeof code !== "string" ||
      !email.trim() ||
      !code.trim()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const outbound = new FormData();
      outbound.append("email", email.trim());
      outbound.append("code", code.trim());
      outbound.append("file", file, file.name);

      const res = await fetch(`${API_URL}/v1/auth/register/avatar-upload`, {
        method: "POST",
        body: outbound,
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch {
      return NextResponse.json({ error: "Media service unavailable" }, { status: 502 });
    }
  }

  const token = await signBackendToken(session);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const outbound = new FormData();
    outbound.append("purpose", purpose);
    outbound.append("file", file, file.name);

    const res = await fetch(`${API_URL}/v1/media/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: outbound,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Media service unavailable" }, { status: 502 });
  }
}
