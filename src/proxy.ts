import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

// Initialize intl middleware at module level (synchronous, Edge-safe).
// Supabase session refresh is intentionally NOT done here because the Edge
// runtime on Vercel can time out if the Supabase host is unreachable.
// Auth protection is handled at the page level instead.
const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  try {
    return intlMiddleware(request);
  } catch {
    // Safety net: if locale routing fails for any reason, pass the request through.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

