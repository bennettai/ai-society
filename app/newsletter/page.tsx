"use client";

import { useState } from "react";
import Link from "next/link";
import FoldLayout from "@/components/FoldLayout";

const shapes = {
  S17: `<path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>`,
  S2: `<path d="M 128 192 C 92.654 192 64 220.654 64 256 L 0 256 C 0 185.308 57.308 128 128 128 Z M 256 128 C 256 198.692 198.692 256 128 256 L 128 192 C 163.346 192 192 163.346 192 128 Z M 128 64 C 92.654 64 64 92.654 64 128 L 0 128 C 0 57.308 57.308 0 128 0 Z M 256 0 C 256 70.692 198.692 128 128 128 L 128 64 C 163.346 64 192 35.346 192 0 Z" fill="currentColor"/>`,
  S60: `<path d="M 0 256 L 0 128 L 128 128 Z M 128 256 L 128 128 L 256 128 Z M 0 128 L 0 0 L 128 0 Z M 128 128 L 128 0 L 256 0 Z" fill="currentColor"/>`,
};

type ShapeKey = keyof typeof shapes;

interface Floater {
  id: ShapeKey;
  size: number;
  top: string;
  left: string;
  rotate: number;
  delay: number;
  duration: number;
  opacity: number;
}

const floaters: Floater[] = [
  {
    id: "S17",
    size: 100,
    top: "12%",
    left: "78%",
    rotate: -15,
    delay: 0.5,
    duration: 7,
    opacity: 0.1,
  },
  {
    id: "S2",
    size: 120,
    top: "65%",
    left: "5%",
    rotate: 20,
    delay: 1.2,
    duration: 8,
    opacity: 0.11,
  },
  {
    id: "S60",
    size: 90,
    top: "80%",
    left: "85%",
    rotate: 45,
    delay: 2,
    duration: 9,
    opacity: 0.09,
  },
];

const DISPATCH_TOPICS = [
  {
    num: "01",
    title: "Frontier Papers",
    desc: "Rigorous mathematical breakdowns of landmark arXiv preprints and reasoning architectures.",
  },
  {
    num: "02",
    title: "Code & Weights",
    desc: "First-principles PyTorch implementations, fine-tuning recipes, and benchmark results.",
  },
  {
    num: "03",
    title: "Lab Dispatches",
    desc: "Inside scoop on Bennett University AI Society projects, symposiums, and hackathons.",
  },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <FoldLayout>
      <main className="grow flex flex-col items-center justify-center min-h-screen bg-[#EFECE6] text-[#1A1816] relative overflow-hidden pt-28 pb-20 px-6">
        {/* Floating Shapes */}
        {floaters.map((f) => (
          <svg
            key={f.id + f.top}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width={f.size}
            height={f.size}
            aria-hidden="true"
            className="hidden sm:block"
            style={{
              position: "absolute",
              top: f.top,
              left: f.left,
              color: "#3F1E46",
              opacity: f.opacity,
              transform: `rotate(${f.rotate}deg)`,
              animation: `floatY ${f.duration}s ease-in-out ${f.delay}s infinite alternate`,
              pointerEvents: "none",
              userSelect: "none",
            }}
            dangerouslySetInnerHTML={{ __html: shapes[f.id] }}
          />
        ))}

        {/* Ambient radial glows */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-8%",
            left: "-5%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(221,110,45,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-8%",
            right: "-5%",
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(63,30,70,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-[720px] mx-auto">
          {/* Pulsing Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#3F1E46]/10 border border-[#3F1E46]/30 text-[#3F1E46] font-mono text-[11px] font-bold tracking-widest uppercase mb-8 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3F1E46] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3F1E46]" />
            </span>
            <span>06 / WEEKLY DISPATCH · AIS NEWSLETTER</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#1A1816] mb-6"
            style={{ fontSize: "clamp(52px, 11vw, 108px)" }}
          >
            Newsletter.
            <br />
            <span className="text-[#DD6E2D]">Coming Soon.</span>
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#75716B] leading-[1.65] max-w-[48ch] mb-10">
            A weekly signal in a noisy field. We are preparing our first
            editorial dispatch covering modern machine learning architectures
            and lab developments.
          </p>

          {/* Waitlist Form */}
          <div className="w-full max-w-[460px] mb-12">
            {subscribed ? (
              <div className="p-4 rounded-full bg-[#3F1E46] text-white font-mono text-[12px] font-bold tracking-wide uppercase shadow-md">
                ✓ You&apos;re on the priority notification list!
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 p-1.5 rounded-full bg-[#FAF9F5] border border-[#1A1816]/15 shadow-sm"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter university or work email..."
                  required
                  className="grow px-4 py-2 bg-transparent text-[13px] text-[#1A1816] placeholder:text-[#75716B]/60 focus:outline-hidden font-sans"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#1A1816] hover:bg-[#262626] text-white font-mono text-[11px] font-bold tracking-wider uppercase transition-transform active:scale-95 shrink-0"
                >
                  Join Waitlist
                </button>
              </form>
            )}
          </div>

          {/* Topics Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left mb-12">
            {DISPATCH_TOPICS.map((t) => (
              <div
                key={t.num}
                className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#1A1816]/10 hover:border-[#3F1E46]/40 transition-colors shadow-xs"
              >
                <span className="text-[11px] font-mono text-[#DD6E2D] font-bold block mb-2">
                  {t.num}
                </span>
                <h3 className="font-display font-bold text-[16px] text-[#1A1816] mb-1.5">
                  {t.title}
                </h3>
                <p className="text-[13px] text-[#75716B] leading-relaxed">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1816] text-white hover:bg-[#262626] font-mono text-[12px] uppercase tracking-wider font-bold transition-transform active:scale-95"
            >
              <span>← Return Home</span>
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF9F5] border border-[#1A1816]/20 text-[#1A1816] hover:bg-white font-mono text-[12px] uppercase tracking-wider font-bold transition-transform active:scale-95"
            >
              <span>Explore Learning Center →</span>
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes floatY {
            from { transform: translateY(0px) rotate(var(--r, 0deg)); }
            to   { transform: translateY(-20px) rotate(var(--r, 0deg)); }
          }
        `}</style>
      </main>
    </FoldLayout>
  );
}
