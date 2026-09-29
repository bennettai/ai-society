import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linear Regression: Ordinary Least Squares",
  description:
    "Minimizing orthogonal Euclidean residuals in parameter space. Closed-form normal equations versus iterative gradient descent steps.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
