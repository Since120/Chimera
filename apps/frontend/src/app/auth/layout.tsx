import { SplitLayout } from "@/components/dashboard/auth/split-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Pyro System",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <SplitLayout>{children}</SplitLayout>;
}
