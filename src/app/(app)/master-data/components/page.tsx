import type { Metadata } from "next";
import { ComponentsScreen } from "@/features/master-data/components-screen";

export const metadata: Metadata = {
  title: "Components",
};

export default function ComponentsPage() {
  return <ComponentsScreen />;
}
