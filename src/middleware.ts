import { proxy } from "./proxy";

// Next.js middleware entry point.
// The actual logic lives in ./proxy.ts (intl locale routing + Supabase session refresh).
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - api      : Next.js API routes (handled separately)
     *  - _next    : Next.js build artefacts
     *  - _vercel  : Vercel platform internals
     *  - .*\..+   : Static files that have a file extension (e.g. .css, .js, .ico)
     */
    "/((?!api|_next|_vercel|.*\\..*$).*)",
  ],
};
