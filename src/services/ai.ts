import { analysisResultSchema } from "@/schemas/analysis";
import { fakeDetectorResultSchema } from "@/schemas/fake-detector";
import { budgetOptimizerResultSchema } from "@/schemas/budget-optimizer";
import type { AnalysisResult, InputType, FakeDetectorResult, BudgetOptimizerResult } from "@/types";
import {
  ANALYSIS_SYSTEM_PROMPT,
  URL_ANALYSIS_PROMPT,
  IMAGE_ANALYSIS_PROMPT,
  TEXT_ANALYSIS_PROMPT,
  RETRY_PROMPT,
} from "@/prompts/analysis";
import {
  FAKE_DETECTOR_SYSTEM_PROMPT,
  FAKE_DETECTOR_URL_PROMPT,
  FAKE_DETECTOR_TEXT_PROMPT,
} from "@/prompts/fake-detector";
import {
  BUDGET_OPTIMIZER_SYSTEM_PROMPT,
  buildBudgetOptimizerPrompt,
} from "@/prompts/budget-optimizer";
import { getWebContext } from "@/services/search";


const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function getUserPrompt(type: InputType, value: string, webContext?: string | null): string {
  const contextSection = webContext
    ? `\n\n## LIVE WEB DATA (fetched now — use as primary source, override training data if conflicts):\n${webContext}`
    : "";

  switch (type) {
    case "url":
      return URL_ANALYSIS_PROMPT.replace("{url}", value) + contextSection;
    case "image":
      return IMAGE_ANALYSIS_PROMPT + contextSection;
    case "text":
      return TEXT_ANALYSIS_PROMPT.replace("{text}", value) + contextSection;
  }
}

/** Normalize AI response quirks before Zod validation */
function sanitizeAnalysisResponse(raw: unknown): unknown {
  // Guard: if the entire response is null/non-object, return as-is so Zod reports a clear error
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw ?? {};
  const obj = raw as Record<string, unknown>;

  // --- recommendation ---
  // Attempt string normalization first
  if (typeof obj.recommendation === "string") {
    const upper = obj.recommendation.trim().toUpperCase();
    if (upper === "BUY" || upper === "KAUFEN" || upper === "KAUF" || upper === "YES" || upper === "JA") {
      obj.recommendation = "BUY";
    } else if (
      upper === "DON'T BUY" || upper === "DONT BUY" || upper === "DO NOT BUY" ||
      upper === "NICHT KAUFEN" || upper === "NICHT KAUF" || upper === "NEIN" || upper === "NO"
    ) {
      obj.recommendation = "DON'T BUY";
    } else if (
      upper === "ONLY IF" || upper === "NUR WENN" || upper === "CONDITIONAL" || upper === "BEDINGT" ||
      upper.startsWith("ONLY IF") || upper.startsWith("NUR WENN")
    ) {
      obj.recommendation = "ONLY IF";
    } else if (upper.includes("NICHT") || upper.includes("DON") || upper.includes("NOT")) {
      obj.recommendation = "DON'T BUY";
    } else if (upper.includes("NUR") || upper.includes("ONLY") || upper.includes("COND") || upper.includes("WENN")) {
      obj.recommendation = "ONLY IF";
    } else if (upper.includes("KAUF") || upper.includes("BUY") || upper.includes("YES") || upper.includes("JA")) {
      obj.recommendation = "BUY";
    }
  }

  // --- unconditional fallback: if still not a valid enum, infer from score or default ---
  if (!["BUY", "DON'T BUY", "ONLY IF"].includes(obj.recommendation as string)) {
    const score = typeof obj.score === "number" ? obj.score : null;
    if (score !== null) {
      obj.recommendation = score >= 70 ? "BUY" : score < 40 ? "DON'T BUY" : "ONLY IF";
    } else {
      obj.recommendation = "ONLY IF";
    }
  }

  // --- technical_specs: normalize field name variants ---
  if (Array.isArray(obj.technical_specs)) {
    obj.technical_specs = (obj.technical_specs as Record<string, unknown>[])
      .map((spec) => {
        if (!spec || typeof spec !== "object") return null;
        const name =
          spec.name ?? spec.spec ?? spec.key ?? spec.label ?? spec.property ?? spec.attribute ?? spec.field ?? spec.title;
        const value =
          spec.value ?? spec.description ?? spec.detail ?? spec.info ?? spec.data ?? spec.content ?? spec.text ?? spec.val;
        if (!name && !value) return null;
        return {
          name: typeof name === "string" ? name : String(name ?? ""),
          value: typeof value === "string" ? value : String(value ?? ""),
        };
      })
      .filter(Boolean);
  }

  // --- alternatives: coerce strings and normalize field names ---
  if (Array.isArray(obj.alternatives)) {
    obj.alternatives = (obj.alternatives as unknown[]).map((alt: unknown) => {
      if (typeof alt === "string") return { name: alt, price_range: "", why_better: "" };
      if (!alt || typeof alt !== "object") return { name: "", price_range: "", why_better: "" };
      const a = alt as Record<string, unknown>;
      return {
        name: a.name ?? a.product ?? a.title ?? a.alternative ?? "",
        price_range: a.price_range ?? a.price ?? a.priceRange ?? a.cost ?? "",
        why_better: a.why_better ?? a.reason ?? a.description ?? a.advantage ?? a.why ?? "",
      };
    });
  }

  // --- rating_breakdown: normalize scores that are on 0-100 scale instead of 0-10 ---
  if (Array.isArray(obj.rating_breakdown)) {
    obj.rating_breakdown = (obj.rating_breakdown as Record<string, unknown>[]).map((item) => {
      if (!item || typeof item !== "object") return item;
      const score = typeof item.score === "number" ? item.score : 0;
      return {
        ...item,
        // If any score > 10, assume the AI used 0-100 scale and convert
        score: score > 10 ? Math.round(score / 10) : score,
      };
    });
  }

  // --- recommendation_detail fallback ---
  if (!obj.recommendation_detail && typeof obj.summary === "string") {
    obj.recommendation_detail = obj.summary;
  }

  return obj;
}

