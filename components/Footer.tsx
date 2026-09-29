import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/basePath";

const INDEX_LINKS = [
  { href: "#hero", label: "01 / Overview" },
  { href: "#about", label: "02 / About the society" },
  { href: "#pillars", label: "03 / Why AI Society" },
  { href: "#works", label: "04 / Selected works" },
  { href: "#resources", label: "05 / Resource center" },
  { href: "#roadmap", label: "06 / How we build" },
];

const CHANNELS = [
  { href: "https://github.com/bennettai", label: "GitHub" },
  { href: "https://www.instagram.com/ais_bennett/", label: "Instagram" },
  {
    href: "https://www.linkedin.com/company/bennett-artificial-intelligence-society/",
    label: "LinkedIn",
  },
  { href: "https://www.bennett.edu.in", label: "Bennett University" },
];

/* Strip of life-at-AIS photographs that loops forever. */
const MARQUEE_IMAGES = [
  assetPath("/images/hero1.jpg"),
  assetPath("/images/clubbattle.webp"),
  assetPath("/images/event-ai-101.webp"),
  assetPath("/images/hero3.webp"),
  assetPath("/images/event-workshop.webp"),
  assetPath("/images/hero2.jpg"),
  assetPath("/images/event-tech-arena.webp"),
  assetPath("/images/event-project-showcase.webp"),
];

