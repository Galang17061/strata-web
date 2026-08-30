import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/brand/loader";
import { ProjectDetailScreen } from "@/features/projects/project-detail-screen";

export const metadata: Metadata = {
  title: "Project",
};

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProjectDetailScreen />
    </Suspense>
  );
}
