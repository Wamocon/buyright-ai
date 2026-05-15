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

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number"
    ? value
    : typeof value === "string"
      ? Number.parseFloat(value.replace(/[^\d.-]/g, ""))
      : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return entry.trim();
      if (entry && typeof entry === "object" && "name" in entry) {
        const name = (entry as Record<string, unknown>).name;
        return typeof name === "string" ? name.trim() : "";
      }
      return "";
    })
    .filter((entry) => entry.length > 0);
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeRiskLevel(value: unknown): FakeDetectorResult["risk_level"] {
  const raw = String(value ?? "").trim().toUpperCase();
  if (["LOW", "NIEDRIG"].includes(raw)) return "LOW";
  if (["MEDIUM", "MITTEL"].includes(raw)) return "MEDIUM";
  if (["HIGH", "HOCH"].includes(raw)) return "HIGH";
  if (["CRITICAL", "KRITISCH"].includes(raw)) return "CRITICAL";
  return "MEDIUM";
}

function normalizeFakeVerdict(value: unknown): FakeDetectorResult["verdict"] {
  const raw = String(value ?? "").trim().toUpperCase();
  if (["SAFE", "SICHER"].includes(raw)) return "SAFE";
  if (["SUSPICIOUS", "SUSPECT", "VERDAECHTIG", "VERDÄCHTIG"].includes(raw)) return "SUSPICIOUS";
  if (["LIKELY_FAKE", "LIKELY FAKE", "FAKE", "WAHRSCHEINLICH_GEFÄLSCHT", "WAHRSCHEINLICH GEFÄLSCHT"].includes(raw)) {
    return "LIKELY_FAKE";
  }
  return "SUSPICIOUS";
}

function normalizePriceVerdict(value: unknown): FakeDetectorResult["price_analysis"]["verdict"] {
  const raw = String(value ?? "").trim().toUpperCase();
  if (["NORMAL", "OK"].includes(raw)) return "NORMAL";
  if (["SUSPICIOUS", "VERDAECHTIG", "VERDÄCHTIG"].includes(raw)) return "SUSPICIOUS";
  if (["TOO_GOOD_TO_BE_TRUE", "TOO GOOD TO BE TRUE", "ZU_GUT_UM_WAHR_ZU_SEIN", "ZU GUT UM WAHR ZU SEIN"].includes(raw)) {
    return "TOO_GOOD_TO_BE_TRUE";
  }
  return "NORMAL";
}

function normalizeBudgetPriority(value: unknown): BudgetOptimizerResult["items"][number]["priority"] {
  const raw = String(value ?? "").trim().toUpperCase();
  if (["MUST_BUY", "MUST BUY", "MUST", "MUSS", "PFLICHT"].includes(raw)) return "MUST_BUY";
  if (["SKIP", "IGNORE", "WEGLASSEN", "AUSLASSEN"].includes(raw)) return "SKIP";
  return "NICE_TO_HAVE";
}

function buildFallbackFakeDetectorResult(input: string, locale: string): FakeDetectorResult {
  const productName = input.slice(0, 120).trim() || (locale === "de" ? "Unbekanntes Produkt" : "Unknown product");
  const summary = locale === "de"
    ? "Für dieses Produkt konnten aktuell nicht genug verlässliche Live Daten abgerufen werden. Prüfen Sie Verkäuferhistorie, Bewertungen und Preisentwicklung vor dem Kauf zusätzlich manuell."
    : "Not enough reliable live data could be retrieved for this product right now. Verify seller history, reviews, and price trend manually before purchasing.";

  return {
    product_name: productName,
    trust_score: 50,
    risk_level: "MEDIUM",
    verdict: "SUSPICIOUS",
    summary,
    red_flags: locale === "de"
      ? ["Unvollständige Live Daten", "Automatische Analyse eingeschränkt"]
      : ["Incomplete live data", "Automated analysis limited"],
    positive_signals: locale === "de"
      ? ["Kein eindeutiger Betrugsnachweis gefunden"]
      : ["No definitive fraud indicator found"],
    review_analysis: {
      authenticity_score: 50,
      fake_percentage_estimate: 30,
      suspicious_patterns: locale === "de"
        ? ["Zu wenige auswertbare Bewertungsmuster"]
        : ["Insufficient review patterns for high confidence"],
    },
    price_analysis: {
      verdict: "SUSPICIOUS",
      detail: locale === "de"
        ? "Preisabweichung konnte nicht verlässlich gegen Marktdaten geprüft werden."
        : "Price deviation could not be reliably verified against market data.",
    },
    seller_indicators: locale === "de"
      ? ["Zusätzliche Verkäuferprüfung empfohlen"]
      : ["Additional seller verification recommended"],
    recommendation: locale === "de"
      ? "Nur kaufen, wenn Verkäufer, Rückgaberegeln und externe Bewertungen eindeutig vertrauenswürdig sind."
      : "Buy only if seller profile, return policy, and independent reviews are clearly trustworthy.",
  };
}

