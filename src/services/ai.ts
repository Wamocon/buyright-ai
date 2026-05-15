import { analysisResultSchema } from "@/schemas/analysis";
import type { AnalysisResult, InputType } from "@/types";
import {
  ANALYSIS_SYSTEM_PROMPT,
  URL_ANALYSIS_PROMPT,
  IMAGE_ANALYSIS_PROMPT,
  TEXT_ANALYSIS_PROMPT,
  RETRY_PROMPT,
} from "@/prompts/analysis";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

function getUserPrompt(type: InputType, value: string): string {
  switch (type) {
    case "url":
      return URL_ANALYSIS_PROMPT.replace("{url}", value);
    case "image":
      return IMAGE_ANALYSIS_PROMPT;
    case "text":
      return TEXT_ANALYSIS_PROMPT.replace("{text}", value);
  }
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

export async function analyzeProduct(
  type: InputType,
  value: string,
  imageUrl?: string,
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o";
  const userPrompt = getUserPrompt(type, value);

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

  // Attempt with retry logic
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": "BuyRight AI",
        },
        body: JSON.stringify({
          model,
          messages:
            attempt > 0
              ? [...messages, { role: "user", content: RETRY_PROMPT }]
              : messages,
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in AI response");

      const parsed = tryParseJSON(content);
      if (!parsed) {
        if (attempt < 2) continue;
        throw new Error("Failed to parse AI response as JSON after retries");
      }

      const validated = analysisResultSchema.safeParse(parsed);
      if (!validated.success) {
        if (attempt < 2) continue;
        throw new Error(
          `AI response validation failed: ${validated.error.message}`,
        );
      }

      return validated.data;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }

  throw new Error("Analysis failed after all retries");
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
