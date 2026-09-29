import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convolutional Neural Networks (CNNs)",
  description:
    "Spatial receptive fields, 2D discrete convolution kernels, hierarchical feature maps, and spatial invariance through pooling layers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
