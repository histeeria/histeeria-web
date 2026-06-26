import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { markInboxRead } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const session = await getToken({
    req: request as never,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resolved = params instanceof Promise ? await params : params;
  try {
    const token = await signBackendToken(session);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await markInboxRead(token, resolved.id);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark read";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
