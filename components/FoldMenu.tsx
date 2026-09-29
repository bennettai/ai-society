"use client";

import { useEffect } from "react";

interface FoldMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Teams", href: "/team" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/resources" },
  { label: "Roadmap", href: "/roadmap" },
];

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/bennettai" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/bennett-artificial-intelligence-society/",
  },
  { label: "Instagram", href: "https://www.instagram.com/ais_bennett/" },
];

export default function FoldMenu({
  isOpen,
  onClose,
  onNavigate,
}: FoldMenuProps) {
  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <>
      {/* Backdrop: clean dark overlay without blur */}
      <div
        id="menu-backdrop"
        aria-hidden={!isOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-40 bg-black/40 transition-opacity"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      {/* Panel: Floating side menu with rounded corners and balanced height */}
      <div
        id="menu-panel"
        aria-hidden={!isOpen}
        className="fixed z-50 flex flex-col overflow-hidden border border-white/10 bg-[#0E0D0C] text-[#FAF9F5] shadow-[-25px_0_80px_rgba(0,0,0,0.85),_0_0_0_1px_rgba(255,255,255,0.06)] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          /* Positioned on the right with rounded corners and content-hugging height */
          top-3 right-3 w-[calc(100vw-24px)] sm:top-4 sm:right-4 sm:w-[450px] md:top-5 md:right-6 md:w-[470px] max-h-[calc(100dvh-28px)] sm:max-h-[calc(100dvh-36px)] h-auto rounded-[28px] sm:rounded-[32px] md:rounded-[36px]"
        style={{
          clipPath: "circle(0px at calc(100% - 48px) 36px)",
          transformOrigin: "top right",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        {/* Ambient diagonal radiant glow from top-right expansion origin */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#DE5D35]/25 via-[#DE5D35]/10 to-transparent blur-3xl opacity-60"
        />

        {/* Diagonal architectural grid accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Header: Unified Close Button */}
        <div className="menu-header relative z-10 flex shrink-0 items-center justify-end border-b border-white/10 px-6 py-4 sm:px-7 sm:py-4.5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="h-[34px] px-4 rounded-full bg-white text-[#0A0A0A] hover:bg-[#E3DFD7] font-mono text-[11px] uppercase tracking-wider font-bold transition-all duration-200 inline-flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
          >
            <span>CLOSE</span>
            <span className="text-[12px] leading-none font-bold">✕</span>
          </button>
        </div>

        {/* Primary Navigation Links — pure links */}
        <nav
          aria-label="Primary navigation"
          className="relative z-10 flex flex-col gap-1 sm:gap-1.5 px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto no-scrollbar"
        >
          {NAV_LINKS.map((item) => (
            <div key={item.label} className="menu-nav-item w-full shrink-0">
              <a
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                tabIndex={isOpen ? 0 : -1}
                className="group flex items-center justify-between rounded-2xl px-5 py-3 sm:py-3.5 transition-all duration-200 cursor-pointer select-none hover:bg-white/[0.06]"
              >
                <span className="font-display text-[22px] sm:text-[26px] md:text-[28px] font-bold tracking-tight text-[#FAF9F5] group-hover:text-[#DE5D35] transition-colors duration-200">
                  {item.label}
                </span>

                <span className="text-[16px] text-[#DE5D35] opacity-0 -translate-x-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                  →
                </span>
              </a>
            </div>
          ))}
        </nav>

        {/* Footer info & coordinates */}
        <div className="menu-footer relative z-10 shrink-0 border-t border-white/10 bg-black/25 px-6 py-4 sm:px-7 sm:py-4.5 text-[11px] font-mono text-white/60">
          <div className="flex items-center justify-between text-[11px]">
            <a
              href="mailto:ais@bennett.edu.in"
              className="text-white/80 hover:text-[#DE5D35] transition-colors inline-flex items-center gap-1.5"
            >
              <span>ais@bennett.edu.in</span>
              <span className="text-[10px] text-white/40">↗</span>
            </a>

            <div className="flex items-center gap-4 text-white/50">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
