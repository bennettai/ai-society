import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neural Networks: A Visual Introduction",
  description:
    "Constructing feed-forward computational graphs from first principles: layer activations, synaptic weights, Adam optimization, and live backpropagation feedback loops.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
