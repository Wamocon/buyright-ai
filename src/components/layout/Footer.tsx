"use client";

import { Link } from "@/navigation";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  const footerLinks = {
    product: [
      { href: "/analyze", label: t("analyze") },
      { href: "/compare", label: t("compare") },
      { href: "/#pricing", label: t("pricing") },
      { href: "/#features", label: t("features") },
    ],
    legal: [
      { href: "/impressum", label: t("imprint") },
      { href: "/datenschutz", label: t("privacy") },
      { href: "/agb", label: t("terms") },
    ],
    company: [
      { href: "mailto:info@wamocon.com", label: t("contact") },
    ],
  };

  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <AnimatedLogo size="sm" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold">{t("product")}</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold">{t("legal")}</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold">{t("company")}</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} WAMOCON GmbH. {t("rights")}
          </p>
          <p className="text-xs text-muted-foreground">
            Mergenthalerallee 79-81, 65760 Eschborn, Deutschland
          </p>
        </div>
      </div>
    </footer>
  );
}