function tryParseJSON(text: string): unknown | null {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // noop
  }

  // Try extracting JSON from markdown code block
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch {
      // noop
    }
  }

  // Try extracting JSON object from text
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // noop
    }
  }

  return null;
}

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}


// Multi-provider, multi-model fallback logic
async function callAIProvider({
  provider,
  apiKey,
  apiUrl,
  models,
  messages,
  appUrl,
  title,
  imageMode = false,
} : {
  provider: 'groq' | 'openrouter',
  apiKey: string,
  apiUrl: string,
  models: string[],
  messages: any[],
  appUrl: string,
  title: string,
  imageMode?: boolean,
}): Promise<string> {
  let lastError;
  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
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
          messages: attempt > 0 ? [...messages, { role: "user", content: RETRY_PROMPT }] : messages,
          temperature: 0.3,
          max_tokens: 2000,
        };
        // json_object mode: OpenRouter supports it broadly; Groq only for llama-3.x models
        const groqJsonSupported = provider === 'groq' && /llama-3/i.test(model);
        if (provider === 'openrouter' || groqJsonSupported) {
          body.response_format = { type: "json_object" };
        }
        const response = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const errorBody = await response.text();
          // On 429: skip to next model immediately (no wait — different model, not a retry)
          if (response.status === 429) {
            console.warn(`[AI] ${provider}/${model} rate-limited (429), skipping to next model`);
            lastError = new Error(`${provider} rate limited (429)`);
            break; // move to next model without waiting
          }          // On 400: permanent error (bad request), no point retrying same model
          if (response.status === 400) {
            console.warn(`[AI] ${provider}/${model} bad request (400), skipping model`);
            lastError = new Error(`${provider}/${model} bad request (400): ${errorBody}`);
            break;
          }          lastError = new Error(`${provider} API error (${response.status}): ${errorBody}`);
          console.warn(`[AI] ${provider}/${model} error ${response.status}`);
          continue;
        }
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("No content in AI response");
        console.info(`[AI] ${provider}/${model} responded OK`);
        return content;
      } catch (err) {
        lastError = err;
      }
    }
  }
  throw lastError ?? new Error(`All ${provider} models failed`);
}

