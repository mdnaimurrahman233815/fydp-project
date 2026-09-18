import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("fydp_session")?.value;
  const { pathname } = request.nextUrl;

  if ((pathname.startsWith("/student") || pathname.startsWith("/teacher")) && !token) {
    const login = pathname.startsWith("/teacher") ? "/login/teacher" : "/login/student";
    const url = request.nextUrl.clone();
    url.pathname = login;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*"],
};
