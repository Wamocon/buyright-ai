"use server";

import { analyzeBudgetOptimizer } from "@/services/ai";
import { checkRateLimit, incrementUsage } from "@/services/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { BudgetOptimizerResult } from "@/types";

export interface BudgetOptimizerActionResult {
  success: boolean;
  data?: BudgetOptimizerResult;
  error?: string;
  rateLimitExceeded?: boolean;
  remaining?: number;
}

export async function budgetOptimizerAction(
  formData: FormData,
): Promise<BudgetOptimizerActionResult> {
  try {
    const budgetRaw = formData.get("budget") as string;
    const currency = (formData.get("currency") as string) || "€";
    const locale = (formData.get("locale") as string) || "en";

    const budget = parseFloat(budgetRaw);
    if (isNaN(budget) || budget <= 0) {
      return { success: false, error: "Please enter a valid budget amount." };
    }

    // Parse items - newline separated
    const itemsRaw = (formData.get("items") as string) ?? "";
    const items = itemsRaw
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (items.length < 2) {
      return { success: false, error: "Please enter at least 2 items." };
    }
    if (items.length > 15) {
      return { success: false, error: "Maximum 15 items allowed." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      "unknown";

    const rateCheck = await checkRateLimit(user?.id, ip);
    if (!rateCheck.allowed) {
      return {
        success: false,
        rateLimitExceeded: true,
        remaining: 0,
        error: "Daily limit reached. Upgrade to Pro for unlimited analyses.",
      };
    }

    const result = await analyzeBudgetOptimizer(budget, currency, items, locale);
    await incrementUsage(user?.id, ip);

    return { success: true, data: result, remaining: rateCheck.remaining - 1 };
  } catch (err) {
    console.error("[budgetOptimizerAction] error:", err);
    return {
      success: false,
      error: "Budget optimization failed. Please try again.",
    };
  }
}
