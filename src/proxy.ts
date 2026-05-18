import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal proxy - just pass through, no locale handling
// Used to test whether MIDDLEWARE_INVOCATION_FAILED is from proxy code or Vercel config
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

