"use client";

import { motion } from "framer-motion";
import { Link } from "@/navigation";

interface AnimatedLogoProps {
  size?: "sm" | "default" | "lg" | "hero";
  showText?: boolean;
  href?: string;
}

// Shield path (viewBox 0 0 48 54)
const SHIELD = "M24 2 L44 10 L44 31 C44 43 35 51 24 54 C13 51 4 43 4 31 L4 10 Z";
// Checkmark inside
const CHECK = "M14 27 L21 35 L35 19";
// Small sparkle dot positions
const SPARKS = [
  { cx: 40, cy: 8, delay: 0 },
  { cx: 44, cy: 22, delay: 0.4 },
  { cx: 38, cy: 38, delay: 0.8 },
  { cx: 8, cy: 38, delay: 1.2 },
  { cx: 4, cy: 22, delay: 0.6 },
  { cx: 8, cy: 8, delay: 1.0 },
];

export function AnimatedLogo({
  size = "default",
  showText = true,
  href = "/",
}: AnimatedLogoProps) {
  const dims = {
    sm: { icon: 28, text: "text-base", sub: "text-[9px]", gap: "gap-2" },
    default: { icon: 36, text: "text-lg", sub: "text-[10px]", gap: "gap-2.5" },
    lg: { icon: 44, text: "text-xl", sub: "text-xs", gap: "gap-3" },
    hero: { icon: 72, text: "text-3xl", sub: "text-sm", gap: "gap-4" },
  }[size];

  const iconH = Math.round(dims.icon * 54 / 48);
  const showSparks = size === "hero" || size === "lg";

  const icon = (
    <motion.div
      className="relative shrink-0"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width={dims.icon}
        height={iconH}
        viewBox="0 0 48 54"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow layer */}
        <motion.path
          d={SHIELD}
          fill="url(#logoGrad)"
          opacity={0.35}
          filter="url(#logoGlow)"
          animate={{ opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Shield body */}
        <path d={SHIELD} fill="url(#logoGrad)" />

        {/* Inner highlight */}
        <path
          d="M24 6 L40 13 L40 30 C40 40 33 47 24 50 C15 47 8 40 8 30 L8 13 Z"
          fill="white"
          opacity={0.08}
        />

        {/* Checkmark - draws in on mount */}
        <motion.path
          d={CHECK}
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        />

        {/* Spark dots (hero/lg only) */}
        {showSparks &&
          SPARKS.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={1.8}
              fill="white"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.9, 0], scale: [0, 1, 0] }}
              transition={{
                duration: 2,
                delay: s.delay,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
            />
          ))}
      </svg>
    </motion.div>
  );

  if (!showText) return icon;

  return (
    <Link href={href} className={`flex items-center ${dims.gap} group`}>
      {icon}
      <div className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400 ${dims.text}`}
        >
          BuyRight
          <span className="ml-1 inline-block rounded bg-indigo-500/15 px-1 py-0.5 text-[65%] font-bold text-indigo-600 dark:text-indigo-400 align-middle">
            AI
          </span>
        </span>
        {size === "hero" && (
          <span className="mt-1 text-xs text-muted-foreground font-medium">
            AI-powered buying decisions
          </span>
        )}
      </div>
    </Link>
  );
}

/** Large centered logo for landing / login pages */
export function HeroLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-3"
    >
      <AnimatedLogo size="hero" showText={false} href="/" />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center"
      >
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
          BuyRight
          <span className="ml-2 inline-block rounded-md bg-indigo-500/15 px-2 py-0.5 text-[65%] font-bold text-indigo-600 dark:text-indigo-400 align-middle">
            AI
          </span>
        </span>
      </motion.div>
    </motion.div>
  );
}
