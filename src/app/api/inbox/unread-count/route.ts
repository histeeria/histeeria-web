import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";
import { getInboxUnreadCount } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getToken({
    req: request as never,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!session?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = await signBackendToken(session);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await getInboxUnreadCount(token);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ unread_count: 0 });
  }
}
