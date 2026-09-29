import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confusion Matrix, Precision-Recall & F1",
  description:
    "Navigating severe class imbalance where baseline accuracy fails. Harmonic balance between false positive alarms, missed detections, and F1 optimization.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
