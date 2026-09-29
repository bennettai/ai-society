import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Bias-Variance Tradeoff",
  description:
    "Decomposing expected error into bias squared, variance, and irreducible noise. Underfitting, overfitting, and the KNN knob that dials between them.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
