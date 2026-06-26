import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const session = await getToken({ req: request as never, secret: process.env.NEXTAUTH_SECRET });
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = await signBackendToken(session);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resolved = context.params instanceof Promise ? await context.params : context.params;

  const upstream = await fetch(`${API_URL}/v1/evaluation/reports/${resolved.id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "Report PDF not available" }, { status: upstream.status });
  }

  const buffer = await upstream.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ?? 'attachment; filename="report.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
