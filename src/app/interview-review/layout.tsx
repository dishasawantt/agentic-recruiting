import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Interview review",
  description: "Interview scorecard — strengths, gaps, and overall assessment",
};

export default function InterviewReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm text-slate-600">Loading…</div>
      }
    >
      {children}
    </Suspense>
  );
}
