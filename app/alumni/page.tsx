import type { Metadata } from "next";
import Link from "next/link";
import FoldLayout from "@/components/FoldLayout";

export const metadata: Metadata = {
  title: "Alumni Network",
  description:
    "Connecting Bennett University's artificial intelligence graduates, frontier lab researchers, and alumni tech founders across the world.",
};

const shapes = {
  S1: `<path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" fill="currentColor"/>`,
  S27: `<path d="M 156 0 C 211.228 0 256 44.772 256 100 L 256 256 L 100 256 C 44.772 256 0 211.228 0 156 L 0 0 Z M 80 80 C 80 133.019 122.981 176 176 176 C 176 122.981 133.019 80 80 80 Z" fill="currentColor"/>`,
  S49: `<path d="M 0 0 C 70.692 0 128 57.308 128 128 C 128 198.692 70.692 256 0 256 Z M 256 256 C 185.308 256 128 198.692 128 128 C 128 57.308 185.308 0 256 0 Z" fill="currentColor"/>`,
  S52: `<path d="M 152 70.059 L 201.539 20.519 L 235.48 54.461 L 185.941 104 L 256 104 L 256 152 L 185.941 152 L 235.48 201.539 L 201.539 235.48 L 152 185.941 L 152 256 L 104 256 L 104 185.941 L 54.46 235.48 L 20.52 201.539 L 70.059 152 L 0 152 L 0 104 L 70.059 104 L 20.519 54.46 L 54.461 20.52 L 104 70.059 L 104 0 L 152 0 Z" fill="currentColor"/>`,
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
    id: "S1",
    size: 130,
    top: "8%",
    left: "5%",
    rotate: 15,
    delay: 0,
    duration: 8,
    opacity: 0.12,
  },
  {
    id: "S27",
    size: 160,
    top: "58%",
    left: "82%",
    rotate: 25,
    delay: 1,
    duration: 9,
    opacity: 0.08,
  },
  {
    id: "S49",
    size: 100,
    top: "75%",
    left: "4%",
    rotate: -20,
    delay: 2,
    duration: 7,
    opacity: 0.1,
  },
  {
    id: "S52",
    size: 110,
    top: "18%",
    left: "80%",
    rotate: -10,
    delay: 1.5,
    duration: 8,
    opacity: 0.09,
  },
];

const PREVIEWS = [
  {
    title: "Global Directory",
    desc: "Mapping AIS alumni across frontier research labs, Big Tech, and emerging AI startups worldwide.",
  },
  {
    title: "Mentorship Office Hours",
    desc: "Direct 1-on-1 sessions for grad school applications, technical interviews, and research roadmaps.",
  },
  {
    title: "Founder & Venture Syndicate",
    desc: "Mentoring and connecting early-stage student founders building applied AI solutions.",
  },
];

export default function AlumniPage() {
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
              color: "#DD6E2D",
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
            top: "-5%",
            right: "-5%",
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(63,30,70,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-5%",
            left: "-5%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(221,110,45,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-[720px] mx-auto">
          {/* Pulsing Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#DD6E2D]/10 border border-[#DD6E2D]/30 text-[#DD6E2D] font-mono text-[11px] font-bold tracking-widest uppercase mb-8 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DD6E2D] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DD6E2D]" />
            </span>
            <span>05 / ALUMNI NETWORK · COHORT HERITAGE</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#1A1816] mb-6"
            style={{ fontSize: "clamp(52px, 11vw, 108px)" }}
          >
            Alumni.
            <br />
            <span className="text-[#DD6E2D]">Coming Soon.</span>
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#75716B] leading-[1.65] max-w-[48ch] mb-12">
            The official Bennett University AI Society alumni directory and
            mentorship nexus is currently being compiled for the 2026–2027
            cohort.
          </p>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left mb-12">
            {PREVIEWS.map((p) => (
              <div
                key={p.title}
                className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#1A1816]/10 hover:border-[#DD6E2D]/40 transition-colors shadow-xs"
              >
                <div className="w-2 h-2 rounded-full bg-[#3F1E46] mb-3" />
                <h3 className="font-display font-bold text-[16px] text-[#1A1816] mb-1.5">
                  {p.title}
                </h3>
                <p className="text-[13px] text-[#75716B] leading-relaxed">
                  {p.desc}
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
