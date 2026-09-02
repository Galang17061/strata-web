import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/brand/loader";
import { ReportScreen } from "@/features/projects/report-screen";

export const metadata: Metadata = {
  title: "Report",
  description: "A printable reliability report for one system.",
};

export default function ReportPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ReportScreen />
    </Suspense>
  );
}
