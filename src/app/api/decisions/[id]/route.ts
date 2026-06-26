import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { getDecision } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
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

  const resolved = context.params instanceof Promise ? await context.params : context.params;

  try {
    const decision = await getDecision(token, resolved.id);
    return NextResponse.json(decision, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Decision not found" }, { status: 404 });
  }
}
