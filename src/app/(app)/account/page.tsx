import type { Metadata } from "next";
import { PlaceholderScreen } from "@/features/shell/placeholder-screen";

export const metadata: Metadata = {
  title: "Account management",
};

export default function AccountPage() {
  return (
    <PlaceholderScreen
      title="Account management"
      description="Who can sign in, and what each of them may do."
      crumbs={[{ label: "Account management" }]}
    />
  );
}
