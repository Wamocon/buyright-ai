import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
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
