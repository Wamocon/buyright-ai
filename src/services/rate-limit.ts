import { createClient } from "@/lib/supabase/server";

export async function checkRateLimit(userId?: string, ip?: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  if (userId) {
    // Check user-based limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, daily_checks_used, last_check_date")
      .eq("id", userId)
      .single();

    if (!profile) return { allowed: false, remaining: 0, limit: 0 };

    const limit = profile.subscription_tier === "pro" ? 1000 : 3;
    const checksToday =
      profile.last_check_date === today ? profile.daily_checks_used : 0;

    return {
      allowed: checksToday < limit,
      remaining: Math.max(0, limit - checksToday),
      limit,
    };
  }

  if (ip) {
    // Check IP-based limits for anonymous users
    const { data: rateLimitRow } = await supabase
      .from("rate_limits")
      .select("count")
      .eq("ip_address", ip)
      .eq("date", today)
      .single();

    const count = rateLimitRow?.count ?? 0;
    const limit = 3;

    return {
      allowed: count < limit,
      remaining: Math.max(0, limit - count),
      limit,
    };
  }

  return { allowed: false, remaining: 0, limit: 0 };
}

export async function incrementUsage(userId?: string, ip?: string): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("daily_checks_used, last_check_date")
      .eq("id", userId)
      .single();

    const checksToday =
      profile?.last_check_date === today ? (profile.daily_checks_used ?? 0) : 0;

    await supabase
      .from("profiles")
      .update({
        daily_checks_used: checksToday + 1,
        last_check_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } else if (ip) {
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("id, count")
      .eq("ip_address", ip)
      .eq("date", today)
      .single();

    if (existing) {
      await supabase
        .from("rate_limits")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("rate_limits")
        .insert({ ip_address: ip, date: today, count: 1 });
    }
  }
}
