"use client";

import { useState, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareForm } from "@/features/comparison/CompareForm";
import { CompareResults } from "@/features/comparison/CompareResults";
import type { ComparisonResult } from "@/types";

function CompareContent() {
  const [result, setResult] = useState<ComparisonResult | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-12">
      {result ? (
        <CompareResults result={result} onReset={() => setResult(null)} />
      ) : (
        <CompareForm onResult={setResult} />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense>
          <CompareContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

