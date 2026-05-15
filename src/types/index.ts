export type InputType = "url" | "image" | "text";

export type Recommendation = "BUY" | "DON'T BUY" | "ONLY IF";

export type MarketPosition = "Budget" | "Mid-Range" | "Premium";

export type SubscriptionTier = "free" | "pro";

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface Alternative {
  name: string;
  price_range: string;
  why_better: string;
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
}

export interface AnalysisRequest {
  type: InputType;
  value: string;
  imageUrl?: string;
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
