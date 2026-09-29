import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Random Forest Algorithm",
  description:
    "Bagging, random feature sub-sampling, and majority voting. How averaging many decorrelated trees collapses variance without adding bias.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
