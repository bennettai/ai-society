import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logistic Regression & The Sigmoid Curve",
  description:
    "Projecting continuous feature combinations onto calibrated probability bounds. Analyzing logit slopes, odds ratios, and linear decision boundaries.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
