import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROC & AUC: Diagnostic Power",
  description:
    "Mapping the sensitivity vs. specificity tradeoff across continuous decision thresholds with confusion matrix projections and integral AUC estimation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
