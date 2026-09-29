import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recurrent Networks (RNNs, LSTMs & Sequence Models)",
  description:
    "Sequential temporal dynamics, Backpropagation Through Time (BPTT), vanishing gradients, LSTM memory gates, and Transformer self-attention.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
