import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "K-Fold Partitioning & Generalization",
  description:
    "Mitigating sample bias and estimating performance variance through rotational holdout splits and out-of-fold validation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
