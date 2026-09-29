"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { assetPath } from "@/lib/basePath";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ResourceTeaser() {
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
            gsap.set([".resource-card", ".resource-item"], {
              opacity: 1,
              y: 0,
              scale: 1,
            });
            return;
          }

          // Card reveal animation
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          tl.fromTo(
            ".resource-card",
            { scale: 0.96, opacity: 0, y: 35 },
            { scale: 1, opacity: 1, y: 0, duration: 0.95 },
          ).fromTo(
            ".resource-item",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, stagger: 0.09 },
            "-=0.55",
          );

          // Subtle gradient parallax scrub
          gsap.to(".resource-bg-img", {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="resources"
      className="py-12 md:py-16 overflow-hidden"
    >
      <div className="shell">
        {/* Simple CTA Card with Atmospheric Gradient & Film Grain */}
        <div className="resource-card relative overflow-hidden rounded-[32px] bg-[#14171C] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
          {/* Background: User-provided gradient image */}
          <div className="absolute -inset-y-8 inset-x-0 overflow-hidden pointer-events-none select-none">
            <Image
              src={assetPath("/gradient/1.webp")}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="resource-bg-img absolute inset-0 w-full h-full object-cover will-change-transform"
              priority
            />
          </div>

          {/* Subtle gradient vignette to guarantee crisp legibility on all viewports */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-black/10 pointer-events-none"
          />

          {/* Simple, Elegant Foreground Content */}
          <div className="relative z-10 flex flex-col justify-between gap-8 p-8 sm:p-12 lg:p-14 lg:flex-row lg:items-center">
            <div className="max-w-[50ch]">
              {/* Eyebrow */}
              <span className="resource-item block text-[11px] font-mono font-medium uppercase tracking-[0.2em] text-white/50">
                Bennett University · Open archive
              </span>

              {/* Title */}
              <h2 className="resource-item mt-4 font-display text-[clamp(26px,3.2vw,40px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-white">
                AIS Learning Resource Center
              </h2>

              {/* Description */}
              <p className="resource-item mt-4 text-[14px] sm:text-[15px] leading-[1.65] text-white/65">
                An interactive lab of real-time visualisers and PyTorch
                implementations for scaled dot-product attention, 2D
                convolutions, gradient descent, diffusion schedulers, and
                softmax temperature.
              </p>
            </div>

            {/* Simple, Crisp CTA */}
            <Link
              href="/resources"
              className="resource-item inline-flex shrink-0 items-center gap-3.5 self-start rounded-full bg-white py-2.5 pr-2.5 pl-6 text-[13px] font-semibold text-[#121519] transition-all duration-300 hover:bg-[#E4E2DC] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-[0.98] lg:self-auto"
            >
              <span>Open the lab</span>
              <span
                aria-hidden="true"
                className="grid h-8 w-8 place-items-center rounded-full bg-[#121519]/10 text-[#121519]"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
