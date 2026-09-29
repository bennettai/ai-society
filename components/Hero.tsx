"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { assetPath } from "@/lib/basePath";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          standard: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as {
            reduceMotion: boolean;
            standard: boolean;
          };

          if (reduceMotion) {
            gsap.set(
              [
                ".hero-title-line",
                ".hero-subtext",
                ".hero-cta",
                ".hero-canvas",
                ".hero-meta",
              ],
              { opacity: 1, y: 0, scale: 1 },
            );
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
          });

          // Staggered title lines reveal with masked overflow
          tl.fromTo(
            ".hero-title-line",
            { yPercent: 115, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.0,
              stagger: 0.12,
              delay: 0.1,
            },
          )
            // Subtext & CTA pill slide up gently
            .fromTo(
              [".hero-subtext", ".hero-cta"],
              { y: 24, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
              "-=0.6",
            )
            // Photographic canvas expands into full scale
            .fromTo(
              ".hero-canvas",
              { scale: 0.95, opacity: 0, y: 30 },
              { scale: 1, opacity: 1, y: 0, duration: 1.1, ease: "power2.out" },
              "-=0.7",
            )
            // Metadata bar softly fades in
            .fromTo(
              ".hero-meta",
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.6 },
              "-=0.5",
            );

          // Subtle parallax scrub on scroll
          gsap.to(".hero-canvas-inner", {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        },
      );
    },
    { scope: containerRef },
  );
  // 3 Shapes from user (256x256 coordinate system)
  const SHAPE_1 =
    "M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z";

  const SHAPE_2 =
    "M 78 0 C 105.614 0 128 22.386 128 50 C 128 22.386 150.386 0 178 0 L 256 0 L 256 78 C 256 105.614 233.614 128 206 128 C 233.614 128 256 150.386 256 178 L 256 256 L 178 256 C 150.386 256 128 233.614 128 206 C 128 233.614 105.614 256 78 256 L 0 256 L 0 178 C 0 150.386 22.386 128 50 128 C 22.386 128 0 105.614 0 78 L 0 0 Z";

  const SHAPE_3 =
    "M 256 0 C 256 35.346 227.346 64 192 64 C 227.346 64 256 92.654 256 128 C 256 163.346 227.346 192 192 192 C 227.346 192 256 220.654 256 256 L 0 256 C 0 220.654 28.654 192 64 192 C 28.654 192 0 163.346 0 128 C 0 92.654 28.654 64 64 64 C 28.654 64 0 35.346 0 0 Z";

  // Seamless Coordinates: 0px gap between shapes (edge-to-edge interlock)
  // Panel width: 400, Height: 400, Total Width: 1200
  const panelW = 400;
  const panelH = 400;
  const scale = panelW / 256; // 1.5625

  const panels = [
    {
      id: "panel-1",
      path: SHAPE_1,
      image: "/images/hero1.jpg",
      x: 0,
      mobileX: 0,
      mobileY: 0,
      label: "01 · AI Society Cohort",
    },
    {
      id: "panel-2",
      path: SHAPE_2,
      image: "/images/clubbattle.webp", // Replaced with Club Battle image
      x: 400,
      mobileX: 400,
      mobileY: 0,
      label: "02 · Club Battle Showcase",
    },
    {
      id: "panel-3",
      path: SHAPE_3,
      image: "/images/hero3.webp",
      x: 800,
      mobileX: 0,
      mobileY: 400,
      label: "03 · Academic Assembly",
    },
  ];

  return (
    <section
      ref={containerRef}
      id="hero"
      className="pt-[124px] pb-16 md:pt-[180px] md:pb-24 overflow-hidden"
    >
      <div className="shell">
        {/* Top Editorial Row */}
        <div className="mb-12 flex flex-col gap-10 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="type-container lg:w-[68%]">
            <h1 className="type-display text-ink">
              <span className="block overflow-hidden py-1">
                <span className="hero-title-line block">One Society.</span>
              </span>
              <span className="block overflow-hidden py-1">
                <span className="hero-title-line block">
                  Hundreds of Vital Epochs.
                </span>
              </span>
            </h1>
          </div>

          <div className="flex flex-col items-start gap-7 lg:w-[28%] lg:items-end">
            <p className="hero-subtext max-w-[40ch] text-[14px] leading-[1.55] text-ink-soft lg:text-right">
              Bennett University&apos;s artificial intelligence society,
              engineering autonomous systems, neural architectures, and
              real-world intelligence.
            </p>

            <a href="#works" className="hero-cta pill">
              <span>See our work</span>
              <span className="pill__medal" aria-hidden />
            </a>
          </div>
        </div>

        {/* 
          Hero Photographic Canvas:
          Seamless 0px gap edge-to-edge geometric mask without borders
        */}
        <div className="hero-canvas group relative w-full overflow-hidden select-none">
          <div className="hero-canvas-inner will-change-transform">
            {/* Desktop: seamless 3-panel strip (1200x400) */}
            <svg
              viewBox="0 0 1200 400"
              className="hidden md:block w-full h-auto"
              style={{ filter: "drop-shadow(0 20px 45px rgba(0,0,0,0.06))" }}
              aria-label="AIS Flagship Events: AI 101, Club Battle Showcase, Academic Assembly"
            >
              <defs>
                {/* Subtle cinematic gradient overlay for depth */}
                <linearGradient id="hero-scrim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="60%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                </linearGradient>

                {/* ClipPaths for the 3 seamless shapes */}
                {panels.map((p) => (
                  <clipPath
                    key={`clip-${p.id}`}
                    id={`clip-${p.id}`}
                    clipPathUnits="userSpaceOnUse"
                  >
                    <path
                      d={p.path}
                      transform={`translate(${p.x}, 0) scale(${scale})`}
                    />
                  </clipPath>
                ))}
              </defs>

              {/* Render each of the 3 seamlessly masked image panels (no borders) */}
              {panels.map((p) => (
                <g key={p.id}>
                  {/* Masked Photograph */}
                  <image
                    clipPath={`url(#clip-${p.id})`}
                    href={assetPath(p.image)}
                    xlinkHref={assetPath(p.image)}
                    x={p.x}
                    y={0}
                    width={panelW}
                    height={panelH}
                    preserveAspectRatio="xMidYMid slice"
                  />

                  {/* Subtle scrim overlay clipped to shape */}
                  <rect
                    clipPath={`url(#clip-${p.id})`}
                    x={p.x}
                    y={0}
                    width={panelW}
                    height={panelH}
                    fill="url(#hero-scrim)"
                    pointerEvents="none"
                  />
                </g>
              ))}
            </svg>

            {/* Mobile: square 2x2 layout — three photo panels + accent shape */}
            <svg
              viewBox="0 0 800 800"
              className="block md:hidden w-full h-auto"
              style={{ filter: "drop-shadow(0 20px 45px rgba(0,0,0,0.06))" }}
              aria-label="AIS Flagship Events: AI 101, Club Battle Showcase, Academic Assembly"
            >
              <defs>
                {/* Subtle cinematic gradient overlay for depth */}
                <linearGradient id="hero-scrim-m" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="60%" stopColor="#000000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                </linearGradient>

                {panels.map((p) => (
                  <clipPath
                    key={`clip-m-${p.id}`}
                    id={`clip-m-${p.id}`}
                    clipPathUnits="userSpaceOnUse"
                  >
                    <path
                      d={p.path}
                      transform={`translate(${p.mobileX}, ${p.mobileY}) scale(${scale})`}
                    />
                  </clipPath>
                ))}
              </defs>

              {panels.map((p) => (
                <g key={`m-${p.id}`}>
                  <image
                    clipPath={`url(#clip-m-${p.id})`}
                    href={assetPath(p.image)}
                    xlinkHref={assetPath(p.image)}
                    x={p.mobileX}
                    y={p.mobileY}
                    width={panelW}
                    height={panelH}
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <rect
                    clipPath={`url(#clip-m-${p.id})`}
                    x={p.mobileX}
                    y={p.mobileY}
                    width={panelW}
                    height={panelH}
                    fill="url(#hero-scrim-m)"
                    pointerEvents="none"
                  />
                </g>
              ))}

              {/* Filler cell — pure accent shape, no photo */}
              <path
                d={panels[1].path}
                transform="translate(400, 400) scale(1.5625)"
                fill="#DE5D35"
                opacity={0.2}
              />
            </svg>
          </div>

          {/* Minimalist Editorial Metadata Bar below the canvas */}
          <div className="hero-meta mt-4 flex flex-wrap items-center justify-between gap-4 px-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft/70">
            <div className="flex flex-wrap items-center gap-6">
              {panels.map((p) => (
                <span key={p.id} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink/40" />
                  {p.label}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-ink-soft/50">
              Seamless Geometric Mask
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
