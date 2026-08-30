import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/brand/loader";
import { WorkspaceScreen } from "@/features/workspace/workspace-screen";

export const metadata: Metadata = {
  title: "Workspace",
};

export default function WorkspacePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <WorkspaceScreen />
    </Suspense>
  );
}
