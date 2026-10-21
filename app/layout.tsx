import type { Metadata, Viewport } from "next";
import { Albert_Sans, Unbounded } from "next/font/google";
import "./globals.css";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.ai-society.club",
  ),
  title: {
    default:
      "AI Society, Bennett University | Training Minds, One Epoch at a Time",
    template: "%s | AI Society, Bennett University",
  },
  description:
    "Bennett University's premier artificial intelligence student specialization society. Dedicated to deep learning research, intelligent systems, hackathons, and technical workshops.",
  keywords: [
    "AI Society",
    "Bennett University",
    "Artificial Intelligence",
    "Deep Learning",
    "Machine Learning",
    "Hackathon",
    "Student Club",
    "AIS BU",
  ],
  authors: [{ name: "AI Society Bennett University" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${albertSans.variable} ${unbounded.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
