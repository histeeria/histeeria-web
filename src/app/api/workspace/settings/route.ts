import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { getWorkspaceSettings, updateWorkspaceSettings } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function sessionToken(request: Request) {
  const session = await getToken({
    req: request as never,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!session?.email) {
    return null;
  }

  return signBackendToken(session);
}

export async function GET(request: Request) {
  const token = await sessionToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getWorkspaceSettings(token);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Upstream API unavailable" }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const token = await sessionToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = await updateWorkspaceSettings(token, body);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
