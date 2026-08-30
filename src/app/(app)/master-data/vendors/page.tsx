import type { Metadata } from "next";
import { PlaceholderScreen } from "@/features/shell/placeholder-screen";

export const metadata: Metadata = {
  title: "Vendors",
};

export default function VendorsPage() {
  return (
    <PlaceholderScreen
      title="Vendors"
      description="The manufacturers your components come from."
      crumbs={[{ label: "Master data" }, { label: "Vendors" }]}
    />
  );
}
