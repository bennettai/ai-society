import FoldLayout from "@/components/FoldLayout";

/* ── Inline SVG shapes from shapes.gallery ─────────────────────────────── */
const shapes = {
  /** quad-arc / rounded-corner negative-space */
  S1: `<path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" fill="currentColor"/>`,
  /** stacked chevrons / arrows */
  S17: `<path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" fill="currentColor"/>`,
  /** rounded-square donut star */
  S27: `<path d="M 156 0 C 211.228 0 256 44.772 256 100 L 256 256 L 100 256 C 44.772 256 0 211.228 0 156 L 0 0 Z M 80 80 C 80 133.019 122.981 176 176 176 C 176 122.981 133.019 80 80 80 Z" fill="currentColor"/>`,
  /** twin half-moons */
  S49: `<path d="M 0 0 C 70.692 0 128 57.308 128 128 C 128 198.692 70.692 256 0 256 Z M 256 256 C 185.308 256 128 198.692 128 128 C 128 57.308 185.308 0 256 0 Z" fill="currentColor"/>`,
  /** four quarter-triangles */
  S60: `<path d="M 0 256 L 0 128 L 128 128 Z M 128 256 L 128 128 L 256 128 Z M 0 128 L 0 0 L 128 0 Z M 128 128 L 128 0 L 256 0 Z" fill="currentColor"/>`,
  /** big cross / 4-point star */
  S52: `<path d="M 152 70.059 L 201.539 20.519 L 235.48 54.461 L 185.941 104 L 256 104 L 256 152 L 185.941 152 L 235.48 201.539 L 201.539 235.48 L 152 185.941 L 152 256 L 104 256 L 104 185.941 L 54.46 235.48 L 20.52 201.539 L 70.059 152 L 0 152 L 0 104 L 70.059 104 L 20.519 54.46 L 54.461 20.52 L 104 70.059 L 104 0 L 152 0 Z" fill="currentColor"/>`,
  /** spiral arcs */
  S2: `<path d="M 128 192 C 92.654 192 64 220.654 64 256 L 0 256 C 0 185.308 57.308 128 128 128 Z M 256 128 C 256 198.692 198.692 256 128 256 L 128 192 C 163.346 192 192 163.346 192 128 Z M 128 64 C 92.654 64 64 92.654 64 128 L 0 128 C 0 57.308 57.308 0 128 0 Z M 256 0 C 256 70.692 198.692 128 128 128 L 128 64 C 163.346 64 192 35.346 192 0 Z" fill="currentColor"/>`,
  /** rounded square with interior diamond */
  S38: `<path d="M 206 0 C 233.614 0 256 22.386 256 50 L 256 206 C 256 233.614 233.614 256 206 256 L 50 256 C 22.386 256 0 233.614 0 206 L 0 50 C 0 22.386 22.386 0 50 0 Z M 128 64 C 128 99.346 99.346 128 64 128 C 99.346 128 128 156.654 128 192 C 128 156.654 156.654 128 192 128 C 156.654 128 128 99.346 128 64 Z" fill="currentColor"/>`,
};

type ShapeKey = keyof typeof shapes;

interface FloatShape {
  id: ShapeKey;
  size: number;
  top: string;
  left: string;
  rotate: number;
  delay: number;
  duration: number;
  opacity: number;
}

// biome-ignore format: hand-aligned table
const floaters: FloatShape[] = [
  { id: "S1",   size: 140, top: "6%",  left: "4%",   rotate: 12,  delay: 0,    duration: 8,  opacity: 0.13 },
  { id: "S17",  size: 90,  top: "12%", left: "80%",  rotate: -20, delay: 1.2,  duration: 7,  opacity: 0.10 },
  { id: "S27",  size: 180, top: "60%", left: "78%",  rotate: 30,  delay: 0.5,  duration: 9,  opacity: 0.09 },
  { id: "S49",  size: 110, top: "72%", left: "3%",   rotate: -15, delay: 2,    duration: 6,  opacity: 0.12 },
  { id: "S60",  size: 80,  top: "38%", left: "88%",  rotate: 45,  delay: 1.8,  duration: 10, opacity: 0.11 },
  { id: "S52",  size: 120, top: "82%", left: "55%",  rotate: 10,  delay: 0.8,  duration: 8,  opacity: 0.08 },
  { id: "S2",   size: 100, top: "20%", left: "55%",  rotate: -35, delay: 2.5,  duration: 7,  opacity: 0.10 },
  { id: "S38",  size: 160, top: "45%", left: "-3%",  rotate: 5,   delay: 1.5,  duration: 11, opacity: 0.08 },
];

export default function RoadmapPage() {
  return (
    <FoldLayout>
      <main className="grow flex items-center justify-center min-h-screen bg-[#EFECE6] text-[#1A1816] relative overflow-hidden">
        {/* ── Floating shapes ──────────────────────────────────────── */}
        {floaters.map((f) => (
          <svg
            key={f.id}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width={f.size}
            height={f.size}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: f.top,
              left: f.left,
              color: "#DE5D35",
              opacity: f.opacity,
              transform: `rotate(${f.rotate}deg)`,
              animation: `floatY ${f.duration}s ease-in-out ${f.delay}s infinite alternate`,
              pointerEvents: "none",
              userSelect: "none",
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: hard-coded SVG markup from the local shapes constant
            dangerouslySetInnerHTML={{ __html: shapes[f.id] }}
          />
        ))}

        {/* ── Radial glow blobs ────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(222,93,53,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-8%",
            left: "-4%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(222,93,53,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Centre content ───────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Pulsing pill badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#DE5D35]/10 border border-[#DE5D35]/30 text-[#DE5D35] font-mono text-[11px] font-bold tracking-widest uppercase mb-10 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DE5D35] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DE5D35]" />
            </span>
            <span>05 / TRAJECTORY</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-black uppercase leading-[0.88] tracking-[-0.04em] text-[#1A1816] mb-6"
            style={{ fontSize: "clamp(64px, 13vw, 128px)" }}
          >
            Coming
            <br />
            <span className="text-[#DE5D35]">Soon.</span>
          </h1>

          {/* Sub-line */}
          <p className="text-[15px] text-[#75716B] leading-relaxed max-w-[36ch] mt-2">
            Our official 2025–2027 roadmap is currently undergoing technical
            calibration. Check back at the next symposium.
          </p>
        </div>

        {/* ── Keyframe styles ──────────────────────────────────────── */}
        <style>{`
          @keyframes floatY {
            from { transform: translateY(0px)   rotate(var(--r)); }
            to   { transform: translateY(-22px) rotate(var(--r)); }
          }
        `}</style>
      </main>
    </FoldLayout>
  );
}
