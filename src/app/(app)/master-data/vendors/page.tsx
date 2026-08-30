import type { Metadata } from "next";
import { VendorsScreen } from "@/features/master-data/vendors-screen";

export const metadata: Metadata = {
  title: "Vendors",
};

export default function VendorsPage() {
  return <VendorsScreen />;
}
