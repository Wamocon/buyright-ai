"use client";

import { useState, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnalysisForm } from "@/features/analysis/AnalysisForm";
import { ResultsDisplay } from "@/features/analysis/ResultsDisplay";
import type { AnalysisResult } from "@/types";

function AnalyzeContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [checkId, setCheckId] = useState<string | undefined>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-12">
      {result ? (
        <ResultsDisplay
          result={result}
          checkId={checkId}
          onNewAnalysis={() => { setResult(null); setCheckId(undefined); }}
        />
      ) : (
        <AnalysisForm onResult={(r, id) => { setResult(r); setCheckId(id); }} />
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense>
          <AnalyzeContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
