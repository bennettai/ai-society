import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decision Trees & Random Forests",
  description:
    "Recursive feature space partitioning, Gini impurity minimization, and bootstrap aggregation (bagging) with random feature sub-sampling to suppress variance.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
