import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Shield,
  History,
  Settings,
  ArrowRight,
  Sparkles,
  Crown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your BuyRight AI dashboard",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");

  let supabase: Awaited<ReturnType<typeof createClient>>;
  let user: import("@supabase/supabase-js").User | null = null;

  try {
    supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect(`/${locale === "de" ? "de/" : ""}login?redirect=/dashboard`);
  }

  if (!user) {
    redirect(`/${locale === "de" ? "de/" : ""}login?redirect=/dashboard`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: recentChecks } = await supabase
    .from("product_checks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalChecks } = await supabase
    .from("product_checks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isPro = profile?.subscription_tier === "pro";
  const checksToday =
    profile?.last_check_date === new Date().toISOString().split("T")[0]
      ? profile.daily_checks_used
      : 0;
  const dailyLimit = isPro ? 1000 : 3;

  const welcomeText = profile?.full_name
    ? t("welcomeBackName", { name: profile.full_name })
    : t("welcomeBack");

  function getRecLabel(rec: string) {
    if (rec === "BUY") return t("recBuy");
    if (rec === "DON'T BUY") return t("recDontBuy");
    return t("recOnlyIf");
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{welcomeText}</h1>
            <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
                  <BarChart3 className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("totalChecks")}</p>
                  <p className="text-2xl font-bold">{totalChecks ?? 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("today")}</p>
                  <p className="text-2xl font-bold">{checksToday}/{dailyLimit}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                  <Crown className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("plan")}</p>
                  <Badge variant={isPro ? "default" : "outline"}>
                    {isPro ? t("proPlan") : t("freePlan")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                  <Shield className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("saved")}</p>
                  <p className="text-2xl font-bold">
                    {recentChecks?.filter((c) => c.recommendation === "DON'T BUY").length ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("badPurchasesAvoided")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t("recentAnalyses")}
                  </CardTitle>
                  <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/analyze" />}>
                    {t("newAnalysis")}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentChecks && recentChecks.length > 0 ? (
                    <div className="space-y-4">
                      {recentChecks.map((check) => (
                        <div
                          key={check.id}
                          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {(check.result as Record<string, unknown>)?.product_name as string ?? check.input_value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(check.created_at).toLocaleDateString(locale)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            {check.score !== null && (
                              <span className={`text-lg font-bold ${check.score > 69 ? "text-emerald-500" : check.score > 39 ? "text-amber-500" : "text-red-500"}`}>
                                {check.score}
                              </span>
                            )}
                            {check.recommendation && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${check.recommendation === "BUY" ? "border-emerald-200 text-emerald-600" : check.recommendation === "DON'T BUY" ? "border-red-200 text-red-600" : "border-amber-200 text-amber-600"}`}
                              >
                                {getRecLabel(check.recommendation)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Sparkles className="mb-4 h-12 w-12 text-muted-foreground/30" />
                      <p className="font-medium">{t("noAnalyses")}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{t("startFirst")}</p>
                      <Button className="mt-4" nativeButton={false} render={<Link href="/analyze" />}>
                        {t("analyzeProduct")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {!isPro && (
                <Card className="border-2 border-indigo-200 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-500/5 to-violet-500/5">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-indigo-500" />
                      <h3 className="font-bold">{t("upgrade")}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{t("upgradeDesc")}</p>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                      nativeButton={false}
                      render={<Link href="/#pricing" />}
                    >
                      {t("upgradeNow")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-4 w-4" />
                    {t("quickActions")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" nativeButton={false} render={<Link href="/analyze" />}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("newAnalysis")}
                  </Button>
                  <Separator />
                  <form action="/auth/signout" method="POST">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                      {t("signOut")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
