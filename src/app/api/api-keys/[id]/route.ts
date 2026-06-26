import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { deleteApiKey, updateApiKey } from "@/lib/api";

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
    const data = await updateApiKey(token, resolved.id, body);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update API key";
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
    await deleteApiKey(token, resolved.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete API key";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
