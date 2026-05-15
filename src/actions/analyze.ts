"use server";

import { analyzeProduct } from "@/services/ai";
import { analysisRequestSchema } from "@/schemas/analysis";
import { checkRateLimit, incrementUsage } from "@/services/rate-limit";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { AnalysisResult } from "@/types";

export interface AnalyzeActionResult {
  success: boolean;
  data?: AnalysisResult;
  checkId?: string;
  error?: string;
  rateLimitExceeded?: boolean;
  remaining?: number;
}

export async function analyzeAction(
  formData: FormData,
): Promise<AnalyzeActionResult> {
  try {
    const type = formData.get("type") as string;
    const value = formData.get("value") as string;
    const imageUrl = formData.get("imageUrl") as string | null;
    const locale = (formData.get("locale") as string) || "en";

    // Validate input
    const parsed = analysisRequestSchema.safeParse({
      type,
      value,
      imageUrl: imageUrl || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    // Check auth and rate limits
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
        error:
          "Daily limit reached. Upgrade to Pro for unlimited analyses.",
      };
    }

    // Run AI analysis
    const result = await analyzeProduct(
      parsed.data.type,
      parsed.data.value,
      parsed.data.imageUrl,
      locale,
    );

    // Increment usage
    await incrementUsage(user?.id, ip);

    // Store the check in the database (using service client to bypass RLS for anonymous)
    const serviceClient = await createServiceClient();
    const { data: insertedCheck } = await serviceClient.from("product_checks").insert({
      user_id: user?.id ?? null,
      anonymous_ip: user ? null : ip,
      input_type: parsed.data.type,
      input_value: parsed.data.value,
      image_url: parsed.data.imageUrl ?? null,
      result: result as unknown as Record<string, unknown>,
      score: result.score,
      recommendation: result.recommendation,
    }).select("id").single();

    return {
      success: true,
      data: result,
      checkId: insertedCheck?.id ?? undefined,
      remaining: rateCheck.remaining - 1,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}
