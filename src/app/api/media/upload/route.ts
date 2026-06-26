import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
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
    const incoming = await request.formData();
    const purpose = incoming.get("purpose");
    const file = incoming.get("file");
    if (typeof purpose !== "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "purpose and file are required" }, { status: 400 });
    }

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
