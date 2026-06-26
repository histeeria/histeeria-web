import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { deleteAgentProfile, getAgentProfileDetail, updateAgentProfile } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function sessionToken(request: Request) {
  const session = await getToken({
    req: request as never,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!session?.email) return null;
  return signBackendToken(session);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const token = await sessionToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resolved = params instanceof Promise ? await params : params;
  try {
    const data = await getAgentProfileDetail(token, resolved.id);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const token = await sessionToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resolved = params instanceof Promise ? await params : params;
  try {
    const body = await request.json();
    const data = await updateAgentProfile(token, resolved.id, body);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const token = await sessionToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resolved = params instanceof Promise ? await params : params;
  try {
    await deleteAgentProfile(token, resolved.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
