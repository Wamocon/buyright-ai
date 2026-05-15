export type InputType = "url" | "image" | "text";

export type Recommendation = "BUY" | "DON'T BUY" | "ONLY IF";

export type MarketPosition = "Budget" | "Mid-Range" | "Premium";

export type SubscriptionTier = "free" | "pro";

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export type UserSentiment = "Very Positive" | "Positive" | "Mixed" | "Negative" | "Very Negative";

export interface Alternative {
  name: string;
  price_range: string;
  why_better: string;
}

export interface RatingCategory {
  name: string;
  score: number; // 0-10
}

export interface TechSpec {
  name: string;
  value: string;
}

export interface AnalysisResult {
  product_name: string;
  category: string;
  brand: string;
  score: number;
  market_position: MarketPosition;
  price_range_typical: string;
  summary: string;
  pros: string[];
  cons: string[];
  warnings: string[];
  alternatives: Alternative[];
  recommendation: Recommendation;
  recommendation_detail: string;
  // Rich analysis fields
  rating_breakdown: RatingCategory[];
  technical_specs: TechSpec[];
  user_sentiment: UserSentiment;
  common_complaints: string[];
  best_for: string[];
  not_suitable_for: string[];
}

export interface CategoryComparison {
  category: string;
  winner: "A" | "B" | "Tie";
  a_score: number;
  b_score: number;
  detail: string;
}

export interface ComparisonVerdict {
  winner: "A" | "B" | "Tie";
  winner_name: string;
  verdict_summary: string;
  buy_recommendation: string;
  price_verdict: string;
  category_comparisons: CategoryComparison[];
}

export interface ComparisonResult {
  product_a: AnalysisResult;
  product_b: AnalysisResult;
  verdict: ComparisonVerdict;
}

export interface AnalysisRequest {
  type: InputType;
  value: string;
  imageUrl?: string;
}

// ============ Fake Detector ============

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type FakeVerdict = "SAFE" | "SUSPICIOUS" | "LIKELY_FAKE";
export type PriceVerdict = "NORMAL" | "SUSPICIOUS" | "TOO_GOOD_TO_BE_TRUE";

export interface FakeDetectorReviewAnalysis {
  authenticity_score: number; // 0-100
  fake_percentage_estimate: number; // 0-100
  suspicious_patterns: string[];
}

export interface FakeDetectorPriceAnalysis {
  verdict: PriceVerdict;
  detail: string;
}

export interface FakeDetectorResult {
  product_name: string;
  trust_score: number; // 0-100
  risk_level: RiskLevel;
  verdict: FakeVerdict;
  summary: string;
  red_flags: string[];
  positive_signals: string[];
  review_analysis: FakeDetectorReviewAnalysis;
  price_analysis: FakeDetectorPriceAnalysis;
  seller_indicators: string[];
  recommendation: string;
}

// ============ Budget Optimizer ============

export type BudgetPriority = "MUST_BUY" | "NICE_TO_HAVE" | "SKIP";

export interface BudgetItem {
  name: string;
  estimated_price: number;
  priority: BudgetPriority;
  priority_score: number; // 0-100
  value_score: number; // 0-100
  reason: string;
  alternative_suggestion: string;
}

export interface BudgetOptimizerResult {
  total_budget: number;
  total_estimated: number;
  optimized_total: number;
  budget_efficiency: number; // 0-100
  savings: number;
  summary: string;
  top_advice: string;
  items: BudgetItem[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  daily_checks_used: number;
  last_check_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCheck {
  id: string;
  user_id: string | null;
  anonymous_ip: string | null;
  input_type: InputType;
  input_value: string;
  image_url: string | null;
  result: AnalysisResult | null;
  score: number | null;
  recommendation: Recommendation | null;
  created_at: string;
}

export interface AnalysisStep {
  id: string;
  label: string;
  labelDe: string;
  status: "pending" | "active" | "completed" | "error";
}
