import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { getAgentProfileDashboard } from "@/lib/api";

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
  const url = new URL(request.url);
  const days = url.searchParams.get("days");
  const subAgentId = url.searchParams.get("sub_agent_id") ?? undefined;

  try {
    const data = await getAgentProfileDashboard(token, resolved.id, {
      days: days ? Number(days) : undefined,
      subAgentId,
    });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Dashboard unavailable" }, { status: 502 });
  }
}
