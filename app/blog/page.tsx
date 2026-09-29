import type { Metadata } from "next";
import Link from "next/link";
import FoldLayout from "@/components/FoldLayout";

export const metadata: Metadata = {
  title: "Engineering Blog",
  description:
    "Technical essays, research notes, model post-mortems, and engineering guides authored by Bennett University AI Society fellows.",
};

const shapes = {
  S1: `<path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" fill="currentColor"/>`,
  S38: `<path d="M 206 0 C 233.614 0 256 22.386 256 50 L 256 206 C 256 233.614 233.614 256 206 256 L 50 256 C 22.386 256 0 233.614 0 206 L 0 50 C 0 22.386 22.386 0 50 0 Z M 128 64 C 128 99.346 99.346 128 64 128 C 99.346 128 128 156.654 128 192 C 128 156.654 156.654 128 192 128 C 156.654 128 128 99.346 128 64 Z" fill="currentColor"/>`,
  S27: `<path d="M 156 0 C 211.228 0 256 44.772 256 100 L 256 256 L 100 256 C 44.772 256 0 211.228 0 156 L 0 0 Z M 80 80 C 80 133.019 122.981 176 176 176 C 176 122.981 133.019 80 80 80 Z" fill="currentColor"/>`,
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
    size: 140,
    top: "10%",
    left: "6%",
    rotate: 10,
    delay: 0,
    duration: 8,
    opacity: 0.12,
  },
  {
    id: "S38",
    size: 150,
    top: "50%",
    left: "84%",
    rotate: -15,
    delay: 1.2,
    duration: 9,
    opacity: 0.09,
  },
  {
    id: "S27",
    size: 120,
    top: "75%",
    left: "5%",
    rotate: 25,
    delay: 2,
    duration: 7,
    opacity: 0.1,
  },
];

const UPCOMING_POSTS = [
  {
    tag: "GPU & SYSTEMS",
    title: "Writing Custom Triton & CUDA Kernels for Attention",
    desc: "A hands-on walkthrough optimizing memory bandwidth and tiling strategies for FlashAttention on RTX & H100 architectures.",
  },
  {
    tag: "EMPIRICAL RESEARCH",
    title: "Evaluating Scaling Laws in 1B–3B Parameter SLMs",
    desc: "Empirical compute-optimal training experiments conducted in Bennett University's high-performance AI lab.",
  },
  {
    tag: "THEORY & BIOLOGY",
    title: "Geometric Deep Learning for Molecular Discovery",
    desc: "Equivariant Graph Neural Networks and diffusion manifolds applied to conformational energy estimation.",
  },
];

export default function BlogPage() {
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
            top: "-8%",
            right: "-6%",
            width: 460,
            height: 460,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(63,30,70,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-6%",
            left: "-6%",
            width: 440,
            height: 440,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(221,110,45,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-[760px] mx-auto">
          {/* Pulsing Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#DD6E2D]/10 border border-[#DD6E2D]/30 text-[#DD6E2D] font-mono text-[11px] font-bold tracking-widest uppercase mb-8 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DD6E2D] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DD6E2D]" />
            </span>
            <span>07 / ENGINEERING LOG · ESSAYS & RESEARCH</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#1A1816] mb-6"
            style={{ fontSize: "clamp(52px, 11vw, 108px)" }}
          >
            Blog.
            <br />
            <span className="text-[#DD6E2D]">Coming Soon.</span>
          </h1>

          {/* Description */}
          <p className="text-[16px] text-[#75716B] leading-[1.65] max-w-[50ch] mb-12">
            Long-form technical publications, benchmark logs, and engineering
            post-mortems authored by Bennett University AI Society fellows and
            researchers.
          </p>

          {/* Upcoming Posts Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left mb-12">
            {UPCOMING_POSTS.map((post) => (
              <div
                key={post.title}
                className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#1A1816]/10 hover:border-[#DD6E2D]/40 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#3F1E46] bg-[#3F1E46]/10 px-2 py-0.5 rounded-full font-bold mb-3">
                    {post.tag}
                  </span>
                  <h3 className="font-display font-bold text-[15px] leading-snug text-[#1A1816] mb-2">
                    {post.title}
                  </h3>
                  <p className="text-[12px] text-[#75716B] leading-relaxed">
                    {post.desc}
                  </p>
                </div>
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
