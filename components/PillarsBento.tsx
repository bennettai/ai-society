"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { featurePillars } from "@/lib/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Shape 46 from shapes.gallery (256x256): scalloped square with four corner
 * circles. Rendered as a square SVG (never stretched) — pillar titles curve
 * along the four scallop curves via textPath, numerals sit in the circles.
 */
const SHAPE_46 =
  "M 192 0 C 227.346 0 256 28.654 256 64 C 256 99.346 227.346 128 192 128 C 227.346 128 256 156.654 256 192 C 256 227.346 227.346 256 192 256 C 156.654 256 128 227.346 128 192 C 128 227.346 99.346 256 64 256 C 28.654 256 0 227.346 0 192 C 0 156.654 28.654 128 64 128 C 28.654 128 0 99.346 0 64 C 0 28.654 28.654 0 64 0 C 99.346 0 128 28.654 128 64 C 128 28.654 156.654 0 192 0 Z M 64 160 C 46.327 160 32 174.327 32 192 C 32 209.673 46.327 224 64 224 C 81.673 224 96 209.673 96 192 C 96 174.327 81.673 160 64 160 Z M 192 160 C 174.327 160 160 174.327 160 192 C 160 209.673 174.327 224 192 224 C 209.673 224 224 209.673 224 192 C 224 174.327 209.673 160 192 160 Z M 64 32 C 46.327 32 32 46.327 32 64 C 32 81.673 46.327 96 64 96 C 81.673 96 96 81.673 96 64 C 96 46.327 81.673 32 64 32 Z M 192 32 C 174.327 32 160 46.327 160 64 C 160 81.673 174.327 96 192 96 C 209.673 96 224 81.673 224 64 C 224 46.327 209.673 32 192 32 Z";

/* Corner circles for the numerals: TL, TR, BR, BL (clockwise). */
const NUMERAL_SPOTS = [
  { x: 64, y: 64 },
  { x: 192, y: 64 },
  { x: 192, y: 192 },
  { x: 64, y: 192 },
];

/* Full-circle guide paths (r=44) around each ring — the duplicated title
   is stretched to exactly one circumference (textLength) so the loop closes
   without overflowing the path or leaving a gap, whatever the title length. */
const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_ARCS = NUMERAL_SPOTS.map(
  ({ x, y }) =>
    `M ${x} ${y - RING_RADIUS} A ${RING_RADIUS} ${RING_RADIUS} 0 1 1 ${x} ${y + RING_RADIUS} A ${RING_RADIUS} ${RING_RADIUS} 0 1 1 ${x} ${y - RING_RADIUS}`,
);

