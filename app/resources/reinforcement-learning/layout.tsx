import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reinforcement Learning",
  description:
    "Learning from delayed consequences instead of labels. Markov decision processes, the explore-exploit dilemma, grid worlds, and the Bellman recursion.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
