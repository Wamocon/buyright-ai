"use server";

import { analysisRequestSchema, comparisonVerdictSchema } from "@/schemas/analysis";
import { analyzeProduct } from "@/services/ai";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { COMPARISON_SYSTEM_PROMPT, buildComparisonPrompt } from "@/prompts/comparison";
import type { AnalysisResult, ComparisonResult, ComparisonVerdict } from "@/types";

export interface CompareActionResult {
  success: boolean;
  data?: ComparisonResult;
  error?: string;
  rateLimitExceeded?: boolean;
}

function tryParseJSON(text: string): unknown | null {
  try { return JSON.parse(text); } catch { /* noop */ }
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    try { return JSON.parse(jsonMatch[1].trim()); } catch { /* noop */ }
  }
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    try { return JSON.parse(objectMatch[0]); } catch { /* noop */ }
  }
  return null;
}

// Multi-provider, multi-model fallback for comparison
async function fetchComparisonVerdict(
  productA: AnalysisResult,
  productB: AnalysisResult,
  locale: string = "en",
): Promise<ComparisonVerdict | null> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModels = (process.env.GROQ_MODELS ?? "mixtral-8x7b-32768,qwen2-72b-32k,gemma-7b-it,llama3-70b-8192").split(",").map(m => m.trim()).filter(Boolean);
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const openrouterModels = (process.env.OPENROUTER_MODELS ?? process.env.OPENROUTER_MODEL ?? "openai/gpt-4o").split(",").map(m => m.trim()).filter(Boolean);
  const prompt = buildComparisonPrompt(
    productA.product_name,
    JSON.stringify({
      score: productA.score,
      market_position: productA.market_position,
      price_range_typical: productA.price_range_typical,
      pros: productA.pros,
      cons: productA.cons,
      warnings: productA.warnings,
      rating_breakdown: productA.rating_breakdown,
      user_sentiment: productA.user_sentiment,
      summary: productA.summary,
    }),
    productB.product_name,
    JSON.stringify({
      score: productB.score,
      market_position: productB.market_position,
      price_range_typical: productB.price_range_typical,
      pros: productB.pros,
      cons: productB.cons,
      warnings: productB.warnings,
      rating_breakdown: productB.rating_breakdown,
      user_sentiment: productB.user_sentiment,
      summary: productB.summary,
    }),
    locale,
  );
  const messages = [
    { role: "system", content: COMPARISON_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];
  // Helper for provider call
  async function callProvider({ provider, apiKey, apiUrl, models, messages, appUrl, title }: {
    provider: 'groq' | 'openrouter',
    apiKey: string,
    apiUrl: string,
    models: string[],
    messages: any[],
    appUrl: string,
    title: string,
  }): Promise<string> {
    let lastError;
    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const headers: Record<string, string> = {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          };
          if (provider === 'openrouter') {
            headers["HTTP-Referer"] = appUrl;
            headers["X-Title"] = title;
          }
          const body: any = {
            model,
            messages,
            temperature: 0.3,
            max_tokens: 1500,
          };
          const response = await fetch(provider === 'groq' ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers,
            body: JSON.stringify(body),
          });
          if (!response.ok) {
            const errorBody = await response.text();
            lastError = new Error(`${provider} API error (${response.status}): ${errorBody}`);
            continue;
          }
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (!content) throw new Error("No content in AI response");
          return content;
        } catch (err) {
          lastError = err;
        }
      }
    }
    throw lastError ?? new Error(`All ${provider} models failed`);
  }
  // 1. Try Groq
  if (groqApiKey && groqModels.length) {
    try {
      const content = await callProvider({
        provider: 'groq',
        apiKey: groqApiKey,
        apiUrl: "https://api.groq.com/openai/v1/chat/completions",
        models: groqModels,
        messages,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        title: "BuyRight AI Comparison",
      });
      const parsed = tryParseJSON(content);
      const validated = comparisonVerdictSchema.safeParse(parsed);
      if (validated.success) return validated.data;
    } catch (err) {
      // continue to next provider
    }
  }
  // 2. Try OpenRouter
  if (openrouterApiKey && openrouterModels.length) {
    try {
      const content = await callProvider({
        provider: 'openrouter',
        apiKey: openrouterApiKey,
        apiUrl: "https://openrouter.ai/api/v1/chat/completions",
        models: openrouterModels,
        messages,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        title: "BuyRight AI Comparison",
      });
      const parsed = tryParseJSON(content);
      const validated = comparisonVerdictSchema.safeParse(parsed);
      if (validated.success) return validated.data;
    } catch (err) {
      // continue to fallback
    }
  }
  return null;
}

