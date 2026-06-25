import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = await getToken({
    req: request as never,
    secret: process.env.NEXTAUTH_SECRET,
    raw: true,
  });

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
