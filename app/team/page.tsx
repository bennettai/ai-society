"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { assetPath } from "@/lib/basePath";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TeamPage() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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
                ".team-top-hairline",
                ".team-hero-left",
                ".team-hero-title",
                ".team-hero-edition",
                ".team-card-slot",
                ".team-statement-title",
                ".team-statement-body",
                ".team-circuit-section",
              ],
              { opacity: 1, y: 0, scale: 1, scaleX: 1 },
            );
            return;
          }

          // Entrance timeline for hero
          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
          });

          // Top hairline expansion
          tl.fromTo(
            ".team-top-hairline",
            { scaleX: 0, transformOrigin: "left" },
            { scaleX: 1, duration: 0.85 },
          )
            // Towering title masked slide-up
            .fromTo(
              ".team-hero-title",
              { yPercent: 110, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1.1, ease: "power4.out" },
              "-=0.5",
            )
            // Edition badge 26-27 pop
            .fromTo(
              ".team-hero-edition",
              { scale: 0.8, opacity: 0 },
              { scale: 1, opacity: 0.6, duration: 0.6, ease: "back.out(1.6)" },
              "-=0.65",
            )
            // Left column (switcher and manifesto)
            .fromTo(
              ".team-hero-left",
              { y: 28, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.85 },
              "-=0.6",
            );

          // Scroll-triggered batched entrance for team cards
          ScrollTrigger.batch(".team-card-slot", {
            interval: 0.1,
            batchMax: 3,
            onEnter: (batch) =>
              gsap.fromTo(
                batch,
                { y: 50, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.85,
                  stagger: 0.1,
                  ease: "power3.out",
                  overwrite: "auto",
                },
              ),
            start: "top 85%",
            once: true,
          });

          // Statement section reveal
          const statementTl = gsap.timeline({
            scrollTrigger: {
              trigger: ".team-statement-section",
              start: "top 75%",
              toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out" },
          });

          statementTl
            .fromTo(
              ".team-statement-title",
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.95 },
            )
            .fromTo(
              ".team-statement-body",
              { y: 25, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
              "-=0.55",
            );

          // Schematic Circuit & Newsletter section
          gsap.fromTo(
            ".team-circuit-section",
            { y: 35, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: ".team-circuit-section",
                start: "top 78%",
                toggleActions: "play none none none",
              },
            },
          );
        },
      );
    },
    { scope: containerRef },
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <FoldLayout>
      <main
        ref={containerRef}
        className="grow pt-24 sm:pt-28 md:pt-32 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen overflow-hidden"
      >
        <div className="shell">
          {/* Top Divider Hairline */}
          <div className="team-top-hairline w-full border-t border-[#1A1816]/20 mb-8 sm:mb-12 will-change-transform" />

          {/* Drive Capital Style Editorial Hero: Left manifesto vs Right towering title */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16 sm:mb-20">
            {/* Left Column: Status Badge & Manifesto Paragraph */}
            <div className="team-hero-left lg:col-span-5 flex flex-col justify-between h-full pt-2">
              <div className="mb-8">
                {/* Core Reveal Soon Pill */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#1A1816]/30 bg-transparent text-[11px] font-mono tracking-wider uppercase mb-8">
                  <span className="w-2 h-2 rounded-full bg-[#DE5D35] animate-pulse" />
                  <span>CORE REVEAL SOON</span>
                </div>

                {/* Subtitle / Narrative Copy */}
                <p className="text-[17px] sm:text-[19px] md:text-[21px] font-normal leading-[1.4] text-[#1A1816] max-w-[36ch]">
                  We&apos;re a cohort driven by conviction and first principles.
                  These are our people and their stories.
                </p>
              </div>

              {/* Auxiliary hairline divider */}
              <div className="w-full border-b border-[#1A1816]/15 pt-6 hidden lg:block" />
            </div>

            {/* Right Column: Giant Towering Condensed Title (OUR TEAM) */}
            <div className="lg:col-span-7 flex justify-start lg:justify-end overflow-hidden py-2">
              <div className="relative inline-block select-none">
                <div className="overflow-hidden">
                  <h1 className="team-hero-title font-black text-[clamp(72px,13.5vw,180px)] tracking-[-0.04em] uppercase text-[#1A1816] leading-[0.88] font-display will-change-transform">
                    OUR TEAM
                  </h1>
                </div>
                <span className="team-hero-edition absolute -top-1 right-0 font-mono text-[22px] sm:text-[32px] md:text-[38px] font-normal text-[#1A1816]/60 will-change-transform">
                  26–27
                </span>
              </div>
            </div>
          </section>

          {/* Core Reveal Soon Statement */}
          <section className="team-card-slot mb-28 sm:mb-36 border-t border-[#1A1816]/20 pt-16 sm:pt-20 will-change-transform">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#75716B] block mb-2">
                  STATUS • COHORT 26–27
                </span>
                <span className="font-mono text-[12px] uppercase tracking-wider text-[#DE5D35] font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#DE5D35] animate-pulse" />
                  SELECTION & CHAIR FINALS
                </span>
              </div>
              <div className="lg:col-span-8">
                <h2 className="font-display font-black text-[clamp(44px,7.5vw,96px)] tracking-[-0.035em] uppercase text-[#1A1816] leading-[0.92] mb-6">
                  CORE REVEAL SOON.
                </h2>
                <p className="font-mono text-[13px] sm:text-[14px] uppercase tracking-wider text-[#1A1816]/70 max-w-[50ch] leading-relaxed">
                  The executive council, technical leads, and research chairs
                  for the AI Society 2026–2027 tenure will be revealed here.
                </p>
              </div>
            </div>
          </section>

          {/* Drive Capital Large Statement Banner (Screenshot 3) */}
          <section className="team-statement-section border-t border-[#1A1816]/20 pt-16 sm:pt-20 mb-24 sm:mb-32">
            <h2 className="team-statement-title font-display font-extrabold text-[clamp(36px,6.8vw,88px)] tracking-[-0.035em] text-[#1A1816] uppercase leading-[0.94] mb-12 sm:mb-16">
              WE&apos;RE HEADING UP
              <br />
              AND TO THE RIGHT
            </h2>

            {/* Split Narrative & CTA Button */}
            <div className="team-statement-body relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-[#1A1816]/15 pt-8">
              <div className="md:col-span-3 flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[#1A1816]">
                <span className="w-2.5 h-2.5 border border-[#1A1816] flex items-center justify-center p-0.5">
                  <span className="w-1 h-1 bg-[#DE5D35]" />
                </span>
                <span>JOIN US</span>
              </div>

              <div className="md:col-span-9 max-w-[56ch]">
                <p className="text-[20px] sm:text-[24px] md:text-[28px] font-normal leading-[1.3] text-[#1A1816] mb-8">
                  At AIS, we want to work with people who love a challenge and
                  pride themselves on the performance of their work.
                </p>

                <a
                  href="mailto:ais@bennett.edu.in?subject=Application%20for%20AIS%20Cohort%2026-27"
                  className="inline-flex items-center gap-4 px-7 py-3 rounded-full border border-[#1A1816] bg-transparent text-[#1A1816] hover:bg-[#1A1816] hover:text-white font-mono text-[12px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer shadow-xs active:scale-98"
                >
                  <span>APPLY FOR MEMBERSHIP</span>
                  <span className="text-[14px]">↗</span>
                </a>
              </div>
            </div>
          </section>

          {/* Architectural Butterfly Graphic & Newsletter Box */}
          <section className="team-circuit-section relative overflow-visible pt-16 sm:pt-20">
            {/* Massive Butterfly spanning across middle of the two sections without increasing height */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-32 sm:-top-44 lg:-top-56 right-[-60px] sm:right-[-30px] lg:right-[-15px] xl:right-[-5px] w-[420px] sm:w-[560px] lg:w-[680px] xl:w-[760px] h-[320px] sm:h-[420px] lg:h-[500px] xl:h-[560px] -rotate-12 transform origin-center z-0"
            >
              <Image
                src={assetPath("/butterfly.svg")}
                alt=""
                fill
                className="object-contain object-right brightness-0 opacity-65"
                unoptimized
                priority
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16 relative z-10">
              {/* Left Headline */}
              <div className="lg:col-span-7">
                <h3 className="font-display font-extrabold text-[clamp(28px,4.5vw,56px)] tracking-[-0.03em] uppercase text-[#1A1816] leading-[1.02]">
                  THE GREATEST FRONTIER
                  <br />
                  FOR MACHINE INTELLIGENCE
                  <br />
                  IS FIRST PRINCIPLES.
                </h3>
              </div>

              {/* Spacer for layout */}
              <div className="lg:col-span-5" />
            </div>

            {/* Newsletter Input Strip (matching Drive Capital's subscription capsule) */}
            <div className="border-t border-[#1A1816]/15 pt-8 relative z-10">
              <span className="block font-mono text-[11px] uppercase tracking-widest text-[#75716B] mb-3">
                SUBSCRIBE TO OUR RESEARCH DISPATCHES
              </span>

              <form
                onSubmit={handleSubscribe}
                className="flex items-center gap-3 max-w-lg"
              >
                <div className="relative grow">
                  <input
                    type="email"
                    required
                    placeholder="YOUR@EMAIL.COM"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full h-12 px-6 rounded-full border border-[#1A1816]/40 bg-transparent font-mono text-[13px] uppercase text-[#1A1816] placeholder:text-[#75716B]/60 focus:outline-none focus:border-[#1A1816] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  aria-label="Submit subscription"
                  className="w-12 h-12 rounded-full border border-[#1A1816] bg-[#1A1816] text-[#FAF9F5] hover:bg-[#DE5D35] hover:border-[#DE5D35] flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs shrink-0"
                >
                  <span className="text-[16px]">→</span>
                </button>
              </form>

              {subscribed && (
                <p className="font-mono text-[11px] text-emerald-700 mt-3 animate-in fade-in duration-200">
                  ✓ You are on the priority dispatch list for the Core Reveal.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </FoldLayout>
  );
}
