import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Transformer: Attention Is All You Need",
  description:
    "Eliminating recurrence with constant-path multi-head self-attention. Interactive dual-tower architecture, coreference attention simulator, and autoregressive generation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