function sanitizeFakeDetectorResponse(raw: unknown, input: string, locale: string): FakeDetectorResult {
  const obj = toRecord(raw);
  const review = toRecord(obj.review_analysis ?? obj.reviews ?? obj.review);
  const price = toRecord(obj.price_analysis ?? obj.price ?? obj.pricing);

  const fallback = buildFallbackFakeDetectorResult(input, locale);
  const summary = typeof obj.summary === "string" && obj.summary.trim().length > 0
    ? obj.summary.trim()
    : fallback.summary;
  const recommendation = typeof obj.recommendation === "string" && obj.recommendation.trim().length > 0
    ? obj.recommendation.trim()
    : fallback.recommendation;

  return {
    product_name: typeof obj.product_name === "string" && obj.product_name.trim().length > 0
      ? obj.product_name.trim()
      : typeof obj.product === "string" && obj.product.trim().length > 0
        ? obj.product.trim()
        : typeof obj.name === "string" && obj.name.trim().length > 0
          ? obj.name.trim()
          : fallback.product_name,
    trust_score: clampNumber(obj.trust_score ?? obj.score, 0, 100, fallback.trust_score),
    risk_level: normalizeRiskLevel(obj.risk_level ?? obj.risk),
    verdict: normalizeFakeVerdict(obj.verdict ?? obj.status),
    summary,
    red_flags: asStringArray(obj.red_flags ?? obj.warnings ?? obj.risks),
    positive_signals: asStringArray(obj.positive_signals ?? obj.green_flags ?? obj.positives),
    review_analysis: {
      authenticity_score: clampNumber(
        review.authenticity_score ?? review.score,
        0,
        100,
        fallback.review_analysis.authenticity_score,
      ),
      fake_percentage_estimate: clampNumber(
        review.fake_percentage_estimate ?? review.fake_rate ?? review.fake_probability,
        0,
        100,
        fallback.review_analysis.fake_percentage_estimate,
      ),
      suspicious_patterns: asStringArray(review.suspicious_patterns ?? review.patterns),
    },
    price_analysis: {
      verdict: normalizePriceVerdict(price.verdict ?? price.risk),
      detail: typeof price.detail === "string"
        ? price.detail
        : fallback.price_analysis.detail,
    },
    seller_indicators: asStringArray(obj.seller_indicators ?? obj.seller_signals),
    recommendation,
  };
}

function buildFallbackBudgetOptimizerResult(
  budget: number,
  currency: string,
  items: string[],
  locale: string,
): BudgetOptimizerResult {
  const cleanItems = items.map((item) => item.trim()).filter(Boolean);
  const safeItems = cleanItems.length > 0 ? cleanItems : [locale === "de" ? "Grundbedarf" : "Essential item"];
  const average = Math.max(1, Number((budget / safeItems.length).toFixed(2)));
  const normalizedBudget = Number.isFinite(budget) && budget > 0 ? budget : average * safeItems.length;

  const resultItems: BudgetOptimizerResult["items"] = safeItems.map((name, index) => {
    const mustBuyCount = Math.max(1, Math.ceil(safeItems.length / 2));
    const priority = index < mustBuyCount ? "MUST_BUY" : "NICE_TO_HAVE";
    return {
      name,
      estimated_price: average,
      priority,
      priority_score: priority === "MUST_BUY" ? 80 : 60,
      value_score: 65,
      reason: locale === "de"
        ? "Automatisch priorisiert wegen begrenzter Budgetdaten."
        : "Auto prioritized due to limited budget data.",
      alternative_suggestion: locale === "de"
        ? "Preis bei mindestens zwei Händlern vergleichen."
        : "Compare price across at least two stores.",
    };
  });

  return {
    total_budget: normalizedBudget,
    total_estimated: Number((average * resultItems.length).toFixed(2)),
    optimized_total: Number((average * resultItems.length).toFixed(2)),
    budget_efficiency: 70,
    savings: 0,
    summary: locale === "de"
      ? "Es wurden nicht genug strukturierte AI Daten geliefert, daher wurde ein konservativer Budgetplan erstellt."
      : "Not enough structured AI data was returned, so a conservative budget plan was generated.",
    top_advice: locale === "de"
      ? "Kernartikel zuerst kaufen und optionale Positionen nach Preisvergleich ergänzen."
      : "Buy essential items first and add optional items after price comparison.",
    items: resultItems,
  };
}

