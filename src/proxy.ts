import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATHS = ["/analyze", "/compare", "/dashboard", "/settings", "/profile"];
const AUTH_PATHS = ["/login", "/signup"];
const LOCALES = ["en", "de"] as const;

/** Strip locale prefix to get the bare path. "/" for default EN with no prefix. */
function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

/** Extract locale from pathname, null for no prefix (default locale). */
function extractLocale(pathname: string): string | null {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale;
  }
  return null;
}

export async function proxy(request: NextRequest) {
  try {
    return await proxyInner(request);
  } catch {
    // Absolute safety net: never let the proxy crash with MIDDLEWARE_INVOCATION_FAILED.
    // Pass the request through without locale handling or auth checks.
    return NextResponse.next();
  }
}

async function proxyInner(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const stripped = stripLocale(pathname);
  const locale = extractLocale(pathname); // null = default (en)

  // Run intl middleware first to get locale-aware response with cookies
  const intlResponse = intlMiddleware(request);

  // Attach Supabase session refresh to the intl response.
  // Guard against missing env vars (e.g. during CI build or cold-start with empty secrets).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  let user = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            for (const { name, value, options } of cookiesToSet) {
              intlResponse.cookies.set(name, value, options);
            }
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Supabase is unreachable (wrong URL, network issue, etc.) - treat as anonymous.
      // This prevents MIDDLEWARE_INVOCATION_FAILED on Vercel Edge.
      user = null;
    }
  }

  const isProtected = PROTECTED_PATHS.some((p) => stripped === p || stripped.startsWith(`${p}/`));
  const isAuthPage = AUTH_PATHS.some((p) => stripped === p || stripped.startsWith(`${p}/`));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = locale ? `/${locale}/login` : "/login";
    url.search = "";
    // Store locale-free path so next-intl router on login page doesn't double-prefix
    url.searchParams.set("redirect", stripped + (request.nextUrl.search ?? ""));
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = locale ? `/${locale}/dashboard` : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

