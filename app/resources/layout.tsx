import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Learning Center",
    template: "%s | AI Society, Bennett University",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
