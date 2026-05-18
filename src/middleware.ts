import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

// Use the traditional middleware.ts format (Next.js 15-style).
// proxy.ts (Next.js 16) is not yet fully supported by Vercel's build adapter.
const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  try {
    return intlMiddleware(request);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
