"use client";

import Link from "next/link";
import FoldLayout from "@/components/FoldLayout";
import { assetPath } from "@/lib/basePath";

/* ── Shape paths from shapes.gallery ──────────────────────────────────── */
const SHAPES = {
  /** quad-arc corners */
  quad: "M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z",
  /** twin half-moons */
  moon: "M 0 0 C 70.692 0 128 57.308 128 128 C 128 198.692 70.692 256 0 256 Z M 256 256 C 185.308 256 128 198.692 128 128 C 128 57.308 185.308 0 256 0 Z",
  /** rounded square + circular void */
  donut: "M 156 0 C 211.228 0 256 44.772 256 100 L 256 256 L 100 256 C 44.772 256 0 211.228 0 156 L 0 0 Z M 80 80 C 80 133.019 122.981 176 176 176 C 176 122.981 133.019 80 80 80 Z",
  /** rounded square + inner diamond cross */
  diamond: "M 206 0 C 233.614 0 256 22.386 256 50 L 256 206 C 256 233.614 233.614 256 206 256 L 50 256 C 22.386 256 0 233.614 0 206 L 0 50 C 0 22.386 22.386 0 50 0 Z M 128 64 C 128 99.346 99.346 128 64 128 C 99.346 128 128 156.654 128 192 C 128 156.654 156.654 128 192 128 C 156.654 128 128 99.346 128 64 Z",
  /** spiral arcs */
  spiral: "M 128 192 C 92.654 192 64 220.654 64 256 L 0 256 C 0 185.308 57.308 128 128 128 Z M 256 128 C 256 198.692 198.692 256 128 256 L 128 192 C 163.346 192 192 163.346 192 128 Z M 128 64 C 92.654 64 64 92.654 64 128 L 0 128 C 0 57.308 57.308 0 128 0 Z M 256 0 C 256 70.692 198.692 128 128 128 L 128 64 C 163.346 64 192 35.346 192 0 Z",
};

type ShapeKey = keyof typeof SHAPES;

/* ── Re-usable shape-masked image ─────────────────────────────────────── */
function ShapeImg({
  shape,
  src,
  uid,
  className = "",
  style = {},
}: {
  shape: ShapeKey;
  src: string;
  uid: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`clip-nf-${uid}`} clipPathUnits="userSpaceOnUse">
          <path d={SHAPES[shape]} />
        </clipPath>
      </defs>
      <image
        href={assetPath(src)}
        xlinkHref={assetPath(src)}
        x="0"
        y="0"
        width="256"
        height="256"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#clip-nf-${uid})`}
      />
      <rect
        x="0"
        y="0"
        width="256"
        height="256"
        fill="rgba(222,93,53,0.07)"
        clipPath={`url(#clip-nf-${uid})`}
        style={{ pointerEvents: "none" }}
      />
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function NotFound() {
  return (
    <FoldLayout showFooter={false}>
      <main
        className="grow flex flex-col justify-center min-h-screen bg-[#EFECE6] text-[#1A1816] overflow-hidden"
        style={{
          padding:
            "clamp(80px,10vw,140px) clamp(20px,5vw,72px) clamp(40px,5vw,80px)",
        }}
      >
        {/* ── Row 1 — [quad img] · 404 · [moon img], grouped and centered ─ */}
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          <ShapeImg
            shape="quad"
            src="/images/hero1.jpg"
            uid="a"
            style={{
              width: "clamp(80px,11vw,180px)",
              height: "clamp(80px,11vw,180px)",
            }}
          />

          <span
            className="font-display font-black tracking-[-0.04em] leading-[0.88] text-[#1A1816] select-none"
            style={{ fontSize: "clamp(72px,17vw,220px)" }}
          >
            404
          </span>

          <ShapeImg
            shape="moon"
            src="/images/clubbattle.webp"
            uid="b"
            style={{
              width: "clamp(70px,10vw,160px)",
              height: "clamp(70px,10vw,160px)",
            }}
          />
        </div>

        {/* ── Row 2 — ERROR (indented so its trailing "OR" sits under
               the "40" of 404) · [donut img] ─────────────────────────── */}
        <div
          className="flex items-center gap-3 sm:gap-5"
          style={{ marginTop: "clamp(-8px,-1.5vw,-28px)" }}
        >
          <span
            className="font-display font-black tracking-[-0.04em] leading-[0.88] text-[#1A1816] select-none whitespace-nowrap"
            style={{
              fontSize: "clamp(72px,17vw,220px)",
              marginLeft: "max(0px, calc(50% - 2.7em))",
            }}
          >
            ERROR
          </span>

          <ShapeImg
            shape="donut"
            src="/images/hero3.webp"
            uid="c"
            style={{
              width: "clamp(80px,11vw,175px)",
              height: "clamp(80px,11vw,175px)",
            }}
          />

          <div className="flex-1" />
        </div>

        {/* ── Row 3 — PAGE · [accent shape] · [spiral img in front of
               "PA"] · [moon img bottom corner] ────────────────────────── */}
        <div
          className="relative flex items-center gap-3 sm:gap-5"
          style={{ marginTop: "clamp(-8px,-1.5vw,-28px)" }}
        >
          <span
            className="font-display font-black tracking-[-0.04em] leading-[0.88] text-[#1A1816] select-none whitespace-nowrap"
            style={{
              fontSize: "clamp(72px,17vw,220px)",
              marginLeft: "max(0px, calc(50% - 1em))",
            }}
          >
            PAGE
          </span>

          {/* Spiral image — sits just left of the "P", adjacent to it */}
          <ShapeImg
            shape="spiral"
            src="/images/hero2.jpg"
            uid="d"
            className="absolute top-1/2 -translate-y-1/2 z-10"
            style={{
              width: "clamp(65px,9vw,145px)",
              height: "clamp(65px,9vw,145px)",
              left: "max(0px, calc(50% - clamp(72px, 17vw, 220px) - 1.25rem - clamp(65px, 9vw, 145px)))",
            }}
          />

          {/* Pure-shape accent — no photo, just the orange fill */}
          <svg
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{
              width: "clamp(50px,7vw,110px)",
              height: "clamp(50px,7vw,110px)",
              flexShrink: 0,
              color: "#DE5D35",
              opacity: 0.2,
            }}
          >
            <path d={SHAPES.diamond} fill="currentColor" />
          </svg>
        </div>

        {/* ── Hairline divider ──────────────────────────────────────── */}
        <div
          className="border-t border-[#1A1816]/15"
          style={{ marginTop: "clamp(20px,4vw,52px)" }}
        />

        {/* ── Caption + CTA ─────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          style={{ marginTop: "clamp(16px,3vw,36px)" }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#DE5D35] font-bold">
              404 · Page Not Found
            </span>
            <p className="text-[14px] text-[#75716B] leading-relaxed max-w-[44ch]">
              Sorry, the page you&apos;re looking for doesn&apos;t exist or has
              been moved.
            </p>
          </div>

          <Link
            href="/"
            className="pill bg-[#1A1816] text-[#EFECE6] hover:bg-[#DE5D35] transition-colors duration-300 self-start sm:self-auto shrink-0"
          >
            <span>Return to Home</span>
            <span className="pill__medal bg-white/10" aria-hidden />
          </Link>
        </div>
      </main>
    </FoldLayout>
  );
}