export async function compareAction(formData: FormData): Promise<CompareActionResult> {
  try {
    const typeA = formData.get("type_a") as string;
    const valueA = formData.get("value_a") as string;
    const typeB = formData.get("type_b") as string;
    const valueB = formData.get("value_b") as string;
    const locale = (formData.get("locale") as string) || "en";

    const parsedA = analysisRequestSchema.safeParse({ type: typeA, value: valueA });
    const parsedB = analysisRequestSchema.safeParse({ type: typeB, value: valueB });

    if (!parsedA.success) return { success: false, error: `Product A: ${parsedA.error.issues[0]?.message ?? "Invalid input"}` };
    if (!parsedB.success) return { success: false, error: `Product B: ${parsedB.error.issues[0]?.message ?? "Invalid input"}` };

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Rate limit: comparison counts as 2 checks
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, daily_checks_used, last_check_date")
        .eq("id", user.id)
        .single();

      if (profile?.subscription_tier === "free") {
        const today = new Date().toISOString().split("T")[0];
        const checksUsed =
          profile.last_check_date === today ? (profile.daily_checks_used ?? 0) : 0;
        const dailyLimit = Number(process.env.RATE_LIMIT_FREE_DAILY ?? 3);
        if (checksUsed + 2 > dailyLimit) {
          return { success: false, rateLimitExceeded: true, error: "Daily limit reached. Upgrade to Pro for unlimited comparisons." };
        }
      }
    } else {
      const headerList = await headers();
      const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const today = new Date().toISOString().split("T")[0];
      const { data: rateLimit } = await supabase
        .from("rate_limits")
        .select("count")
        .eq("identifier", ip)
        .eq("date", today)
        .single();
      const count = (rateLimit?.count ?? 0) as number;
      const dailyLimit = Number(process.env.RATE_LIMIT_FREE_DAILY ?? 3);
      if (count + 2 > dailyLimit) {
        return { success: false, rateLimitExceeded: true, error: "Daily limit reached. Sign in to continue." };
      }
    }

    // Run both analyses in parallel
    const [resultA, resultB] = await Promise.all([
      analyzeProduct(parsedA.data.type, parsedA.data.value, parsedA.data.imageUrl, locale),
      analyzeProduct(parsedB.data.type, parsedB.data.value, parsedB.data.imageUrl, locale),
    ]);

    // Store both in product_checks
    const serviceClient = await createServiceClient();
    const userId = user?.id ?? null;
    await Promise.all([
      serviceClient.from("product_checks").insert({
        user_id: userId,
        input_type: parsedA.data.type,
        input_value: parsedA.data.value,
        score: resultA.score,
        recommendation: resultA.recommendation,
        result: resultA as unknown as Record<string, unknown>,
      }),
      serviceClient.from("product_checks").insert({
        user_id: userId,
        input_type: parsedB.data.type,
        input_value: parsedB.data.value,
        score: resultB.score,
        recommendation: resultB.recommendation,
        result: resultB as unknown as Record<string, unknown>,
      }),
    ]);

    // Update usage count by 2
    if (user) {
      const today = new Date().toISOString().split("T")[0];
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("daily_checks_used, last_check_date")
        .eq("id", user.id)
        .single();
      const checksUsed =
        profile?.last_check_date === today ? (profile?.daily_checks_used ?? 0) : 0;
      await serviceClient
        .from("profiles")
        .update({ daily_checks_used: checksUsed + 2, last_check_date: today })
        .eq("id", user.id);
    }

    // Get comparison verdict
    const verdict = await fetchComparisonVerdict(resultA, resultB, locale);

    // Fallback verdict if AI call fails
    const finalVerdict: ComparisonVerdict = verdict ?? {
      winner: resultA.score >= resultB.score ? "A" : "B",
      winner_name: resultA.score >= resultB.score ? resultA.product_name : resultB.product_name,
      verdict_summary: `${resultA.product_name} scored ${resultA.score}/100 vs ${resultB.product_name} scored ${resultB.score}/100.`,
      buy_recommendation: resultA.score >= resultB.score
        ? `Choose ${resultA.product_name} based on overall score.`
        : `Choose ${resultB.product_name} based on overall score.`,
      price_verdict: "Compare prices at your preferred retailer.",
      category_comparisons: [
        "Build Quality", "Performance", "Value for Money", "User Satisfaction", "Reliability", "Features",
      ].map((cat) => {
        const aRating = resultA.rating_breakdown?.find((r) => r.name === cat)?.score ?? 5;
        const bRating = resultB.rating_breakdown?.find((r) => r.name === cat)?.score ?? 5;
        return {
          category: cat,
          winner: aRating > bRating ? "A" : bRating > aRating ? "B" : "Tie" as "A" | "B" | "Tie",
          a_score: aRating,
          b_score: bRating,
          detail: `${aRating > bRating ? resultA.product_name : resultB.product_name} leads in this category.`,
        };
      }),
    };

    return {
      success: true,
      data: { product_a: resultA, product_b: resultB, verdict: finalVerdict },
    };
  } catch (err) {
    console.error("compareAction error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Analysis failed. Please try again." };
  }
}
