import { z } from "zod";

export const alternativeSchema = z.object({
  name: z.string().default(""),
  price_range: z.string().default(""),
  why_better: z.string().default(""),
});

export const ratingCategorySchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100).transform((v) => (v > 10 ? Math.round(v / 10) : v)),
});

export const techSpecSchema = z.object({
  name: z.string().default(""),
  value: z.string().default(""),
});

export const analysisResultSchema = z.object({
  product_name: z.string(),
  category: z.string(),
  brand: z.string(),
  score: z.number().min(0).max(100),
  market_position: z.enum(["Budget", "Mid-Range", "Premium"]).catch("Mid-Range"),
  price_range_typical: z.string(),
  summary: z.string(),
  pros: z.array(z.string()).min(1),
  cons: z.array(z.string()).min(1),
  warnings: z.array(z.string()),
  alternatives: z.array(alternativeSchema),
  recommendation: z.enum(["BUY", "DON'T BUY", "ONLY IF"]),
  recommendation_detail: z.string(),
  rating_breakdown: z.array(ratingCategorySchema).default([]),
  technical_specs: z.array(techSpecSchema).default([]),
  user_sentiment: z.enum(["Very Positive", "Positive", "Mixed", "Negative", "Very Negative"]).catch("Mixed"),
  common_complaints: z.array(z.string()).default([]),
  best_for: z.array(z.string()).default([]),
  not_suitable_for: z.array(z.string()).default([]),
});

export const categoryComparisonSchema = z.object({
  category: z.string(),
  winner: z.enum(["A", "B", "Tie"]),
  a_score: z.number().min(0).max(10),
  b_score: z.number().min(0).max(10),
  detail: z.string(),
});

export const comparisonVerdictSchema = z.object({
  winner: z.enum(["A", "B", "Tie"]),
  winner_name: z.string(),
  verdict_summary: z.string(),
  buy_recommendation: z.string(),
  price_verdict: z.string(),
  category_comparisons: z.array(categoryComparisonSchema),
});

export const analysisRequestSchema = z.object({
  type: z.enum(["url", "image", "text"]),
  value: z.string().min(1, "Input is required"),
  imageUrl: z.string().url().optional(),
});

export const urlInputSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const textInputSchema = z.object({
  text: z.string().min(3, "Please enter at least 3 characters").max(500),
});

export type AnalysisResultSchema = z.infer<typeof analysisResultSchema>;
export type AnalysisRequestSchema = z.infer<typeof analysisRequestSchema>;
export type ComparisonVerdictSchema = z.infer<typeof comparisonVerdictSchema>;
