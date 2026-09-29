"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles, PALETTE } from "@/components/looped";
import MathTex from "@/components/MathTex";

interface Pt {
  x: number;
  y: number;
}

// ── Section 01: dartboard geometry (deterministic, no randomness) ────────────
// The bullseye is the truth f(x). State A = high bias / low variance: the aim
// sits well off the bullseye but the throws huddle together. State B = low bias
// / high variance: the aim is back on the bullseye but the throws scatter wide.
const BULL = { x: 210, y: 150 };
const AIM_A = { x: 168, y: 106 };
const AIM_B = { x: 216, y: 143 };
const R_A = 15;
const R_B = 60;

const DOT_SPECS: { a: number; r: number }[] = [
  { a: 15, r: 1.0 },
  { a: 60, r: 0.82 },
  { a: 105, r: 1.12 },
  { a: 150, r: 0.9 },
  { a: 195, r: 1.05 },
  { a: 240, r: 0.8 },
  { a: 285, r: 1.15 },
  { a: 330, r: 0.95 },
];

const DOT_GEOMETRY = DOT_SPECS.map((d) => {
  const rad = (d.a * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  return {
    ax: AIM_A.x + R_A * d.r * ux - BULL.x,
    ay: AIM_A.y + R_A * d.r * uy - BULL.y,
    bx: AIM_B.x + R_B * d.r * ux - BULL.x,
    by: AIM_B.y + R_B * d.r * uy - BULL.y,
  };
});

const DOT_TARGETS = DOT_SPECS.map((_, i) => `.bv-dot-${i}`);

/** Deterministic fractional pseudo-noise — no Math.random, so SSR and CSR agree. */
function fract(v: number): number {
  return v - Math.floor(v);
}

export default function BiasVarianceArticlePage() {
  const [k, setK] = useState<number>(3);

  // ── dartboard loop styles ──────────────────────────────────────────────────
  const dotFrames = DOT_GEOMETRY.map(
    (g, i) =>
      `@keyframes bvDot${i} {\n      0%, 42%  { transform: translate(${g.ax.toFixed(1)}px, ${g.ay.toFixed(1)}px); }\n      52%, 92% { transform: translate(${g.bx.toFixed(1)}px, ${g.by.toFixed(1)}px); }\n      100%     { transform: translate(${g.ax.toFixed(1)}px, ${g.ay.toFixed(1)}px); }\n    }`,
  ).join("\n    ");

  const dotRules = DOT_SPECS.map(
    (_, i) => `.bv-dot-${i} { animation: bvDot${i} 7s ease-in-out infinite; }`,
  ).join("\n    ");

  const css = `
    ${dotFrames}
    @keyframes bvAim {
      0%, 42%  { transform: translate(${(AIM_A.x - BULL.x).toFixed(0)}px, ${(AIM_A.y - BULL.y).toFixed(0)}px); }
      52%, 92% { transform: translate(${(AIM_B.x - BULL.x).toFixed(0)}px, ${(AIM_B.y - BULL.y).toFixed(0)}px); }
      100%     { transform: translate(${(AIM_A.x - BULL.x).toFixed(0)}px, ${(AIM_A.y - BULL.y).toFixed(0)}px); }
    }
    @keyframes bvEnvA { 0%, 42% { opacity: 1; } 52%, 92% { opacity: 0; } 100% { opacity: 1; } }
    @keyframes bvEnvB { 0%, 42% { opacity: 0; } 52%, 92% { opacity: 1; } 100% { opacity: 0; } }
    @keyframes bvBiasLine { 0%, 42% { opacity: 0.65; } 52%, 92% { opacity: 0.08; } 100% { opacity: 0.65; } }
    @keyframes bvLabA { 0%, 42% { opacity: 1; } 52%, 92% { opacity: 0.15; } 100% { opacity: 1; } }
    @keyframes bvLabB { 0%, 42% { opacity: 0.15; } 52%, 92% { opacity: 1; } 100% { opacity: 0.15; } }
    ${dotRules}
    .bv-aim      { animation: bvAim 7s ease-in-out infinite; }
    .bv-env-a    { animation: bvEnvA 7s ease-in-out infinite; }
    .bv-env-b    { animation: bvEnvB 7s ease-in-out infinite; }
    .bv-biasline { animation: bvBiasLine 7s ease-in-out infinite; }
    .bv-lab-a    { animation: bvLabA 7s ease-in-out infinite; }
    .bv-lab-b    { animation: bvLabB 7s ease-in-out infinite; }
  `;

  // ── Section 03: the U-shaped total error curve (static) ────────────────────
  const uCurve = useMemo(() => {
    const N = 64;
    const mapX = (t: number) => 44 + t * 452;
    const mapY = (v: number) => 210 - (v / 1.3) * 184;
    const bias: string[] = [];
    const variance: string[] = [];
    const total: string[] = [];
    let bestX = mapX(0.5);
    let bestY = mapY(0.5);
    let bestVal = Number.POSITIVE_INFINITY;

    for (let i = 0; i <= N; i += 1) {
      const t = i / N;
      const b = 0.95 * Math.exp(-3.1 * t);
      const v = 0.05 + 1.05 * t ** 2.6;
      const tot = b + v + 0.06;
      bias.push(`${mapX(t).toFixed(1)},${mapY(b).toFixed(1)}`);
      variance.push(`${mapX(t).toFixed(1)},${mapY(v).toFixed(1)}`);
      total.push(`${mapX(t).toFixed(1)},${mapY(tot).toFixed(1)}`);
      if (tot < bestVal) {
        bestVal = tot;
        bestX = mapX(t);
        bestY = mapY(tot);
      }
    }

    return {
      bias: bias.join(" "),
      variance: variance.join(" "),
      total: total.join(" "),
      bestX,
      bestY,
    };
  }, []);

  // ── Section 04: fixed noisy 1-D dataset + KNN fit ──────────────────────────
  const knnData = useMemo<Pt[]>(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const x = i / 25;
        const noise = fract(Math.sin(i * 12.9898 + 4.1) * 43758.5453) - 0.5;
        const y = Math.min(
          0.97,
          Math.max(
            0.03,
            0.5 + 0.34 * Math.sin(2.5 * Math.PI * x) + noise * 0.26,
          ),
        );
        return { x, y };
      }),
    [],
  );

  const knn = useMemo(() => {
    const mapX = (v: number) => 44 + v * 452;
    const mapY = (v: number) => 196 - v * 172;

    const predict = (gx: number): number => {
      const sorted = knnData
        .map((p) => ({ y: p.y, d: Math.abs(p.x - gx) }))
        .sort((a, b) => a.d - b.d);
      let sum = 0;
      for (let i = 0; i < k; i += 1) sum += sorted[i].y;
      return sum / k;
    };

    const GRID = 72;
    const preds: number[] = [];
    const path: string[] = [];
    for (let i = 0; i <= GRID; i += 1) {
      const gx = i / GRID;
      const py = predict(gx);
      preds.push(py);
      path.push(`${mapX(gx).toFixed(1)},${mapY(py).toFixed(1)}`);
    }

    let roughness = 0;
    for (let i = 1; i < preds.length; i += 1) {
      roughness += Math.abs(preds[i] - preds[i - 1]);
    }

    const residuals = knnData.map((p) => ({
      x: p.x,
      y: p.y,
      fit: predict(p.x),
    }));
    const trainMse =
      residuals.reduce((acc, r) => acc + (r.fit - r.y) ** 2, 0) /
      residuals.length;

    return { path: path.join(" "), trainMse, roughness, residuals, mapX, mapY };
  }, [knnData, k]);

  const truePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 72; i += 1) {
      const x = i / 72;
      const y = 0.5 + 0.34 * Math.sin(2.5 * Math.PI * x);
      pts.push(`${(44 + x * 452).toFixed(1)},${(196 - y * 172).toFixed(1)}`);
    }
    return pts.join(" ");
  }, []);

  const knnRegime =
    k <= 3
      ? "low bias · high variance"
      : k <= 9
        ? "balanced"
        : "high bias · low variance";
  const knnRegimeColor =
    k <= 3 ? PALETTE.accent : k <= 9 ? PALETTE.ink : PALETTE.muted;

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen">
        <LoopedStyles
          css={css}
          reduceMotionTargets={[
            ".bv-aim",
            ".bv-env-a",
            ".bv-env-b",
            ".bv-biasline",
            ".bv-lab-a",
            ".bv-lab-b",
            ...DOT_TARGETS,
          ]}
        />
        <div className="shell max-w-5xl">
          {/* Back to Articles & Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              href="/resources"
              aria-label="Return to Published Articles Archive"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[2px] bg-[#FAF9F5] border border-[#1A1816] text-[#1A1816] font-mono text-[12px] font-bold tracking-wider uppercase transition-all duration-200 hover:bg-[#1A1816] hover:text-[#FAF9F5] group"
            >
              <span className="text-[#DE5D35] group-hover:text-[#FAF9F5] transition-transform duration-200 group-hover:-translate-x-1 font-bold">
                ←
              </span>
              <span>Back to 03 / Published Articles</span>
            </Link>

            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.16em] uppercase text-[#75716B]">
              <Link
                href="/resources"
                className="hover:text-[#1A1816] transition-colors"
              >
                03 / Resources
              </Link>
              <span>/</span>
              <span className="text-[#DE5D35] font-semibold">
                Foundations · Bias &amp; Variance
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 11
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              Bias &amp; Variance: Two Ways To Be Wrong
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              A model can miss the target by aiming at the wrong place, or by
              spraying its shots everywhere — usually both. This is the essay
              that separates the two, proves they add up to your error, and
              hands you a slider to feel the tradeoff with your own hands.
            </p>
          </header>

          {/* Section 01: dartboard */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / Two Ways To Be Wrong
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Archer, the Aim and the Spread
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Picture an archer. The bullseye is the truth{" "}
                  <MathTex math="f(x)" /> — the real relationship hiding in your
                  data. Every model you train is one shot at it. Score the
                  arrows and two different failures jump out.
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-3">
                  <div>
                    <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-1">
                      Bias · the aim is off
                    </span>
                    <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                      Arrows land in a tight little group — consistently, in the
                      same wrong place. Retrain on a fresh dataset and the group
                      barely moves; it is still off. That{" "}
                      <strong>systematic offset</strong> is bias.
                    </p>
                  </div>
                  <div className="border-t border-[#1A1816]/10 pt-3">
                    <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-1">
                      Variance · the spread is wide
                    </span>
                    <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                      Now the group is centred correctly but sprayed across the
                      whole board. Retrain and the arrows land somewhere
                      completely new. That <strong>erratic scatter</strong> is
                      variance.
                    </p>
                  </div>
                </div>
                <p>
                  Watch the loop flip between the two: first a steady aim landed
                  far from the bullseye, then a perfect aim that cannot hold
                  still. A model is routinely wrong both ways at once — which is
                  why we need to price each one separately.
                </p>
              </div>

              {/* Looped dartboard animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>THROWS ON A TARGET · 7s LOOP</span>
                  <span className="font-semibold text-[#DE5D35]">
                    bias ↔ variance
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <Looped label="Animation of a cluster of throws on a target, cycling between a tight cluster aimed away from the bullseye and a wide cluster centred on the bullseye">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 420 300"
                      className="w-full select-none"
                    >
                      {/* Target rings, bullseye is the truth */}
                      {[96, 72, 48, 26, 9].map((r, i) => (
                        <circle
                          key={r}
                          cx={BULL.x}
                          cy={BULL.y}
                          r={r}
                          fill={i === 4 ? PALETTE.accent : "none"}
                          fillOpacity={i === 4 ? 0.85 : 0}
                          stroke="rgba(26,24,22,0.35)"
                          strokeWidth="1"
                        />
                      ))}
                      <line
                        x1={BULL.x - 14}
                        y1={BULL.y}
                        x2={BULL.x + 14}
                        y2={BULL.y}
                        stroke={PALETTE.muted}
                        strokeWidth="1"
                      />
                      <line
                        x1={BULL.x}
                        y1={BULL.y - 14}
                        x2={BULL.x}
                        y2={BULL.y + 14}
                        stroke={PALETTE.muted}
                        strokeWidth="1"
                      />

                      {/* Bias: a dashed line from the truth to where we aim */}
                      <line
                        className="bv-biasline"
                        x1={BULL.x}
                        y1={BULL.y}
                        x2={AIM_A.x}
                        y2={AIM_A.y}
                        stroke={PALETTE.ink}
                        strokeWidth="1"
                        strokeDasharray="4 3"
                        style={{ opacity: 1 }}
                      />

                      {/* Variance envelopes, one per state */}
                      <circle
                        className="bv-env-a"
                        cx={AIM_A.x}
                        cy={AIM_A.y}
                        r={R_A + 8}
                        fill="none"
                        stroke={PALETTE.accent}
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        style={{ opacity: 1 }}
                      />
                      <circle
                        className="bv-env-b"
                        cx={AIM_B.x}
                        cy={AIM_B.y}
                        r={R_B + 8}
                        fill="none"
                        stroke={PALETTE.accent}
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        style={{ opacity: 0 }}
                      />

                      {/* The throws */}
                      {DOT_SPECS.map((_, i) => (
                        <circle
                          key={i}
                          className={`bv-dot-${i}`}
                          cx={BULL.x}
                          cy={BULL.y}
                          r="4"
                          fill={PALETTE.accent}
                          stroke={PALETTE.surface}
                          strokeWidth="1.5"
                          style={{
                            transform: `translate(${DOT_GEOMETRY[i].ax.toFixed(1)}px, ${DOT_GEOMETRY[i].ay.toFixed(1)}px)`,
                          }}
                        />
                      ))}

                      {/* Where we are aiming right now */}
                      <g
                        className="bv-aim"
                        style={{
                          transform: `translate(${(AIM_A.x - BULL.x).toFixed(0)}px, ${(AIM_A.y - BULL.y).toFixed(0)}px)`,
                        }}
                      >
                        <line
                          x1={BULL.x - 11}
                          y1={BULL.y}
                          x2={BULL.x + 11}
                          y2={BULL.y}
                          stroke={PALETTE.ink}
                          strokeWidth="1.5"
                        />
                        <line
                          x1={BULL.x}
                          y1={BULL.y - 11}
                          x2={BULL.x}
                          y2={BULL.y + 11}
                          stroke={PALETTE.ink}
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={BULL.x}
                          cy={BULL.y}
                          r="2.5"
                          fill={PALETTE.ink}
                        />
                      </g>

                      <text
                        x={BULL.x}
                        y={BULL.y + 112}
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill={PALETTE.muted}
                      >
                        bullseye = the truth f(x)
                      </text>
                      <text
                        className="bv-lab-a"
                        x={BULL.x}
                        y={286}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill={PALETTE.ink}
                        style={{ opacity: 1 }}
                      >
                        HIGH BIAS · LOW VARIANCE — tight group, wrong place
                      </text>
                      <text
                        className="bv-lab-b"
                        x={BULL.x}
                        y={286}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill={PALETTE.accent}
                        style={{ opacity: 0 }}
                      >
                        LOW BIAS · HIGH VARIANCE — right place, wide scatter
                      </text>
                    </svg>
                  </Looped>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  the crosshair is the aim · the ring is the spread · the gap
                  from the bullseye is the bias
                </p>
              </div>
            </div>
          </section>

          {/* Section 02: decomposition */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                02 / The Decomposition
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Expected Error Splits Into Exactly Three Pieces
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              The archer&apos;s two failures are not a metaphor that fades out
              when the maths starts. For squared error they are the maths. Take
              a fixed point <MathTex math="x" />, imagine retraining your model
              on many independent datasets, and average the squared error you
              would get.
            </p>

            <div className="p-5 bg-[#1A1816] text-[#FAF9F5] mb-6">
              <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-3">
                The Most Important Formula in This Article
              </span>
              <MathTex
                math="\mathbb{E}\big[(y - \hat{f}(x))^2\big] = \underbrace{\text{Bias}^2[\hat{f}(x)]}_{\text{systematic offset}} + \underbrace{\text{Var}[\hat{f}(x)]}_{\text{erratic scatter}} + \underbrace{\sigma^2}_{\text{irreducible noise}}"
                block
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  Bias² · how far off the aim is
                </span>
                <MathTex
                  math="\text{Bias}[\hat{f}(x)] = \mathbb{E}[\hat{f}(x)] - f(x)"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                  The average prediction across all those hypothetical datasets,
                  minus the truth. A property of your{" "}
                  <em>model class and features</em>, not of any one lucky fit.
                  It cannot be averaged away by collecting more data.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                  Variance · how much the aim wobbles
                </span>
                <MathTex
                  math="\text{Var}[\hat{f}(x)] = \mathbb{E}\Big[\big(\hat{f}(x) - \mathbb{E}[\hat{f}(x)]\big)^2\Big]"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                  How widely predictions jump around their own average as the
                  training set changes. This one <em>does</em> shrink when you
                  feed the model more data or hold it back from chasing noise.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#75716B] font-bold mb-2">
                  σ² · the floor nobody can dig through
                </span>
                <MathTex
                  math="\sigma^2 = \mathbb{E}\big[(y - f(x))^2\big]"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                  The label <MathTex math="y" /> is itself random around{" "}
                  <MathTex math="f(x)" />. Even a model that recovers{" "}
                  <MathTex math="f" /> perfectly still eats this error. It is
                  irreducible — a hard lower bound on achievable loss.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 max-w-3xl">
              <p className="text-[14px] text-[#4A4742] leading-[1.7]">
                Sit with <MathTex math="\sigma^2" /> for a second, because it is
                the term people forget. A validation loss of{" "}
                <MathTex math="0.00" /> is not a goal you are failing to reach —
                it is a goal that <strong>does not exist</strong>. If the labels
                carry noise, no architecture, no dataset size and no amount of
                compute drives the expected error below it. Everything else in
                this article is a fight over the first two terms, and the only
                lever you truly own is how you split your budget between them.
              </p>
            </div>
          </section>

          {/* Section 03: under/overfitting */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Underfitting &amp; Overfitting
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Too Simple, Too Complex, and the Sweet Spot Between
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Complexity is the dial that trades one error for the other. Turn
              it down and bias takes over; turn it up and variance does. The
              same story is told by polynomial degree, tree depth, the number of
              neighbours in KNN, or how long you train.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6">
              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                    Underfitting · high bias, low variance
                  </span>
                  <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                    A straight line forced through a curve. The model is too
                    rigid to bend, so it misses the trend the same way every
                    time — low variance, because a new dataset barely changes
                    the answer. Both train and validation error sit high, and
                    uncomfortably close together.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    Overfitting · low bias, high variance
                  </span>
                  <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                    A degree-25 polynomial threaded through every point —
                    including the noise. Training error collapses toward zero
                    while validation error climbs. Change one training row and
                    the whole curve lurches. Low bias on paper, useless in
                    practice.
                  </p>
                </div>
                <div className="p-3 bg-[#1A1816] text-[#FAF9F5] font-mono text-[12px] leading-[1.6]">
                  SWEET SPOT: enough flexibility to follow the signal, not
                  enough to memorise the noise.
                </div>
              </div>

              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>ERROR vs MODEL COMPLEXITY</span>
                  <span className="font-semibold text-[#DE5D35]">
                    the U-shaped curve
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 520 240"
                    className="w-full select-none"
                    role="img"
                    aria-label="Static chart showing bias squared falling and variance rising as model complexity grows, with total error forming a U shape and a minimum in the middle"
                  >
                    <line
                      x1="44"
                      y1="210"
                      x2="500"
                      y2="210"
                      stroke={PALETTE.ink}
                      strokeWidth="1"
                    />
                    <line
                      x1="44"
                      y1="20"
                      x2="44"
                      y2="210"
                      stroke={PALETTE.ink}
                      strokeWidth="1"
                    />

                    <polyline
                      points={uCurve.bias}
                      fill="none"
                      stroke={PALETTE.ink}
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    />
                    <polyline
                      points={uCurve.variance}
                      fill="none"
                      stroke={PALETTE.accent}
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    />
                    <polyline
                      points={uCurve.total}
                      fill="none"
                      stroke={PALETTE.ink}
                      strokeWidth="2.5"
                    />

                    <line
                      x1={uCurve.bestX}
                      y1="20"
                      x2={uCurve.bestX}
                      y2="210"
                      stroke={PALETTE.muted}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={uCurve.bestX}
                      cy={uCurve.bestY}
                      r="5"
                      fill={PALETTE.accent}
                      stroke={PALETTE.surface}
                      strokeWidth="1.5"
                    />

                    <text
                      x="56"
                      y="36"
                      fontSize="10"
                      fontFamily="monospace"
                      fill={PALETTE.ink}
                    >
                      bias² (dashed ink)
                    </text>
                    <text
                      x="470"
                      y="42"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill={PALETTE.accent}
                    >
                      variance (dashed orange)
                    </text>
                    <text
                      x={uCurve.bestX + 8}
                      y={uCurve.bestY - 10}
                      fontSize="10"
                      fontFamily="monospace"
                      fill={PALETTE.muted}
                    >
                      minimum total error
                    </text>
                    <text
                      x="272"
                      y="230"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill={PALETTE.muted}
                    >
                      model complexity →
                    </text>
                    <text
                      x="20"
                      y="115"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill={PALETTE.muted}
                      transform="rotate(-90 20 115)"
                    >
                      error →
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  solid line = total error · it is the sum of the two dashed
                  ones
                </p>
              </div>
            </div>
          </section>

          {/* Section 04: KNN interactive */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / KNN: The Knob in Plain Sight
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Drag <MathTex math="k" /> and Watch Bias Trade For Variance
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  K-Nearest Neighbours makes no assumptions at all — it predicts
                  by averaging the labels of the <MathTex math="k" /> training
                  points closest to the query:
                </p>
                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[13px]">
                  <MathTex
                    math="\hat{f}_k(x) = \frac{1}{k}\sum_{i \in \mathcal{N}_k(x)} y_i"
                    block
                  />
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>NEIGHBOURS (k)</span>
                      <span
                        className="font-bold"
                        style={{ color: knnRegimeColor }}
                      >
                        {k}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="1"
                      value={k}
                      onChange={(e) => setK(parseInt(e.target.value, 10))}
                      className="w-full accent-[#DE5D35] cursor-pointer"
                      aria-label="Number of nearest neighbours"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[#75716B] mt-1">
                      <span>k = 1 · memorise</span>
                      <span>k = 25 · average everything</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[10px] font-mono text-[#75716B]">
                      TRAIN MSE
                    </span>
                    <span className="text-[18px] font-mono font-bold text-[#DE5D35]">
                      {knn.trainMse.toFixed(4)}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[10px] font-mono text-[#75716B]">
                      SMOOTHNESS · Σ|Δ|
                    </span>
                    <span className="text-[18px] font-mono font-bold text-[#1A1816]">
                      {knn.roughness.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div
                  className="p-3 border font-mono text-[11px] uppercase tracking-wider"
                  style={{ borderColor: knnRegimeColor, color: knnRegimeColor }}
                >
                  NOW: {knnRegime}
                </div>

                <p>
                  At <MathTex math="k = 1" /> every training point predicts
                  itself: train MSE is exactly <MathTex math="0" /> and the
                  curve is a spike for every noisy label. That is pure variance
                  on display. Push <MathTex math="k" /> up and the wiggles
                  flatten as the neighbourhood swallows more and more of the
                  signal — until the curve is nearly straight and train MSE
                  balloons. That is bias, bought honestly.
                </p>
              </div>

              {/* KNN plot */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>1-D KNN FIT · FIXED NOISY DATASET</span>
                  <span className="font-bold" style={{ color: knnRegimeColor }}>
                    k = {k}
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 520 220"
                    className="w-full select-none"
                    role="img"
                    aria-label={`One-dimensional K-nearest-neighbours fit over a noisy dataset with k equal to ${k}`}
                  >
                    {/* Axes */}
                    <line
                      x1="44"
                      y1="196"
                      x2="500"
                      y2="196"
                      stroke={PALETTE.ink}
                      strokeWidth="1"
                    />
                    <line
                      x1="44"
                      y1="20"
                      x2="44"
                      y2="196"
                      stroke={PALETTE.ink}
                      strokeWidth="1"
                    />

                    {/* True signal */}
                    <polyline
                      points={truePath}
                      fill="none"
                      stroke={PALETTE.muted}
                      strokeWidth="1"
                      strokeDasharray="5 4"
                      opacity="0.7"
                    />

                    {/* Residuals from each training point to the fit */}
                    {knn.residuals.map((r, i) => (
                      <line
                        key={`res-${i}`}
                        x1={knn.mapX(r.x)}
                        y1={knn.mapY(r.y)}
                        x2={knn.mapX(r.x)}
                        y2={knn.mapY(r.fit)}
                        stroke={PALETTE.danger}
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.45"
                      />
                    ))}

                    {/* The KNN fit */}
                    <polyline
                      points={knn.path}
                      fill="none"
                      stroke={PALETTE.accent}
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />

                    {/* Training points */}
                    {knnData.map((p, i) => (
                      <circle
                        key={`pt-${i}`}
                        cx={knn.mapX(p.x)}
                        cy={knn.mapY(p.y)}
                        r="3.6"
                        fill={PALETTE.ink}
                        stroke={PALETTE.surface}
                        strokeWidth="1.5"
                      />
                    ))}

                    <text
                      x="272"
                      y="214"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill={PALETTE.muted}
                    >
                      feature x →
                    </text>
                    <text
                      x="20"
                      y="108"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill={PALETTE.muted}
                      transform="rotate(-90 20 108)"
                    >
                      label y →
                    </text>
                    <text
                      x="496"
                      y="34"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill={PALETTE.muted}
                    >
                      grey dashed = true signal
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  orange = the fit · red dashes = training residuals · drag the
                  slider
                </p>
              </div>
            </div>
          </section>

          {/* Section 05: regularization */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / Regularization as Deliberate Bias
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Paying a Little Bias to Buy a Lot of Calm
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  If variance is the disease, one cure is to stop the
                  coefficients from growing wild. Regularization adds a penalty
                  on the size of <MathTex math="\beta" /> to the loss, so the
                  optimizer must trade fit against restraint:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    LASSO · L1 penalty
                  </span>
                  <MathTex
                    math="\hat{\beta} = \arg\min_{\beta} \Big\{ \sum_{i=1}^{n} (y_i - x_i^\top \beta)^2 + \lambda \sum_{j=1}^{p} |\beta_j| \Big\}"
                    block
                  />
                  <p className="text-[12px] text-[#75716B] mt-1">
                    The absolute value has a sharp corner at zero, so weak
                    coefficients snap <em>exactly</em> to zero — the model
                    selects features and shrinks at once.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                    RIDGE · L2 penalty
                  </span>
                  <MathTex
                    math="\hat{\beta} = \arg\min_{\beta} \Big\{ \sum_{i=1}^{n} (y_i - x_i^\top \beta)^2 + \lambda \sum_{j=1}^{p} \beta_j^2 \Big\}"
                    block
                  />
                  <p className="text-[12px] text-[#75716B] mt-1">
                    A smooth bowl instead of a corner: coefficients shrink
                    toward zero but rarely reach it. Every feature keeps a small
                    say in the answer.
                  </p>
                </div>
                <p>
                  Read <MathTex math="\lambda" /> as the same dial as{" "}
                  <MathTex math="k" /> in Section 04, just wearing a different
                  costume:
                </p>
                <div className="p-3 bg-[#1A1816] text-[#FAF9F5] font-mono text-[12px]">
                  <MathTex
                    math="\lambda \uparrow \; \Rightarrow \; \text{Bias} \uparrow, \; \text{Var} \downarrow"
                    block
                  />
                </div>
                <p>
                  Why would you ever accept bias on purpose? Because variance
                  usually collapses faster than bias grows, so total error
                  falls. A model that is slightly wrong in a{" "}
                  <em>predictable</em> direction beats one that is right on
                  average but unrecognisable from run to run — especially when
                  you only get one run in production.
                </p>
              </div>

              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>CONSTRAINT GEOMETRY · WHY L1 GOES SPARSE</span>
                  <span className="font-semibold text-[#DE5D35]">
                    corners vs arc
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 520 210"
                    className="w-full select-none"
                    role="img"
                    aria-label="Side by side comparison of the L1 diamond constraint region, whose corner touches the loss contour on an axis, and the L2 circle constraint region, whose arc touches the contour away from the axes"
                  >
                    {/* L1 panel */}
                    <text
                      x="58"
                      y="26"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={PALETTE.ink}
                    >
                      L1 · |β₁| + |β₂| ≤ t
                    </text>
                    <polygon
                      points="120,43 182,105 120,167 58,105"
                      fill="rgba(222,93,53,0.06)"
                      stroke={PALETTE.ink}
                      strokeWidth="1.5"
                    />
                    {[24, 46, 68].map((rx) => (
                      <ellipse
                        key={`l1-${rx}`}
                        cx="172"
                        cy="70"
                        rx={rx}
                        ry={rx * 0.6}
                        fill="none"
                        stroke="rgba(117,113,107,0.55)"
                        strokeDasharray="3 3"
                      />
                    ))}
                    <circle
                      cx="159.5"
                      cy="82.5"
                      r="4.5"
                      fill={PALETTE.accent}
                      stroke={PALETTE.surface}
                      strokeWidth="1.5"
                    />
                    <line
                      x1="120"
                      y1="105"
                      x2="58"
                      y2="105"
                      stroke={PALETTE.accent}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="120"
                      y="188"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill={PALETTE.accent}
                    >
                      corner touches here → β₁ collapses to 0
                    </text>

                    {/* Divider */}
                    <line
                      x1="262"
                      y1="30"
                      x2="262"
                      y2="180"
                      stroke="rgba(26,24,22,0.15)"
                      strokeWidth="1"
                    />

                    {/* L2 panel */}
                    <text
                      x="320"
                      y="26"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={PALETTE.ink}
                    >
                      L2 · β₁² + β₂² ≤ t
                    </text>
                    <circle
                      cx="390"
                      cy="105"
                      r="62"
                      fill="rgba(26,24,22,0.04)"
                      stroke={PALETTE.ink}
                      strokeWidth="1.5"
                    />
                    {[24, 46, 68].map((rx) => (
                      <ellipse
                        key={`l2-${rx}`}
                        cx="442"
                        cy="70"
                        rx={rx}
                        ry={rx * 0.6}
                        fill="none"
                        stroke="rgba(117,113,107,0.55)"
                        strokeDasharray="3 3"
                      />
                    ))}
                    <circle
                      cx="441.4"
                      cy="70.4"
                      r="4.5"
                      fill={PALETTE.accent}
                      stroke={PALETTE.surface}
                      strokeWidth="1.5"
                    />
                    <line
                      x1="390"
                      y1="105"
                      x2="390"
                      y2="43"
                      stroke={PALETTE.accent}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x="330"
                      y="188"
                      fontSize="9"
                      fontFamily="monospace"
                      fill={PALETTE.accent}
                    >
                      arc touches off-axis → β shrinks, stays non-zero
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  dashed rings = contours of the fit loss · the constrained
                  optimum is where they first meet
                </p>
              </div>
            </div>
          </section>

          {/* Section 06: diagnostics */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                06 / Diagnostics
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Reading the Gap Between Train and Validation
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              You never get to see bias or variance directly — you only see two
              error numbers. Their <em>relationship</em> tells you which failure
              you are staring at, and therefore which fix is worth your
              afternoon.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#DE5D35]">
                    Variance signature
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    train ≪ validation
                  </span>
                </div>
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mb-3">
                  Training error is low and validation error is far above it.
                  The model has learned the training set, noise included, and
                  cannot repeat the trick on rows it has not seen. The width of
                  that gap <em>is</em> the variance bill.
                </p>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-1">
                  Try, in order
                </span>
                <ul className="text-[12px] text-[#4A4742] leading-[1.7] list-none space-y-1">
                  <li>
                    · More data — the highest-leverage fix, if you can get it
                  </li>
                  <li>
                    · Regularize: raise λ, lower complexity, early stopping
                  </li>
                  <li>· Simplify: fewer features, shallower tree, larger k</li>
                  <li>
                    · Ensemble: bagging and forests average the wobble out
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#1A1816]">
                    Bias signature
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    train ≈ validation, both high
                  </span>
                </div>
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mb-3">
                  Both errors are high and — this is the tell — they sit close
                  together. More data will not help, because the model is
                  already stable; it is stably wrong. The ceiling here is the
                  model class itself, not the sample size.
                </p>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-1">
                  Try, in order
                </span>
                <ul className="text-[12px] text-[#4A4742] leading-[1.7] list-none space-y-1">
                  <li>
                    · Better features — engineer what the model cannot infer
                  </li>
                  <li>· A richer model class: interactions, splines, depth</li>
                  <li>
                    · Train longer, or loosen over-aggressive regularization
                  </li>
                  <li>
                    · Check the labels: σ² is a floor, but a broken target is
                    not
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-[#1A1816] text-[#FAF9F5] md:col-span-2">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  The one-line heuristic
                </span>
                <p className="text-[14px] leading-[1.7] text-[#FAF9F5]/80">
                  If validation is much worse than training, attack variance. If
                  both are bad together, attack bias. And remember the third
                  term from Section 02: whenever your validation error flattens
                  out onto a floor that neither more data nor a bigger model
                  moves, you have probably met <MathTex math="\sigma^2" /> — and
                  the honest move is to stop spending compute, not to keep
                  tuning.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#75716B] font-bold mb-2">
                  Do not tune on test
                </span>
                <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                  Every decision you make by peeking at a score leaks
                  information into the model. Keep a validation split for the
                  bias-variance decisions above, and touch the test set once, at
                  the end — otherwise your variance estimate is really just the
                  memory of your own tuning.
                </p>
              </div>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/resources/random-forest"
                className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
              >
                <span>← Topic 10: Random Forests</span>
              </Link>
              <Link
                href="/resources/train-test-validation"
                className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
              >
                <span>Topic 12: Train, Test &amp; Validation →</span>
              </Link>
            </div>
            <p className="mt-6 text-[11px] font-mono tracking-wide text-[#75716B]">
              Adapted from MLU-Explain (Amazon, CC BY-SA 4.0).
            </p>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
