import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bennettai.github.io/ai-society";

const PAGES = [
  "",
  "/events",
  "/learning",
  "/resources",
  "/team",
  "/alumni",
  "/newsletter",
  "/blog",
  "/roadmap",
];

// Keep in sync with the articles listed in app/resources/page.tsx
const ESSAYS = [
  "linear-regression",
  "logistic-regression",
  "precision-recall",
  "roc-auc",
  "cross-validation",
  "decision-trees",
  "neural-networks",
  "convolutional-networks",
  "recurrent-networks",
  "random-forest",
  "bias-variance",
  "train-test-validation",
  "double-descent",
  "equality-of-odds",
  "reinforcement-learning",
  "transformers",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}/` })),
    ...ESSAYS.map((slug) => ({ url: `${SITE_URL}/resources/${slug}/` })),
  ];
}
