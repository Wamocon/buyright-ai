import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze Product",
  description: "Analyze any product with AI before you buy. Get a score, recommendation, and better alternatives.",
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
