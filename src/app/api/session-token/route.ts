import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signBackendToken } from "@/lib/backend-token";

export async function GET(request: Request) {
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

  return NextResponse.json({ token });
}
