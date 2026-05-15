"use server";

import { analyzeFakeDetector } from "@/services/ai";
import { checkRateLimit, incrementUsage } from "@/services/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { FakeDetectorResult } from "@/types";

export interface FakeDetectorActionResult {
  success: boolean;
  data?: FakeDetectorResult;
  error?: string;
  rateLimitExceeded?: boolean;
  remaining?: number;
}

export async function fakeDetectorAction(
  formData: FormData,
): Promise<FakeDetectorActionResult> {
  try {
    const type = (formData.get("type") as string) === "url" ? "url" : "text";
    const value = (formData.get("value") as string)?.trim() ?? "";
    const locale = (formData.get("locale") as string) || "en";

    if (!value) {
      return { success: false, error: "Please enter a product URL or name." };
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

    const result = await analyzeFakeDetector(type, value, locale);
    await incrementUsage(user?.id, ip);

    return { success: true, data: result, remaining: rateCheck.remaining - 1 };
  } catch (err) {
    console.error("[fakeDetectorAction] error:", err);
    return {
      success: false,
      error: "Analysis failed. Please try again.",
    };
  }
}
