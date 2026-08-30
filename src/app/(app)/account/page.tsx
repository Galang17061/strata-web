import type { Metadata } from "next";
import { AccountScreen } from "@/features/account/account-screen";

export const metadata: Metadata = {
  title: "Account management",
};

export default function AccountPage() {
  return <AccountScreen />;
}
