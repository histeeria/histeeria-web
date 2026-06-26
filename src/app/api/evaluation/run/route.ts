import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { runEvaluation } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getToken({ req: request as never, secret: process.env.NEXTAUTH_SECRET });
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = await signBackendToken(session);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const agentId = new URL(request.url).searchParams.get("agent_id") ?? undefined;
  try {
    const data = await runEvaluation(token, agentId);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to run evaluation";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
