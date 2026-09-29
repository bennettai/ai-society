import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equality of Odds",
  description:
    "Defining and measuring parity in true and false positive rates across groups, the equal-opportunity relaxation, and the three stages at which you can intervene.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
