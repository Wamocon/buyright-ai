"use client";

import { useState, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnalysisForm } from "@/features/analysis/AnalysisForm";
import { ResultsDisplay } from "@/features/analysis/ResultsDisplay";
import type { AnalysisResult } from "@/types";

function AnalyzeContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-12">
      {result ? (
        <ResultsDisplay
          result={result}
          onNewAnalysis={() => setResult(null)}
        />
      ) : (
        <AnalysisForm onResult={setResult} />
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
