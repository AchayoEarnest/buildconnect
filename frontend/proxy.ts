import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/_next",
  "/favicon",
  "/manifest",
];

const ADMIN_PATHS = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const role = request.cookies.get("user_role")?.value;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/feed", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
