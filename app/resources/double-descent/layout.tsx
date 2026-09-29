import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Double Descent",
  description:
    "Error that rises at the interpolation threshold and then falls again. Why over-parameterised models generalise, and what minimum-norm bias has to do with it.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
