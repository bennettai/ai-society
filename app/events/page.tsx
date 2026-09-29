"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { assetPath } from "@/lib/basePath";

interface ExtendedEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  year: string;
  category: "FLAGSHIP" | "WORKSHOPS" | "HACKATHONS" | "DEMO DAYS";
  image: string;
  shortDesc: string;
  fullDesc: string;
  location: string;
  status: "REGISTRATIONS OPEN" | "UPCOMING" | "ARCHIVED";
  attendees: string;
  highlights: string[];
}

const ALL_EVENTS: ExtendedEvent[] = [
  {
    id: "01",
    slug: "tech-arena-2025",
    title: "TechArena 2025",
    date: "FEBRUARY 2025",
    year: "2025",
    category: "FLAGSHIP",
    image: assetPath("/images/event-tech-arena.webp"),
    shortDesc:
      "The premier national collegiate tech symposium featuring multi-track hackathons, keynote research panels, and rapid AI prototyping leagues.",
    fullDesc:
      "Bringing together 1,200+ collegiate innovators and industry practitioners across India for 48 hours of competitive hacking, technical workshops, and direct VC pitches.",
    location: "Main Auditorium & Computing Centers, Bennett University",
    status: "REGISTRATIONS OPEN",
    attendees: "1,200+ Participants",
    highlights: [
      "₹2,50,000 Prize Pool",
      "Keynote from Leading AI Scientists",
      "Live Hardware & GPU Testbed Access",
    ],
  },
  {
    id: "02",
    slug: "ai-hunt-2",
    title: "AI Hunt 2.0",
    date: "SEPTEMBER 2024",
    year: "2024",
    category: "HACKATHONS",
    image: assetPath("/images/event-ai-hunt.webp"),
    shortDesc:
      "A high-octane 48-hour cryptic technical scavenger hunt deciphering adversarial perturbations, neural steganography, and algorithmic logic gates.",
    fullDesc:
      "Participants unraveled multi-tiered cryptographic layers embedded inside latent diffusion models, audio frequency spectrograms, and binary reverse engineering puzzles.",
    location: "Campus-Wide & Digital Challenge Portal",
    status: "ARCHIVED",
    attendees: "450+ Competitors",
    highlights: [
      "32 Custom Cryptic Levels",
      "Dynamic Leaderboard with Zero-Day Bounties",
      "Top 3 Teams Awarded Society Fellowships",
    ],
  },
  {
    id: "03",
    slug: "xr-genai-workshop",
    title: "XR & GenAI Masterclass",
    date: "APRIL 2025",
    year: "2025",
    category: "WORKSHOPS",
    image: assetPath("/images/event-workshop.webp"),
    shortDesc:
      "Advanced technical deep-dive bridging Spatial Computing, 3D Gaussian Splatting, and real-time multi-modal diffusion pipelines.",
    fullDesc:
      "Hands-on architectural lab exploring neural radiance fields (NeRFs), Gaussian splat rasterization, and generative 3D asset generation directly on CUDA-accelerated workstations.",
    location: "Advanced AI Lab (Lab 402)",
    status: "UPCOMING",
    attendees: "120 Seats (Curated Selection)",
    highlights: [
      "Live 3D Splatting Capture on Campus",
      "Custom WebGL Shaders & Three.js Demos",
      "Compute Credits Provided for Every Team",
    ],
  },
  {
    id: "04",
    slug: "project-showcase",
    title: "Project Showcase 2025",
    date: "MARCH 2025",
    year: "2025",
    category: "DEMO DAYS",
    image: assetPath("/images/event-project-showcase.webp"),
    shortDesc:
      "Public exposition of ten member-engineered production models, vision-language systems, and autonomous agentic workflows.",
    fullDesc:
      "The culmination of semester-long research tracks. Member teams demo live prototypes, open-source repositories, and empirical benchmarks in front of faculty and tech founders.",
    location: "Engineering Atrium",
    status: "UPCOMING",
    attendees: "Open Campus Attendance",
    highlights: [
      "10 Production Model Deployments",
      "Live Interactive Demo Terminals",
      "Faculty & Industry Evaluation Panel",
    ],
  },
  {
    id: "05",
    slug: "ai-101",
    title: "AI 101: First Principles",
    date: "AUGUST 2024",
    year: "2024",
    category: "WORKSHOPS",
    image: assetPath("/images/event-ai-101.webp"),
    shortDesc:
      "Comprehensive introductory bootcamp decoding gradient descent, loss landscapes, and practical PyTorch implementation from scratch.",
    fullDesc:
      "Demystifying mathematical backpropagation with zero abstraction. Students derived matrix gradients on paper before coding linear layers and convolutional blocks in Python.",
    location: "T-Block Seminar Hall",
    status: "ARCHIVED",
    attendees: "380 Freshers & Sophomores",
    highlights: [
      "No High-Level Library Abstractions",
      "Jupyter Notebooks Published to GitHub",
      "1-on-1 Mentorship from Senior Leads",
    ],
  },
  {
    id: "06",
    slug: "club-carnival",
    title: "Club Carnival & Tech Induction",
    date: "JULY 2024",
    year: "2024",
    category: "FLAGSHIP",
    image: assetPath("/images/event-club-carnival.webp"),
    shortDesc:
      "Annual club induction festival welcoming freshers to the frontier of AI research, interactive model demos, and tech roadmaps.",
    fullDesc:
      "Over 1,500 incoming students engaged with live computer vision booths, interactive robotics displays, and generative art installations at the AI Society pavilion.",
    location: "Sports Complex Pavilion",
    status: "ARCHIVED",
    attendees: "1,500+ Visitors",
    highlights: [
      "Live Face-Tracking & Style Transfer Demos",
      "AI Society Zine & Sticker Distribution",
      "Over 400 Cohort Applications Received",
    ],
  },
];

