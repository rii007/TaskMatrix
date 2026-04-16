import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const DEMO_SESSION_COOKIE = "taskmatrix_demo_session";

function createSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });
}

function cloneCookies(source: NextResponse, destination: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie.name, cookie.value, cookie);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const hasDemoSession = request.cookies.get(DEMO_SESSION_COOKIE)?.value === "1";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(request, response);

  if (!supabase) {
    if (isDashboardRoute && !hasDemoSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthRoute && hasDemoSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  }

  const { data } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(data.user);

  if (isDashboardRoute && !isAuthenticated && !hasDemoSession) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    cloneCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (isAuthRoute && (isAuthenticated || hasDemoSession)) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    cloneCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"]
};