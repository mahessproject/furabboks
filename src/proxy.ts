import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const PUBLIC_ROUTES = ["/", "/about", "/auth/login", "/auth/register"];
const ADMIN_ROUTES_PREFIX = "/dashboard";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { supabase, user, supabaseResponse } = await updateSession(request);

  // ! DEVELOPMENT OVERRIDE: Redirects sedang di-disable untuk desain UI
  /*
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/api/auth");

  if (!user) {
    if (isPublicRoute) return supabaseResponse;

    const loginUrl = new URL("/?auth=login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  const role = profile?.role ?? "user";

  if (pathname.startsWith("/auth/")) {
    const destination = role === "admin" ? "/dashboard" : "/books";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (role !== "admin" && pathname.startsWith(ADMIN_ROUTES_PREFIX)) {
    return NextResponse.redirect(new URL("/books", request.url));
  }
  */

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Jalankan proxy di semua route kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - File statis dengan ekstensi umum (svg, png, jpg, dll.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
