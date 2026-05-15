"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname(); // full path, e.g. "/de/analyze" or "/analyze"
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    // Strip any existing locale prefix (/de or /en)
    const withoutLocale = pathname.replace(/^\/(de|en)(\/|$)/, "/") || "/";

    // Build new path: DE gets /de prefix, EN (default) gets no prefix
    const newPath =
      next === "de"
        ? `/de${withoutLocale === "/" ? "" : withoutLocale}`
        : withoutLocale;

    startTransition(() => {
      router.push(newPath);
      router.refresh(); // force server components to re-render with new locale
    });
  }

  const isDE = locale === "de";

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
      <LocaleBtn
        label="EN"
        active={!isDE}
        pending={isPending}
        onClick={() => switchLocale("en")}
      />
      <LocaleBtn
        label="DE"
        active={isDE}
        pending={isPending}
        onClick={() => switchLocale("de")}
      />
    </div>
  );
}

function LocaleBtn({
  label,
  active,
  pending,
  onClick,
}: {
  label: string;
  active: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={pending || active}
      className={`relative h-6 w-8 rounded-md text-[11px] font-semibold transition-all duration-200 ${
        active
          ? "text-white"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="langPill"
            className="absolute inset-0 rounded-md bg-gradient-to-r from-indigo-500 to-violet-600 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{label}</span>
    </button>
  );
}
