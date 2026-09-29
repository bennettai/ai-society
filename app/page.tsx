"use client";

import EventsGallery from "@/components/EventsGallery";
import FoldLayout from "@/components/FoldLayout";
import Hero from "@/components/Hero";
import MethodologySection from "@/components/MethodologySection";
import PillarsBento from "@/components/PillarsBento";
import ResourceTeaser from "@/components/ResourceTeaser";
import StatementSection from "@/components/StatementSection";

export default function Home() {
  return (
    <FoldLayout>
      <main className="grow">
        <Hero />
        <StatementSection />
        <PillarsBento />
        <EventsGallery />
        <ResourceTeaser />
        <MethodologySection />
      </main>
    </FoldLayout>
  );
}
