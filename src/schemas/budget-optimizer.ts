import { z } from "zod";

export const budgetItemSchema = z.object({
  name: z.string().min(1),
  estimated_price: z.number().min(0).default(0),
  priority: z.enum(["MUST_BUY", "NICE_TO_HAVE", "SKIP"]).catch("NICE_TO_HAVE"),
  priority_score: z.number().min(0).max(100).default(50),
  value_score: z.number().min(0).max(100).default(50),
  reason: z.string().default(""),
  alternative_suggestion: z.string().default(""),
});

export const budgetOptimizerResultSchema = z.object({
  total_budget: z.number().min(0),
  total_estimated: z.number().min(0).default(0),
  optimized_total: z.number().min(0).default(0),
  budget_efficiency: z.number().min(0).max(100).default(50),
  savings: z.number().min(0).default(0),
  summary: z.string().min(1),
  top_advice: z.string().default(""),
  items: z.array(budgetItemSchema).min(1),
});

export type BudgetOptimizerResultSchema = z.infer<typeof budgetOptimizerResultSchema>;
