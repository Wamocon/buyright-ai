import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createServiceClient } from "@/lib/supabase/server";
import { SharedResultDisplay } from "./SharedResultDisplay";
import type { AnalysisResult } from "@/types";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SharedResultPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const supabase = await createServiceClient();
  const { data: check } = await supabase
    .from("product_checks")
    .select("result, score, recommendation, created_at")
    .eq("id", id)
    .single();

  if (!check?.result) {
    notFound();
  }

  const result = check.result as unknown as AnalysisResult;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-12">
          <SharedResultDisplay result={result} />
        </div>
      </main>
      <Footer />
    </>
  );
}