const CATEGORIES = [
  "ALL",
  "FLAGSHIP",
  "WORKSHOPS",
  "HACKATHONS",
  "DEMO DAYS",
] as const;

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeModalEvent, setActiveModalEvent] =
    useState<ExtendedEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return ALL_EVENTS.filter((ev) => {
      if (selectedCategory === "ALL") return true;
      return ev.category === selectedCategory;
    });
  }, [selectedCategory]);

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen">
        <div className="shell relative">
          {/* Watermark */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-4 text-[clamp(120px,20vw,240px)] font-extralight text-black/[0.04] leading-none select-none pointer-events-none tracking-tighter"
          >
            02
          </div>

          {/* Header */}
          <header className="relative z-10 max-w-[68ch] mb-12 sm:mb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono font-medium tracking-[0.18em] uppercase text-[#75716B]">
                02 / GATHERINGS · AI SOCIETY CALENDAR
              </span>
            </div>

            <h1 className="text-[40px] sm:text-[64px] font-black tracking-[-0.035em] leading-[0.98] uppercase text-[#1A1816] mb-5 font-display">
              Where Hypotheses Meet Reality.
            </h1>

            <p className="text-[16px] text-[#75716B] leading-[1.65]">
              Flagship symposiums, competitive 48-hour neural challenges, and
              hands-on masterclasses. We create environments where theory
              transforms into production-ready software.
            </p>
          </header>

          {/* Filter Bar */}
          <div className="border-t border-b border-[#1A1816]/15 py-4 mb-12 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-mono tracking-wider uppercase">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1.5 transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? "text-[#1A1816] font-bold"
                        : "text-[#75716B] hover:text-[#1A1816]"
                    }`}
                  >
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-[#DE5D35]" />
                    )}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            <span className="font-mono text-[11px] text-[#75716B]">
              SHOWING {filteredEvents.length} OF {ALL_EVENTS.length} EVENTS
            </span>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group flex flex-col justify-between border border-[#1A1816]/15 bg-[#FAF9F5] rounded-[24px] overflow-hidden transition-all duration-300 hover:border-[#1A1816] hover:shadow-lg"
              >
                <div>
                  {/* Event Banner Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-[#1A1816]/5 border-b border-[#1A1816]/10">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Status Pill Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md ${
                          event.status === "REGISTRATIONS OPEN"
                            ? "bg-[#DE5D35] text-white shadow-xs"
                            : event.status === "UPCOMING"
                              ? "bg-black/75 text-amber-300"
                              : "bg-black/60 text-white/80"
                        }`}
                      >
                        {event.status === "REGISTRATIONS OPEN" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                        <span>{event.status}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white font-mono text-[10px] tracking-wider uppercase">
                      {event.category}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] mb-2">
                      <span>{event.date}</span>
                      <span>{event.location.split(",")[0]}</span>
                    </div>

                    <h2 className="font-display text-[22px] font-extrabold text-[#1A1816] tracking-[-0.02em] leading-tight mb-3 group-hover:text-[#DE5D35] transition-colors">
                      {event.title}
                    </h2>

                    <p className="text-[13px] leading-[1.65] text-[#75716B] mb-5">
                      {event.shortDesc}
                    </p>

                    {/* Highlights bullet list */}
                    <div className="space-y-1.5 pt-4 border-t border-[#1A1816]/10">
                      {event.highlights.map((h) => (
                        <div
                          key={h}
                          className="flex items-center gap-2 text-[11px] font-mono text-[#1A1816]/80"
                        >
                          <span className="w-1 h-1 rounded-full bg-[#DE5D35]" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => setActiveModalEvent(event)}
                    className="w-full py-3 px-4 rounded-xl border border-[#1A1816]/20 bg-transparent text-[#1A1816] hover:bg-[#1A1816] hover:text-white font-mono text-[11px] uppercase tracking-wider font-bold transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>View Event Brief</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Event Detail Modal */}
          {activeModalEvent && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            >
              <div className="relative w-full max-w-2xl bg-[#FAF9F5] border border-[#1A1816] rounded-[28px] overflow-hidden shadow-2xl">
                {/* Modal Header Image */}
                <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-black">
                  <Image
                    src={activeModalEvent.image}
                    alt={activeModalEvent.title}
                    fill
                    sizes="700px"
                    className="object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816] to-transparent opacity-80" />

                  <button
                    type="button"
                    onClick={() => setActiveModalEvent(null)}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-[#1A1816] hover:bg-white flex items-center justify-center font-bold text-[14px] cursor-pointer shadow-md transition-transform hover:scale-105"
                  >
                    ✕
                  </button>

                  <div className="absolute bottom-5 left-6 right-6 text-white">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold block mb-1">
                      {activeModalEvent.category} · {activeModalEvent.date}
                    </span>
                    <h2
                      id="modal-title"
                      className="font-display text-[26px] sm:text-[32px] font-black tracking-tight leading-tight"
                    >
                      {activeModalEvent.title}
                    </h2>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-4 text-[12px] font-mono text-[#75716B] mb-6 pb-4 border-b border-[#1A1816]/10">
                    <div>
                      <span className="block text-[10px] uppercase text-[#1A1816]/50">
                        VENUE
                      </span>
                      <span className="font-semibold text-[#1A1816]">
                        {activeModalEvent.location}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#1A1816]/50">
                        AUDIENCE
                      </span>
                      <span className="font-semibold text-[#1A1816]">
                        {activeModalEvent.attendees}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#1A1816]/50">
                        STATUS
                      </span>
                      <span className="font-semibold text-[#DE5D35]">
                        {activeModalEvent.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-[14px] leading-relaxed text-[#1A1816] mb-6">
                    {activeModalEvent.fullDesc}
                  </p>

                  <div className="mb-8">
                    <h3 className="text-[12px] font-mono uppercase tracking-wider font-bold text-[#1A1816] mb-3">
                      Event Takeaways & Features:
                    </h3>
                    <ul className="space-y-2 text-[13px] text-[#75716B]">
                      {activeModalEvent.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A1816]/10">
                    <button
                      type="button"
                      onClick={() => setActiveModalEvent(null)}
                      className="px-5 py-2.5 rounded-full border border-[#1A1816]/20 font-mono text-[12px] font-bold uppercase tracking-wider text-[#1A1816] hover:bg-[#1A1816]/5 cursor-pointer"
                    >
                      Close
                    </button>
                    {activeModalEvent.status === "REGISTRATIONS OPEN" && (
                      <a
                        href="mailto:ais@bennett.edu.in?subject=Registration%20Interest%20for%20Event"
                        className="pill bg-[#1A1816] text-white"
                      >
                        <span>Register Now</span>
                        <span className="pill__medal bg-white/20" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Propose a Talk Section */}
          <div className="mt-20 p-8 sm:p-12 bg-[#1A1816] text-[#FAF9F5] rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white/10 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#DE5D35]/20 blur-3xl pointer-events-none"
            />

            <div className="relative z-10 max-w-[50ch]">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#DE5D35] animate-ping" />
                <span className="text-[10px] font-mono tracking-widest text-[#DE5D35] uppercase font-bold">
                  SPEAKERS & PARTNERS
                </span>
              </div>
              <h2 className="text-[28px] sm:text-[36px] font-extrabold font-display tracking-tight text-[#FAF9F5] leading-tight mb-3">
                Host a Workshop or Present Research.
              </h2>
              <p className="text-[14px] text-white/70 leading-relaxed">
                Are you an AI researcher, engineer, or founder? We host tech
                talks, paper readings, and developer masterclasses throughout
                the academic year.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <a
                href="mailto:ais@bennett.edu.in?subject=Proposal%20for%20AIS%20Technical%20Talk"
                className="pill bg-[#FAF9F5] text-[#1A1816] hover:bg-white transition-all shadow-md"
              >
                <span>Propose a Keynote / Talk</span>
                <span className="pill__medal bg-[#1A1816]/10" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