function MarqueeHalf() {
  return (
    <div className="flex shrink-0 gap-3 pr-3">
      {MARQUEE_IMAGES.map((src, idx) => (
        <div
          key={src}
          className="relative h-20 w-32 shrink-0 rounded-2xl overflow-hidden md:h-28 md:w-44 bg-panel"
        >
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 768px) 176px, 128px"
            className="object-cover"
            loading={idx < 3 ? "eager" : "lazy"}
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}

/* Staircase trio — shapes.gallery 12, 13, 14.
   Ordered for the corner layout: 14 (top), 13 (mid), 12 (bottom-left orange). */
const STAIR_SHAPES = [
  {
    // Shape 14 — slashes (top of stack)
    d: "M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z",
    color: "#1A1816",
  },
  {
    // Shape 13 — circle & bar (middle)
    d: "M 92 72 C 142.81 72 184 113.19 184 164 C 184 214.81 142.81 256 92 256 C 41.19 256 0 214.81 0 164 C 0 113.19 41.19 72 92 72 Z M 256 0 L 256 256 L 184 256 L 184 72 L 0 72 L 0 0 Z",
    color: "#1A1816",
  },
  {
    // Shape 12 — bolt, orange accent (bottom)
    d: "M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z",
    color: "#DE5D35",
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-dark p-2 sm:p-3">
      {/* Cream panel — wordmark, index, channels, visit block */}
      <div
        className="relative rounded-[24px] p-5 text-ink sm:p-8 lg:p-10 overflow-hidden"
        style={{ backgroundColor: '#EFECE6' }}
      >

        {/* Shape 14 — slashes: top-right (no overlap with shape 13) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 256 256"
          className="pointer-events-none absolute hidden sm:block"
          style={{ bottom: 100, right: 0, width: 100, height: 100, color: STAIR_SHAPES[0].color, opacity: 1 }}
        >
          <path d={STAIR_SHAPES[0].d} fill="currentColor" />
        </svg>
        {/* Shape 13 — circle & bar: bottom-right */}
        <svg
          aria-hidden="true"
          viewBox="0 0 256 256"
          className="pointer-events-none absolute hidden sm:block"
          style={{ bottom: 0, right: 0, width: 100, height: 100, color: STAIR_SHAPES[1].color, opacity: 1 }}
        >
          <path d={STAIR_SHAPES[1].d} fill="currentColor" />
        </svg>
        {/* Shape 12 — bolt, orange: bottom, to the left of shape 13 */}
        <svg
          aria-hidden="true"
          viewBox="0 0 256 256"
          className="pointer-events-none absolute hidden sm:block"
          style={{ bottom: 0, right: 100, width: 100, height: 100, color: STAIR_SHAPES[2].color, opacity: 1 }}
        >
          <path d={STAIR_SHAPES[2].d} fill="currentColor" />
        </svg>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Big lockup */}
          <div className="flex flex-col justify-between gap-8 md:col-span-6">
            <div>
              <span
                aria-hidden
                className="block h-12 w-[190px] bg-left bg-contain bg-no-repeat brightness-0"
                style={{ backgroundImage: `url('${assetPath("/images/ais-logo.png")}')` }}
              />
              <h2 className="mt-6 font-display text-[clamp(44px,6.5vw,92px)] font-extrabold leading-[0.95] tracking-[-0.04em]">
                AI Society
                <span className="text-accent">.</span>
              </h2>
              <p className="mt-5 max-w-[36ch] text-[14px] leading-[1.6] text-ink-soft">
                Bennett University&apos;s artificial intelligence society,
                training minds, one epoch at a time.
              </p>
            </div>

            {/* Visit block */}
            <div>
              <span className="inline-block rounded-md bg-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                Visit us
              </span>
              <div className="mt-4 space-y-0.5 text-[14px] font-medium leading-[1.5]">
                <div>Bennett University</div>
                <div>TechZone II, Greater Noida, UP</div>
              </div>
              <a
                href="mailto:ais@bennett.edu.in"
                className="mt-4 inline-block text-[14px] font-medium text-ink-soft underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                ais@bennett.edu.in
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-6">
            {/* Index — hidden on mobile to save space */}
            <div className="hidden md:block">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-ink-soft">
                Index
              </h3>
              <ul className="mt-5 space-y-3 text-[14px]">
                {INDEX_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${link.href}`}
                      className="text-ink-soft transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Channels — always visible */}
            <div>
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-ink-soft">
                Channels
              </h3>
              <ul className="mt-5 space-y-3 text-[14px]">
                {CHANNELS.map((channel) => (
                  <li key={channel.href}>
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between text-ink-soft transition-colors hover:text-accent"
                    >
                      <span>{channel.label}</span>
                      <span
                        aria-hidden
                        className="text-ink/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                      >
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Mobile-only: shapes in a flat straight horizontal row */}
              <div aria-hidden="true" className="mt-5 flex items-center gap-2 sm:hidden">
                {STAIR_SHAPES.map((shape, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 256 256"
                    className="h-7 w-7 shrink-0"
                    style={{ color: shape.color, opacity: 0.75 - i * 0.1 }}
                  >
                    <path d={shape.d} fill="currentColor" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Looping photo strip on the accent frame */}
      <div className="mt-2 flex items-stretch gap-2">
        <a
          href="https://www.instagram.com/ais_bennett/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden w-[140px] shrink-0 flex-col items-start justify-center rounded-2xl bg-ground px-4 py-3 sm:flex"
        >
          <span className="font-mono text-[10px] font-bold uppercase leading-[1.6] tracking-[0.14em] text-ink">
            Follow us
            <br />
            on the &apos;gram
          </span>
          <span
            aria-hidden
            className="mt-2 font-display text-[20px] font-bold text-accent"
          >
            ↗
          </span>
        </a>

        <div className="relative flex-1 overflow-hidden rounded-2xl">
          <div className="footer-marquee flex w-max">
            <MarqueeHalf />
            <MarqueeHalf />
          </div>
        </div>
      </div>

      {/* Bottom bar — now dark/black with infinite scrolling ticker text */}
      <div className="mt-2 overflow-hidden rounded-[24px] bg-dark py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">
        <div className="footer-text-ticker flex w-max whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-0 px-0">
              <span className="px-5">© {new Date().getFullYear()} AI Society · Bennett University</span>
              <span aria-hidden className="opacity-40">.</span>
              <span className="px-5">Greater Noida · India</span>
              <span aria-hidden className="opacity-40">.</span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
