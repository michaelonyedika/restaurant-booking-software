import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("user-token")?.value;

  const verifiedToken = token
    ? await verifyAuth(token).catch(() => null)
    : null;

  if (req.nextUrl.pathname.startsWith("/login") && !verifiedToken) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname === "/login" && verifiedToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!verifiedToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
