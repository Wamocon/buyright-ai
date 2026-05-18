import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProfileClient } from "./ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile & Settings",
  description: "Manage your BuyRight AI account",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let supabase: Awaited<ReturnType<typeof createClient>>;
  let user: import("@supabase/supabase-js").User | null = null;

  try {
    supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect(`/${locale === "de" ? "de/" : ""}login?redirect=/profile`);
  }

  if (!user) {
    redirect(`/${locale === "de" ? "de/" : ""}login?redirect=/profile`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: totalChecks } = await supabase
    .from("product_checks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const t = await getTranslations("profile");

  const checksToday =
    profile?.last_check_date === new Date().toISOString().split("T")[0]
      ? (profile?.daily_checks_used ?? 0)
      : 0;

  const isPro = profile?.subscription_tier === "pro";
  const dailyLimit = isPro ? 1000 : 3;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
          </div>
          <ProfileClient
            user={{ id: user.id, email: user.email ?? "" }}
            profile={{
              full_name: profile?.full_name ?? "",
              avatar_url: profile?.avatar_url ?? null,
              subscription_tier: profile?.subscription_tier ?? "free",
              subscription_status: profile?.subscription_status ?? null,
              daily_checks_used: checksToday,
              created_at: profile?.created_at ?? null,
            }}
            totalChecks={totalChecks ?? 0}
            dailyLimit={dailyLimit}
            isPro={isPro}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
