import { z } from "zod";

export const alternativeSchema = z.object({
  name: z.string(),
  price_range: z.string(),
  why_better: z.string(),
});

export const analysisResultSchema = z.object({
  product_name: z.string(),
  category: z.string(),
  brand: z.string(),
  score: z.number().min(0).max(100),
  market_position: z.enum(["Budget", "Mid-Range", "Premium"]),
  price_range_typical: z.string(),
  summary: z.string(),
  pros: z.array(z.string()).min(1),
  cons: z.array(z.string()).min(1),
  warnings: z.array(z.string()),
  alternatives: z.array(alternativeSchema),
  recommendation: z.enum(["BUY", "DON'T BUY", "ONLY IF"]),
  recommendation_detail: z.string(),
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
