import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "nexa_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
