import type { Metadata } from "next";
import { PlaceholderScreen } from "@/features/shell/placeholder-screen";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <PlaceholderScreen
      title="Projects"
      description="Every project and the systems modelled inside it."
      crumbs={[{ label: "Projects" }]}
    />
  );
}