export async function analyzeProduct(
  type: InputType,
  value: string,
  imageUrl?: string,
  locale: string = "en",
): Promise<AnalysisResult> {
  // Fetch real-time web context in parallel with provider setup
  const webContextPromise = getWebContext(type, value);

  // Model lists (comma-separated in env)
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModels = (process.env.GROQ_MODELS ?? "mixtral-8x7b-32768,qwen2-72b-32k,gemma-7b-it,llama3-70b-8192").split(",").map(m => m.trim()).filter(Boolean);
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const openrouterModels = (process.env.OPENROUTER_MODELS ?? process.env.OPENROUTER_MODEL ?? "openai/gpt-4o").split(",").map(m => m.trim()).filter(Boolean);

  // Wait for web context (best-effort, never throws)
  const webContext = await webContextPromise.catch(() => null);

  // Build language instruction
  const languageInstruction = locale === "de"
    ? `\n\nCRITICAL LANGUAGE RULE: Write ALL descriptive text in German (Deutsch): summary, pros, cons, warnings, recommendation_detail, common_complaints, best_for, not_suitable_for, alternatives[].why_better. HOWEVER the following fields MUST remain exactly as specified in English - no translation allowed: recommendation MUST be exactly "BUY" or "DON'T BUY" or "ONLY IF" (never "KAUFEN", "NICHT KAUFEN", etc.), market_position MUST be "Budget" or "Mid-Range" or "Premium", user_sentiment MUST be "Very Positive" or "Positive" or "Mixed" or "Negative" or "Very Negative". Use € for prices.`
    : "";

  const userPrompt = getUserPrompt(type, value, webContext) + languageInstruction;
  const messages: OpenRouterMessage[] = [
    { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
  ];
  if (type === "image" && imageUrl) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }
  let lastError;
  // 1. Try Groq (all models)
  if (groqApiKey && groqModels.length) {
    try {
      console.info(`[AI] Trying Groq with models: ${groqModels.join(", ")}`);
      const content = await callAIProvider({
        provider: 'groq',
        apiKey: groqApiKey,
        apiUrl: GROQ_API_URL,
        models: groqModels,
        messages,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        title: "BuyRight AI",
        imageMode: type === "image",
      });
      const parsed = sanitizeAnalysisResponse(tryParseJSON(content));
      const validated = analysisResultSchema.safeParse(parsed);
      if (validated.success) {
        console.info("[AI] Groq validation passed, returning result");
        return validated.data;
      }
      console.warn("[AI] Groq validation failed:", JSON.stringify(validated.error.issues));
      lastError = new Error(`Groq validation failed: ${JSON.stringify(validated.error.issues)}`);
    } catch (err) {
      console.warn("[AI] Groq provider error:", err);
      lastError = err;
    }
  }
  // 2. Try OpenRouter (all models)
  if (openrouterApiKey && openrouterModels.length) {
    try {
      console.info(`[AI] Trying OpenRouter with models: ${openrouterModels.join(", ")}`);
      const content = await callAIProvider({
        provider: 'openrouter',
        apiKey: openrouterApiKey,
        apiUrl: OPENROUTER_API_URL,
        models: openrouterModels,
        messages,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        title: "BuyRight AI",
        imageMode: type === "image",
      });
      const parsed = sanitizeAnalysisResponse(tryParseJSON(content));
      const validated = analysisResultSchema.safeParse(parsed);
      if (validated.success) {
        console.info("[AI] OpenRouter validation passed, returning result");
        return validated.data;
      }
      console.warn("[AI] OpenRouter validation failed:", JSON.stringify(validated.error.issues));
      lastError = new Error(`OpenRouter validation failed: ${JSON.stringify(validated.error.issues)}`);
    } catch (err) {
      console.warn("[AI] OpenRouter provider error:", err);
      lastError = err;
    }
  }
  throw lastError ?? new Error("Analysis failed: No AI provider available");
}

export async function* streamAnalysisSteps(
  type: InputType,
  value: string,
  imageUrl?: string,
): AsyncGenerator<{ step: string; stepDe: string; progress: number }> {
  yield { step: "Identifying product...", stepDe: "Produkt wird erkannt...", progress: 10 };
  await new Promise((r) => setTimeout(r, 500));

  yield { step: "Analyzing reviews...", stepDe: "Reviews werden analysiert...", progress: 30 };
  await new Promise((r) => setTimeout(r, 400));

  yield { step: "Checking risks...", stepDe: "Risiken werden gepruft...", progress: 50 };
  await new Promise((r) => setTimeout(r, 400));

  yield { step: "Finding alternatives...", stepDe: "Alternativen werden gesucht...", progress: 70 };
  await new Promise((r) => setTimeout(r, 400));

  yield { step: "Generating recommendation...", stepDe: "Empfehlung wird generiert...", progress: 90 };

  // The actual analysis happens here
  const result = await analyzeProduct(type, value, imageUrl);

  yield {
    step: `Analysis complete! Score: ${result.score}/100`,
    stepDe: `Analyse abgeschlossen! Score: ${result.score}/100`,
    progress: 100,
  };

  return result;
}

