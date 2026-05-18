import { type NextRequest, NextResponse } from "next/server";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";

function detectLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  const accept = req.headers.get("accept-language") ?? "";
  const preferred = accept.split(",")[0]?.trim().split(/[-_]/)[0];
  if (preferred && locales.includes(preferred as Locale)) {
    return preferred as Locale;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Check if path already starts with a supported locale
  const hasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (hasLocale) {
    // Pass through - extract locale and set header for next-intl
    const locale = locales.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
    ) as Locale;
    const res = NextResponse.next();
    res.headers.set("x-next-intl-locale", locale);
    return res;
  }

  // No locale prefix - use detection and redirect if non-default
  const locale = detectLocale(request);
  if (locale !== defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Default locale - pass through without prefix
  const res = NextResponse.next();
  res.headers.set("x-next-intl-locale", defaultLocale);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
