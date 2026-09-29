import { assetPath } from "@/lib/basePath";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  image: string;
  shortDesc: string;
  location: string;
}

export interface StatItem {
  value: string;
  label: string;
  sublabel: string;
}

export interface FeaturePillar {
  numeral: string;
  title: string;
  description: string;
  tag: string;
}

export const eventsData: EventItem[] = [
  {
    id: "01",
    slug: "club-carnival",
    title: "Club Carnival",
    date: "JULY 2024",
    category: "Induction & Orientation",
    image: assetPath("/images/event-club-carnival.webp"),
    shortDesc:
      "Annual club induction festival welcoming freshers to the frontier of AI research, interactive model demos, and tech roadmaps.",
    location: "Main Audi, BU",
  },
  {
    id: "02",
    slug: "ai-101",
    title: "AI 101",
    date: "AUGUST 2024",
    category: "Foundations Workshop",
    image: assetPath("/images/event-ai-101.webp"),
    shortDesc:
      "Comprehensive introductory workshop decoding gradient descent, deep neural representations, and hands-on PyTorch development.",
    location: "T-Block Seminar Hall",
  },
  {
    id: "03",
    slug: "ai-hunt",
    title: "AI Hunt 2.0",
    date: "SEPTEMBER 2024",
    category: "Algorithmic Scavenger Hunt",
    image: assetPath("/images/event-ai-hunt.webp"),
    shortDesc:
      "High-octane 48-hour cryptic challenge deciphering adversarial perturbations, neural steganography, and logic gates.",
    location: "Campus-Wide",
  },
  {
    id: "04",
    slug: "tech-arena",
    title: "TechArena 2025",
    date: "FEBRUARY 2025",
    category: "Flagship Symposium",
    image: assetPath("/images/event-tech-arena.webp"),
    shortDesc:
      "The premier collegiate tech fest featuring national multi-track hackathons, research keynotes, and rapid prototyping leagues.",
    location: "Auditorium Complex",
  },
  {
    id: "05",
    slug: "project-showcase",
    title: "Project Showcase",
    date: "MARCH 2025",
    category: "Demo Day & Research Expo",
    image: assetPath("/images/event-project-showcase.webp"),
    shortDesc:
      "Public exposition of ten member-engineered production models, vision-language systems, and agentic workflows.",
    location: "Engineering Atrium",
  },
  {
    id: "06",
    slug: "xr-genai-workshop",
    title: "XR & GenAI Workshop",
    date: "APRIL 2025",
    category: "Specialized Masterclass",
    image: assetPath("/images/event-workshop.webp"),
    shortDesc:
      "Advanced technical deep-dive bridging Spatial Computing, 3D Gaussian Splatting, and multi-modal diffusion pipelines.",
    location: "AI Labs",
  },
];

export const statsData: StatItem[] = [
  {
    value: "150+",
    label: "ACTIVE RESEARCHERS",
    sublabel: "Builders, engineers & thinkers",
  },
  {
    value: "06",
    label: "FLAGSHIP EVENTS",
    sublabel: "Conferences, hackathons & sprints",
  },
  {
    value: "10+",
    label: "PROJECTS DEPLOYED",
    sublabel: "Open-source & production tools",
  },
  {
    value: "04+",
    label: "YEARS RUNNING",
    sublabel: "Continuous collegiate excellence",
  },
];

export const featurePillars: FeaturePillar[] = [
  {
    numeral: "01",
    title: "Research Excellence",
    description:
      "Deep exploration of neural architectures, transformer scaling, and foundation model inference with academic rigor.",
    tag: "DEEP LEARNING",
  },
  {
    numeral: "02",
    title: "Engineering Hub",
    description:
      "Architecting autonomous agents, low-latency API pipelines, and production systems tested at scale.",
    tag: "SYSTEMS & APPS",
  },
  {
    numeral: "03",
    title: "Skill Incubation",
    description:
      "Intensive peer-driven workshops, competitive coding brigades, and real-world project development mentorship.",
    tag: "WORKSHOPS",
  },
  {
    numeral: "04",
    title: "Industry Trajectory",
    description:
      "Direct bridges to top-tier AI labs, research symposia, hackathons, and high-impact industry collaboration.",
    tag: "COLLABORATION",
  },
];