// ============================================================================
// Fake Detector
// ============================================================================

export async function analyzeFakeDetector(
  type: "url" | "text",
  value: string,
  locale: string = "en",
): Promise<FakeDetectorResult> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const groqModels = (process.env.GROQ_MODELS ?? "llama-3.3-70b-versatile,llama3-70b-8192").split(",").filter(Boolean);
  const openrouterModels = (process.env.OPENROUTER_MODELS ?? "openai/gpt-4o-mini").split(",").filter(Boolean);

  const userPrompt = (type === "url"
    ? FAKE_DETECTOR_URL_PROMPT.replace("{url}", value)
    : FAKE_DETECTOR_TEXT_PROMPT.replace("{text}", value)) +
    (locale === "de" ? "\n\nRespond in German language." : "");

  const messages = [
    { role: "system", content: FAKE_DETECTOR_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  let lastError: unknown;

  for (const [apiKey, apiUrl, provider, models] of [
    [groqApiKey, GROQ_API_URL, "groq", groqModels],
    [openrouterApiKey, OPENROUTER_API_URL, "openrouter", openrouterModels],
  ] as const) {
    if (!apiKey) continue;
    try {
      console.info(`[FakeDetector] Trying ${provider}`);
      const content = await callAIProvider({
        provider,
        apiKey,
        apiUrl,
        models: [...models],
        messages,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        title: "BuyRight AI",
        imageMode: false,
      });
      const parsed = tryParseJSON(content);
      const validated = fakeDetectorResultSchema.safeParse(parsed);
      if (validated.success) {
        console.info(`[FakeDetector] ${provider} validation passed`);
        return validated.data as FakeDetectorResult;
      }
      console.warn(`[FakeDetector] ${provider} validation failed:`, JSON.stringify(validated.error.issues));
      lastError = new Error(`${provider} validation failed`);
    } catch (err) {
      console.warn(`[FakeDetector] ${provider} error:`, err);
      lastError = err;
    }
  }

  throw lastError ?? new Error("Fake detection failed: No AI provider available");
}

// ============================================================================
// Budget Optimizer
// ============================================================================

export async function analyzeBudgetOptimizer(
  budget: number,
  currency: string,
  items: string[],
  locale: string = "en",
): Promise<BudgetOptimizerResult> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const groqModels = (process.env.GROQ_MODELS ?? "llama-3.3-70b-versatile,llama3-70b-8192").split(",").filter(Boolean);
  const openrouterModels = (process.env.OPENROUTER_MODELS ?? "openai/gpt-4o-mini").split(",").filter(Boolean);

  const userPrompt = buildBudgetOptimizerPrompt(budget, currency, items, locale);
  const messages = [
    { role: "system", content: BUDGET_OPTIMIZER_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  let lastError: unknown;

  for (const [apiKey, apiUrl, provider, models] of [
    [groqApiKey, GROQ_API_URL, "groq", groqModels],
    [openrouterApiKey, OPENROUTER_API_URL, "openrouter", openrouterModels],
  ] as const) {
    if (!apiKey) continue;
    try {
      console.info(`[BudgetOptimizer] Trying ${provider}`);
      const content = await callAIProvider({
        provider,
        apiKey,
        apiUrl,
        models: [...models],
        messages,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        title: "BuyRight AI",
        imageMode: false,
      });
      const parsed = tryParseJSON(content);
      // Inject the user's budget into the parsed result as ground truth
      if (parsed && typeof parsed === "object") {
        (parsed as Record<string, unknown>).total_budget = budget;
      }
      const validated = budgetOptimizerResultSchema.safeParse(parsed);
      if (validated.success) {
        console.info(`[BudgetOptimizer] ${provider} validation passed`);
        return validated.data as BudgetOptimizerResult;
      }
      console.warn(`[BudgetOptimizer] ${provider} validation failed:`, JSON.stringify(validated.error.issues));
      lastError = new Error(`${provider} validation failed`);
    } catch (err) {
      console.warn(`[BudgetOptimizer] ${provider} error:`, err);
      lastError = err;
    }
  }

  throw lastError ?? new Error("Budget optimization failed: No AI provider available");
}