export default function PillarsBento() {
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
            gsap.set([".pillar-statement", ".pillar-tile"], {
              opacity: 1,
              y: 0,
              scale: 1,
            });
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          tl.fromTo(
            ".pillar-statement",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9 },
          ).fromTo(
            ".pillar-tile",
            { scale: 0.94, opacity: 0, y: 25 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.08,
            },
            "-=0.6",
          );

          // Titles orbit their rings forever — slow, alternating direction
          gsap.utils
            .toArray<SVGTextElement>(".pillar-ring-text")
            .forEach((el, i) => {
              const spot = NUMERAL_SPOTS[i % NUMERAL_SPOTS.length];
              gsap.to(el, {
                rotation: i % 2 === 0 ? 360 : -360,
                svgOrigin: `${spot.x} ${spot.y}`,
                duration: 28,
                repeat: -1,
                ease: "none",
              });
            });
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="pillars"
      className="py-6 md:py-10 overflow-hidden"
    >
      <div className="shell">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Statement panel — floats over low-opacity shape watermarks */}
          <div className="pillar-statement relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-[32px] bg-panel p-9 sm:p-12 lg:col-span-5 lg:min-h-[520px]">
            {/* Shape watermarks (shapes.gallery paths, very low opacity) */}
            <svg
              viewBox="0 0 256 256"
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64"
              style={{ color: "#1A1816", opacity: 0.05 }}
            >
              <path
                d="M 156 0 C 211.228 0 256 44.772 256 100 L 256 256 L 100 256 C 44.772 256 0 211.228 0 156 L 0 0 Z M 80 80 C 80 133.019 122.981 176 176 176 C 176 122.981 133.019 80 80 80 Z"
                fill="currentColor"
              />
            </svg>
            <svg
              viewBox="0 0 256 256"
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72"
              style={{ color: "#DE5D35", opacity: 0.07 }}
            >
              <path
                d="M 128 192 C 92.654 192 64 220.654 64 256 L 0 256 C 0 185.308 57.308 128 128 128 Z M 256 128 C 256 198.692 198.692 256 128 256 L 128 192 C 163.346 192 192 163.346 192 128 Z M 128 64 C 92.654 64 64 92.654 64 128 L 0 128 C 0 57.308 57.308 0 128 0 Z M 256 0 C 256 70.692 198.692 128 128 128 L 128 64 C 163.346 64 192 35.346 192 0 Z"
                fill="currentColor"
              />
            </svg>
            {/* Extra depth shape — centre right */}
            <svg
              viewBox="0 0 256 256"
              aria-hidden="true"
              className="pointer-events-none absolute right-10 top-1/2 h-24 w-24"
              style={{ color: "#1A1816", opacity: 0.04 }}
            >
              <path
                d="M 206 0 C 233.614 0 256 22.386 256 50 L 256 206 C 256 233.614 233.614 256 206 256 L 50 256 C 22.386 256 0 233.614 0 206 L 0 50 C 0 22.386 22.386 0 50 0 Z M 128 64 C 128 99.346 99.346 128 64 128 C 99.346 128 128 156.654 128 192 C 128 156.654 156.654 128 192 128 C 156.654 128 128 99.346 128 64 Z"
                fill="currentColor"
              />
            </svg>
            {/* Shape 12 — bolt watermark top-left corner */}
            <svg
              viewBox="0 0 256 256"
              aria-hidden="true"
              className="pointer-events-none absolute left-6 top-1/3 h-16 w-16"
              style={{ color: "#DE5D35", opacity: 0.06 }}
            >
              <path
                d="M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z"
                fill="currentColor"
              />
            </svg>
            {/* Shape 14 — slashes watermark bottom-right */}
            <svg
              viewBox="0 0 256 256"
              aria-hidden="true"
              className="pointer-events-none absolute bottom-8 right-8 h-20 w-20"
              style={{ color: "#1A1816", opacity: 0.05 }}
            >
              <path
                d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z"
                fill="currentColor"
              />
            </svg>

            <div className="relative">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
                Pillars
              </span>
              <h2 className="mt-6 font-display text-[clamp(30px,3.4vw,44px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink">
                Why
                <br />
                AI Society
              </h2>
            </div>

            <div className="relative flex items-end justify-between gap-8">
              <p className="max-w-[26ch] text-[13px] leading-[1.55] text-ink-soft">
                Four commitments that turn curious students into engineers who
                ship.
              </p>
              <span
                aria-hidden
                className="font-display text-[26px] leading-none text-ink"
              >
                →
              </span>
            </div>
          </div>

          {/* Ink card cut as Shape 46 — titles curved around the four
              black rings, numerals inside the corner circles */}
          <div className="flex items-center justify-center lg:col-span-7">
            <svg
              viewBox="0 0 256 256"
              className="pillar-tile block aspect-square h-auto w-full max-w-[560px] will-change-transform"
              role="img"
              aria-label="The four AIS pillars: Research Excellence, Engineering Hub, Skill Incubation, Industry Trajectory"
            >
              <defs>
                {RING_ARCS.map((d, i) => (
                  <path key={d} id={`pillar-arc-${i}`} d={d} />
                ))}
              </defs>

              <path d={SHAPE_46} fill="#1A1816" />

              {/* Titles duplicated around each ring for a seamless loop */}
              {featurePillars.map((pillar, i) => (
                <text
                  key={pillar.numeral}
                  className="pillar-ring-text font-display font-bold"
                  fontSize="7"
                  fill="#EFECE6"
                >
                  <textPath
                    href={`#pillar-arc-${i}`}
                    startOffset="0"
                    textLength={RING_CIRCUMFERENCE}
                    lengthAdjust="spacing"
                  >
                    {`${pillar.title} · ${pillar.title} ·\u00A0`}
                  </textPath>
                </text>
              ))}

              {/* Orange dot where the four rings meet */}
              <circle cx="128" cy="128" r="9" fill="#DE5D35" />

              {/* Numerals in the corner circles */}
              {featurePillars.map((pillar, i) => {
                const spot = NUMERAL_SPOTS[i];
                return (
                  <text
                    key={pillar.numeral}
                    x={spot.x}
                    y={spot.y}
                    className="font-display font-bold"
                    fontSize="15"
                    fill="#DE5D35"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {pillar.numeral}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
