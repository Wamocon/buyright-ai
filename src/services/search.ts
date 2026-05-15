/**
 * Web context service — fetches real-time product data before AI analysis.
 *
 * URL inputs:  server-side HTML fetch + text extraction (no API key needed)
 * Text inputs: Tavily AI Search API (set TAVILY_API_KEY in .env.local)
 *
 * Both are best-effort: on any failure, the AI falls back to training knowledge.
 */

import type { InputType } from "@/types";

// --------------------------------------------------------------------------
// URL scraping
// --------------------------------------------------------------------------

async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BuyRightAI/1.0; +https://buyright.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const html = await response.text();

    // Remove non-content sections
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned || cleaned.length < 100) return null;

    // Truncate to keep prompt size manageable
    return cleaned.slice(0, 4000);
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Tavily search (https://tavily.com — free tier: 1 000 req/month)
// --------------------------------------------------------------------------

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

interface TavilyResponse {
  answer?: string;
  results?: TavilyResult[];
}

async function searchProductInfo(query: string): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} reviews price specifications 2026`,
        search_depth: "basic",
        max_results: 5,
        include_raw_content: false,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data: TavilyResponse = await response.json();

    const parts: string[] = [];

    if (data.answer) {
      parts.push(`Summary: ${data.answer}`);
    }

    const results = (data.results ?? []).slice(0, 4);
    for (const r of results) {
      if (r.content) {
        parts.push(`[${r.title}]\n${r.content}`);
      }
    }

    const combined = parts.join("\n\n---\n\n").trim();
    return combined.length > 50 ? combined.slice(0, 5000) : null;
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Returns a string of current web data for the given product input.
 * Returns null if no data could be fetched (AI will use training data only).
 */
export async function getWebContext(
  type: InputType,
  value: string,
): Promise<string | null> {
  if (type === "url") {
    // Fetch the actual product page
    const pageContent = await fetchUrlContent(value);
    if (pageContent) return pageContent;

    // Fallback: search for the URL if scraping failed
    return searchProductInfo(value);
  }

  if (type === "text") {
    return searchProductInfo(value);
  }

  // Image inputs: no web context (image is the context)
  return null;
}
