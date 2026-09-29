"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { assetPath } from "@/lib/basePath";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * The gallery is deliberately captionless — the brief calls for photographs
 * with no overlay, badge, or label. Alt text carries the meaning instead.
 */
const COLUMN_ONE = {
  src: assetPath("/images/event-club-carnival.webp"),
  alt: "Members gathered at the Club Carnival induction festival",
};

const COLUMN_TWO = [
  {
    src: assetPath("/images/event-ai-101.webp"),
    alt: "Attendees working through the AI 101 foundations workshop",
  },
  {
    src: assetPath("/images/event-ai-hunt.webp"),
    alt: "Teams competing in the AI Hunt 2.0 algorithmic challenge",
  },
];

const COLUMN_THREE = [
  {
    src: assetPath("/images/event-tech-arena.webp"),
    alt: "The TechArena 2025 symposium hall in session",
  },
  {
    src: assetPath("/images/event-project-showcase.webp"),
    alt: "Student projects on display at the Project Showcase expo",
  },
];

export default function EventsGallery() {
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
            gsap.set([".gallery-item", ".gallery-photo"], {
              opacity: 1,
              y: 0,
              scale: 1,
            });
            return;
          }

          // Staggered tile entrance
          gsap.fromTo(
            ".gallery-item",
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.0,
              stagger: 0.14,
              ease: "power3.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
                toggleActions: "play none none none",
              },
            },
          );

          // Subtle photo settling effect inside frames
          gsap.fromTo(
            ".gallery-photo",
            { scale: 1.1 },
            {
              scale: 1,
              duration: 1.2,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
                toggleActions: "play none none none",
              },
            },
          );
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="works"
      className="py-16 md:py-24 overflow-hidden"
    >
      <div className="shell">
        {/* Bento grid — 2 cols on mobile, 3 cols on desktop with varied spans */}
        <div className="grid grid-cols-2 auto-rows-[150px] sm:auto-rows-[170px] gap-4 md:grid-cols-3 md:auto-rows-[172px] md:gap-5">
          {/* Title plate */}
          <div className="gallery-item relative col-span-2 flex items-center justify-between rounded-[32px] bg-dark p-6 text-white md:col-span-1 md:col-start-1 md:row-start-1 md:p-7">
            <h2 className="font-display text-[24px] font-extrabold leading-[1.1] tracking-[-0.03em]">
              Selected
              <br />
              Works
            </h2>

            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full border border-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </span>
          </div>

          {/* Tall portrait — club carnival */}
          <div className="gallery-item frame relative row-span-2 overflow-hidden rounded-[32px] md:col-start-1 md:row-start-2">
            <Image
              src={COLUMN_ONE.src}
              alt={COLUMN_ONE.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="gallery-photo object-cover will-change-transform"
            />
          </div>

          {/* AI 101 — tall on desktop */}
          <div className="gallery-item frame relative overflow-hidden rounded-[32px] md:row-span-2 md:col-start-2 md:row-start-1">
            <Image
              src={COLUMN_TWO[0].src}
              alt={COLUMN_TWO[0].alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="gallery-photo object-cover will-change-transform"
            />
          </div>

          {/* AI Hunt */}
          <div className="gallery-item frame relative overflow-hidden rounded-[32px] md:col-start-2 md:row-start-3">
            <Image
              src={COLUMN_TWO[1].src}
              alt={COLUMN_TWO[1].alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="gallery-photo object-cover will-change-transform"
            />
          </div>

          {/* Tech Arena */}
          <div className="gallery-item frame relative overflow-hidden rounded-[32px] md:col-start-3 md:row-start-1">
            <Image
              src={COLUMN_THREE[0].src}
              alt={COLUMN_THREE[0].alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="gallery-photo object-cover will-change-transform"
            />
          </div>

          {/* Project Showcase — tall on desktop */}
          <div className="gallery-item frame relative overflow-hidden rounded-[32px] md:row-span-2 md:col-start-3 md:row-start-2">
            <Image
              src={COLUMN_THREE[1].src}
              alt={COLUMN_THREE[1].alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="gallery-photo object-cover will-change-transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
