import type { Metadata } from "next";
import { PlaceholderScreen } from "@/features/shell/placeholder-screen";

export const metadata: Metadata = {
  title: "Components",
};

export default function ComponentsPage() {
  return (
    <PlaceholderScreen
      title="Components"
      description="The catalogue of parts a system can be built from."
      crumbs={[{ label: "Master data" }, { label: "Components" }]}
    />
  );
}
