import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { getDecisions, getDecisionStats } from "@/lib/api";

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

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agent_id") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");
  const includeStats = searchParams.get("stats") === "1";

  try {
    const listPromise = getDecisions(token, {
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
      agentId,
    });
    const statsPromise = includeStats ? getDecisionStats(token) : Promise.resolve(null);

    const [list, stats] = await Promise.all([listPromise, statsPromise]);
    return NextResponse.json(
      { decisions: list.decisions, total: list.total, stats },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Upstream API unavailable" }, { status: 502 });
  }
}
