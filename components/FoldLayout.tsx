"use client";

import { type ReactNode, useState } from "react";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import StaggeredMenu from "@/components/StaggeredMenu";
import { assetPath } from "@/lib/basePath";

interface FoldLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const MENU_ITEMS = [
  { label: "Home", ariaLabel: "Go to home page", link: "/" },
  { label: "Teams", ariaLabel: "View teams and mentors", link: "/team" },
  { label: "Events", ariaLabel: "View talks and hackathons", link: "/events" },
  {
    label: "Learning",
    ariaLabel: "View AI Learning Center",
    link: "/resources",
  },
  {
    label: "Alumni",
    ariaLabel: "View Alumni network",
    link: "/alumni",
  },
  {
    label: "Newsletter",
    ariaLabel: "View weekly newsletter dispatches",
    link: "/newsletter",
  },
  {
    label: "Blog",
    ariaLabel: "View engineering blog and research logs",
    link: "/blog",
  },
  { label: "Roadmap", ariaLabel: "View development roadmap", link: "/roadmap" },
];

const SOCIAL_ITEMS = [
  { label: "GitHub", link: "https://github.com/bennettai" },
  {
    label: "LinkedIn",
    link: "https://www.linkedin.com/company/bennett-artificial-intelligence-society/",
  },
  { label: "Instagram", link: "https://www.instagram.com/ais_bennett/" },
];

export default function FoldLayout({
  children,
  showFooter = true,
}: FoldLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SmoothScroll isPaused={isMenuOpen}>
      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0E0D0C]">
        {/* React Bits StaggeredMenu: 4-color palette underlays (Purple & Orange) with bold Unbounded typography */}
        <StaggeredMenu
          position="right"
          isFixed={true}
          colors={["#3F1E46", "#DD6E2D"]}
          accentColor="#DD6E2D"
          menuButtonColor="#ffffff"
          openMenuButtonColor="#ffffff"
          changeMenuColorOnOpen={false}
          displaySocials={true}
          displayItemNumbering={true}
          items={MENU_ITEMS}
          socialItems={SOCIAL_ITEMS}
          logoUrl={assetPath("/images/ais-logo.png")}
          onMenuOpen={() => setIsMenuOpen(true)}
          onMenuClose={() => setIsMenuOpen(false)}
        />

        {/* Underlying page canvas */}
        <div
          id="page-canvas"
          className="relative z-10 flex min-h-screen w-full flex-col bg-ground text-ink"
        >
          <div className="grow flex flex-col">{children}</div>

          {showFooter && <Footer />}
        </div>
      </div>
    </SmoothScroll>
  );
}