function sanitizeBudgetOptimizerResponse(
  raw: unknown,
  budget: number,
  currency: string,
  items: string[],
  locale: string,
): BudgetOptimizerResult {
  const obj = toRecord(raw);
  const fallback = buildFallbackBudgetOptimizerResult(budget, currency, items, locale);

  const rawItems = Array.isArray(obj.items) ? obj.items : [];
  const normalizedItems: BudgetOptimizerResult["items"] = rawItems
    .map((entry) => {
      const item = toRecord(entry);
      const name = typeof item.name === "string" && item.name.trim().length > 0
        ? item.name.trim()
        : typeof item.product === "string" && item.product.trim().length > 0
          ? item.product.trim()
          : "";
      if (!name) return null;

      return {
        name,
        estimated_price: clampNumber(item.estimated_price ?? item.price ?? item.cost, 0, 1_000_000, 0),
        priority: normalizeBudgetPriority(item.priority),
        priority_score: clampNumber(item.priority_score, 0, 100, 50),
        value_score: clampNumber(item.value_score, 0, 100, 50),
        reason: typeof item.reason === "string" ? item.reason : "",
        alternative_suggestion: typeof item.alternative_suggestion === "string"
          ? item.alternative_suggestion
          : typeof item.alternative === "string"
            ? item.alternative
            : "",
      };
    })
    .filter((entry): entry is BudgetOptimizerResult["items"][number] => Boolean(entry));

  const totalBudget = clampNumber(obj.total_budget, 0, 1_000_000, fallback.total_budget);
  const totalEstimated = clampNumber(obj.total_estimated ?? obj.total_cost, 0, 1_000_000, fallback.total_estimated);
  const optimizedTotal = clampNumber(obj.optimized_total ?? obj.recommended_total, 0, 1_000_000, fallback.optimized_total);
  const summary = typeof obj.summary === "string" && obj.summary.trim().length > 0
    ? obj.summary.trim()
    : fallback.summary;

  return {
    total_budget: totalBudget,
    total_estimated: totalEstimated,
    optimized_total: optimizedTotal,
    budget_efficiency: clampNumber(obj.budget_efficiency ?? obj.efficiency, 0, 100, fallback.budget_efficiency),
    savings: clampNumber(obj.savings ?? totalBudget - optimizedTotal, 0, 1_000_000, fallback.savings),
    summary,
    top_advice: typeof obj.top_advice === "string" ? obj.top_advice : fallback.top_advice,
    items: normalizedItems.length > 0 ? normalizedItems : fallback.items,
  };
}

function buildFallbackProductAnalysis(type: InputType, value: string, locale: string): AnalysisResult {
  const fallbackName = type === "image"
    ? (locale === "de" ? "Hochgeladenes Produktbild" : "Uploaded product image")
    : value.slice(0, 120).trim() || (locale === "de" ? "Unbekanntes Produkt" : "Unknown product");

  return {
    product_name: fallbackName,
    category: locale === "de" ? "Unbekannt" : "Unknown",
    brand: locale === "de" ? "Nicht erkannt" : "Not identified",
    score: 50,
    market_position: "Mid-Range",
    price_range_typical: locale === "de" ? "Nicht verifizierbar" : "Not verifiable",
    summary: locale === "de"
      ? "Aktuell konnten keine ausreichend stabilen AI Antworten validiert werden, daher wurde eine konservative Bewertung erzeugt."
      : "No sufficiently stable AI responses could be validated at the moment, so a conservative rating was generated.",
    pros: locale === "de"
      ? ["Keine akuten Hochrisiko-Indikatoren bestätigt"]
      : ["No acute high risk indicators confirmed"],
    cons: locale === "de"
      ? ["Unvollständige Datenlage"]
      : ["Incomplete data context"],
    warnings: locale === "de"
      ? ["Bitte vor Kauf externe Quellen und Händlerdaten prüfen"]
      : ["Please verify external sources and seller data before purchase"],
    alternatives: [],
    recommendation: "ONLY IF",
    recommendation_detail: locale === "de"
      ? "Nur kaufen, wenn Preis, Händlerprofil und unabhängige Bewertungen plausibel sind."
      : "Buy only if price, seller profile, and independent reviews look plausible.",
    rating_breakdown: [
      { name: "Build Quality", score: 5 },
      { name: "Performance", score: 5 },
      { name: "Value for Money", score: 5 },
      { name: "User Satisfaction", score: 5 },
      { name: "Reliability", score: 5 },
      { name: "Features", score: 5 },
    ],
    technical_specs: [],
    user_sentiment: "Mixed",
    common_complaints: [],
    best_for: [],
    not_suitable_for: [],
  };
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
  messages: OpenRouterMessage[],
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
        const body: Record<string, unknown> = {
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
  console.warn("[AI] returning fallback product analysis", lastError);
  return buildFallbackProductAnalysis(type, value, locale);
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

  const messages: OpenRouterMessage[] = [
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
      const normalized = sanitizeFakeDetectorResponse(parsed, value, locale);
      const validated = fakeDetectorResultSchema.safeParse(normalized);
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
  console.warn("[FakeDetector] returning fallback result", lastError);
  return buildFallbackFakeDetectorResult(value, locale);
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
  const messages: OpenRouterMessage[] = [
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
      const sanitized = sanitizeBudgetOptimizerResponse(parsed, budget, currency, items, locale);
      const validated = budgetOptimizerResultSchema.safeParse(sanitized);
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
  console.warn("[BudgetOptimizer] returning fallback result", lastError);
  return buildFallbackBudgetOptimizerResult(budget, currency, items, locale);
}
