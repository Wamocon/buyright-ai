import { Shield } from "lucide-react";
import Link from "next/link";

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const iconSize = size === "large" ? "h-8 w-8" : "h-6 w-6";
  const textSize = size === "large" ? "text-2xl" : "text-xl";

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 shadow-lg shadow-indigo-500/20 transition-shadow group-hover:shadow-indigo-500/30">
        <Shield className={`${iconSize} text-white`} />
      </div>
      <span
        className={`${textSize} font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400`}
      >
        BuyRight
        <span className="ml-0.5 font-light text-muted-foreground">AI</span>
      </span>
    </Link>
  );
}
