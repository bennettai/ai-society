import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Train, Test & Validation: The Honest Split",
  description:
    "Why one dataset must become three, what each partition is actually for, and how a single careless peek turns your final number into fiction.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
