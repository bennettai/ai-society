"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles, PALETTE } from "@/components/looped";
import MathTex from "@/components/MathTex";

// Section 04: the four reference ROC shapes. Coordinates share one 280×280
// frame with axes from (40,240) to (240,40).
const ROC_REFERENCE: {
  key: string;
  name: string;
  auc: string;
  d: string;
  area: string;
  stroke: string;
  note: string;
}[] = [
  {
    key: "perfect",
    name: "Perfect",
    auc: "1.00",
    d: "M40 240 L40 40 L240 40",
    area: "M40 240 L40 40 L240 40 L240 240 Z",
    stroke: PALETTE.accent,
    note: "TPR = 1 at every FPR — every positive ranked above every negative.",
  },
  {
    key: "good",
    name: "Useful",
    auc: "0.88",
    d: "M40 240 C 55 110 120 50 240 40",
    area: "M40 240 C 55 110 120 50 240 40 L240 240 Z",
    stroke: PALETTE.accent,
    note: "Bows toward the top-left corner. The real-world result worth shipping.",
  },
  {
    key: "random",
    name: "Random",
    auc: "0.50",
    d: "M40 240 L240 40",
    area: "",
    stroke: PALETTE.muted,
    note: "TPR = FPR everywhere: the classifier is guessing, not ranking.",
  },
  {
    key: "worse",
    name: "Worse Than Random",
    auc: "0.35",
    d: "M40 240 Q 150 210 240 40",
    area: "M40 240 Q 150 210 240 40 L240 240 Z",
    stroke: PALETTE.danger,
    note: "Sags below the diagonal — invert its scores and it improves.",
  },
];

// Section 05 loop: two models with identical AUC by construction.
// B(x) = A(x) + k·sin(2πx), and ∫₀¹ sin(2πx) dx = 0, so the areas are equal
// while the curves cross at x = 0.5. A is an early climber, B a late one.
const ROC_MISLEAD_CSS = `
    @keyframes rocMisFillA {
      0%   { fill-opacity: 0; }
      25%  { fill-opacity: 0.22; }
      45%  { fill-opacity: 0.22; }
      70%  { fill-opacity: 0; }
      100% { fill-opacity: 0; }
    }
    @keyframes rocMisFillB {
      0%   { fill-opacity: 0; }
      30%  { fill-opacity: 0; }
      55%  { fill-opacity: 0.22; }
      75%  { fill-opacity: 0.22; }
      100% { fill-opacity: 0; }
    }
    @keyframes rocMisCross {
      0%, 100% { opacity: 0.4; }
      50%      { opacity: 1; }
    }
    .roc-mis-a { animation: rocMisFillA 8s ease-in-out infinite; }
    .roc-mis-b { animation: rocMisFillB 8s ease-in-out infinite; }
    .roc-mis-cross { animation: rocMisCross 8s ease-in-out infinite; }
  `;

export default function RocAucArticlePage() {
  // Interactive Threshold: tau from 0 to 1
  const [threshold, setThreshold] = useState<number>(0.5);
  // Separation distance between negative (class 0) and positive (class 1)
  const [separation, setSeparation] = useState<number>(1.8);

  // Synthetic distribution parameters
  const simData = useMemo(() => {
    const negMean = 35;
    const posMean = 35 + separation * 18;
    const std = 14;

    const normalPdf = (x: number, mean: number, s: number) => {
      return (
        (1 / (s * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * ((x - mean) / s) ** 2)
      );
    };

    const tauX = threshold * 100;

    let tpSum = 0;
    let fpSum = 0;
    let tnSum = 0;
    let fnSum = 0;
    const steps = 200;
    const dx = 100 / steps;

    for (let i = 0; i < steps; i++) {
      const x = i * dx;
      const pPos = normalPdf(x, posMean, std);
      const pNeg = normalPdf(x, negMean, std);

      if (x >= tauX) {
        tpSum += pPos * dx;
        fpSum += pNeg * dx;
      } else {
        fnSum += pPos * dx;
        tnSum += pNeg * dx;
      }
    }

    const totalPos = tpSum + fnSum || 1;
    const totalNeg = fpSum + tnSum || 1;

    const tpr = Math.min(1, Math.max(0, tpSum / totalPos));
    const fpr = Math.min(1, Math.max(0, fpSum / totalNeg));

    const curvePoints: { fpr: number; tpr: number }[] = [];
    for (let t = 0; t <= 100; t += 2) {
      let curTp = 0;
      let curFp = 0;
      for (let i = 0; i < steps; i++) {
        const x = i * dx;
        if (x >= t) {
          curTp += normalPdf(x, posMean, std) * dx;
          curFp += normalPdf(x, negMean, std) * dx;
        }
      }
      curvePoints.push({
        fpr: Math.min(1, Math.max(0, curFp / totalNeg)),
        tpr: Math.min(1, Math.max(0, curTp / totalPos)),
      });
    }

    let auc = 0;
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p1 = curvePoints[i];
      const p2 = curvePoints[i + 1];
      const width = Math.abs(p1.fpr - p2.fpr);
      const avgHeight = (p1.tpr + p2.tpr) / 2;
      auc += width * avgHeight;
    }

    return {
      tpr,
      fpr,
      auc: Math.min(0.999, Math.max(0.5, auc)),
      curvePoints,
      tauX,
      posMean,
      negMean,
    };
  }, [threshold, separation]);

  // Section 05: equal-area crossing curves for the "when AUC misleads" loop.
  const misleading = useMemo(() => {
    const sx = (x: number) => +(40 + x * 300).toFixed(1);
    const sy = (y: number) => +(280 - y * 240).toFixed(1);
    const a: string[] = [];
    const b: string[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const ya = 1 - (1 - x) ** 2;
      const yb = ya + 0.12 * Math.sin(2 * Math.PI * x);
      a.push(`${i === 0 ? "M" : "L"}${sx(x)} ${sy(ya)}`);
      b.push(`${i === 0 ? "M" : "L"}${sx(x)} ${sy(yb)}`);
    }
    const pathA = a.join(" ");
    const pathB = b.join(" ");
    return {
      pathA,
      pathB,
      areaA: `${pathA} L${sx(1)} ${sy(0)} L${sx(0)} ${sy(0)} Z`,
      areaB: `${pathB} L${sx(1)} ${sy(0)} L${sx(0)} ${sy(0)} Z`,
      crossY: sy(0.75),
    };
  }, []);

  const css = `
    @keyframes rocSweepGlow {
      0%, 100% { opacity: 0.55; }
      50%      { opacity: 1; }
    }
    .roc-glow { animation: rocSweepGlow 8s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .roc-glow { animation: none; }
    }
  `;
  // Synchronized loop geometry (one shared 8s clock):
  // tau line sweeps x 60 -> 340 while the ROC dot traces the curve.
  const rocCurvePath = "M 560 280 C 575 150 650 60 840 45";

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen">
        <style>{css}</style>
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
                Evaluation · ROC &amp; AUC
              </span>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 04
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              ROC &amp; AUC: Diagnostic Power
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              One threshold is one opinion. The ROC curve is every opinion at
              once — watch the threshold sweep the class distributions and trace
              the entire curve on loop, then drive the sweep yourself.
            </p>
          </header>

          {/* Section 01: Synchronized looped animation */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / The Autopilot
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Sweeping the Threshold Traces the Curve
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              On the left, two class score distributions overlap. The sweeping{" "}
              <MathTex math="\tau" /> line decides: everything to its right is
              predicted positive. On the right, that same sweep — on the same
              clock — traces the ROC curve point by point. Where the
              distributions barely overlap, the curve climbs steeply; that climb{" "}
              <em>is</em> the model&apos;s diagnostic power.
            </p>

            {/* Single synced SVG: densities + ROC */}
            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
              <div className="flex flex-wrap items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A1816]" />
                    <span>Class 0 (Negative)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DE5D35]" />
                    <span>Class 1 (Positive)</span>
                  </span>
                </div>
                <span className="font-semibold text-[#DE5D35]">
                  8s loop · τ sweep ↔ ROC trace, synced
                </span>
              </div>
              <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px] overflow-x-auto">
                <svg
                  viewBox="0 0 900 320"
                  className="w-full min-w-[640px] select-none"
                  role="img"
                  aria-label="Synchronized animation: threshold sweeping score distributions while tracing the ROC curve"
                >
                  {/* ============ LEFT: densities ============ */}
                  <line
                    x1="40"
                    y1="270"
                    x2="400"
                    y2="270"
                    stroke="#1A1816"
                    strokeWidth="1"
                  />
                  <line
                    x1="40"
                    y1="30"
                    x2="40"
                    y2="270"
                    stroke="#1A1816"
                    strokeWidth="1"
                  />
                  <text
                    x="220"
                    y="295"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#75716B"
                  >
                    classifier score S(x) →
                  </text>

                  {/* Negative distribution */}
                  <path
                    d="M 60 268 Q 150 60 240 268"
                    fill="rgba(26,24,22,0.07)"
                    stroke="#1A1816"
                    strokeWidth="2"
                  />
                  {/* Positive distribution (shifted right) */}
                  <path
                    d="M 170 268 Q 265 85 370 268"
                    fill="rgba(222,93,53,0.12)"
                    stroke="#DE5D35"
                    strokeWidth="2"
                  />
                  <text
                    x="140"
                    y="55"
                    fontSize="10"
                    fontFamily="monospace"
                    fill="#1A1816"
                  >
                    negatives
                  </text>
                  <text
                    x="285"
                    y="75"
                    fontSize="10"
                    fontFamily="monospace"
                    fill="#DE5D35"
                  >
                    positives
                  </text>

                  {/* Sweeping threshold line */}
                  <g className="roc-glow">
                    <line
                      x1="0"
                      y1="35"
                      x2="0"
                      y2="278"
                      stroke="#DE5D35"
                      strokeWidth="2.5"
                      strokeDasharray="5 4"
                      transform="translate(60,0)"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        from="60 0"
                        to="340 0"
                        dur="8s"
                        repeatCount="indefinite"
                      />
                    </line>
                  </g>
                  <text
                    x="53"
                    y="26"
                    fontSize="10"
                    fontFamily="monospace"
                    fill="#DE5D35"
                    fontWeight="bold"
                  >
                    τ
                  </text>
                  <text
                    x="255"
                    y="313"
                    fontSize="10"
                    fontFamily="monospace"
                    fill="#75716B"
                    textAnchor="middle"
                  >
                    right of τ → predicted positive
                  </text>

                  {/* Connector hint */}
                  <path
                    d="M 400 160 C 440 160 460 160 500 160"
                    fill="none"
                    stroke="#75716B"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <text
                    x="450"
                    y="150"
                    fontSize="10"
                    fontFamily="monospace"
                    fill="#75716B"
                    textAnchor="middle"
                  >
                    every τ
                  </text>

                  {/* ============ RIGHT: ROC curve ============ */}
                  <line
                    x1="560"
                    y1="280"
                    x2="850"
                    y2="280"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="560"
                    y1="40"
                    x2="560"
                    y2="280"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />
                  <text
                    x="705"
                    y="313"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#75716B"
                  >
                    FPR (1 − specificity) →
                  </text>
                  <text
                    x="452"
                    y="160"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#75716B"
                    transform="rotate(-90 452 160)"
                  >
                    TPR (sensitivity) →
                  </text>

                  {/* Chance diagonal */}
                  <line
                    x1="560"
                    y1="280"
                    x2="850"
                    y2="40"
                    stroke="#75716B"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="810"
                    y="255"
                    fontSize="9"
                    fontFamily="monospace"
                    fill="#75716B"
                    textAnchor="end"
                  >
                    chance (AUC 0.5)
                  </text>

                  {/* AUC area under curve */}
                  <path
                    d={`${rocCurvePath} L 850 280 L 560 280 Z`}
                    fill="rgba(222,93,53,0.10)"
                  />

                  {/* ROC curve */}
                  <path
                    d={rocCurvePath}
                    fill="none"
                    stroke="#DE5D35"
                    strokeWidth="2.5"
                  />

                  {/* Tracing dot synced to the sweep */}
                  <circle r="7" fill="#DE5D35" stroke="#FAF9F5" strokeWidth="2">
                    <animateMotion
                      dur="8s"
                      repeatCount="indefinite"
                      calcMode="linear"
                      path={rocCurvePath}
                    />
                  </circle>

                  <text
                    x="700"
                    y="65"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#DE5D35"
                    fontWeight="bold"
                  >
                    AUC = area in orange
                  </text>
                </svg>
              </div>
              <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                τ far left → (FPR 1, TPR 1) corner · τ far right → origin (0,0)
              </p>
            </div>
          </section>

          {/* Section 02: Probability Densities & Operating Threshold (interactive) */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                  02 / Take The Controls
                </span>
                <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                  Thresholding Class Distributions
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left explanation */}
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  A binary classifier produces continuous risk scores{" "}
                  <MathTex math="S(x) \in [0, 1]" />. To assign a discrete
                  category (<MathTex math="\hat{y} \in \{0, 1\}" />
                  ), we apply a decision threshold <MathTex math="\tau" />:
                </p>
                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[13px]">
                  <MathTex
                    math="\hat{y} = \begin{cases} 1 & \text{if } S(x) \ge \tau \\ 0 & \text{if } S(x) < \tau \end{cases}"
                    block
                  />
                </div>
                <p>
                  Moving <MathTex math="\tau" /> left captures more positive
                  instances (higher sensitivity) at the cost of admitting false
                  alarms. Moving it right reduces false alarms but causes false
                  negatives. Topic 03&apos;s confusion matrix is computed at{" "}
                  <em>one</em> threshold — ROC zooms out to all of them.
                </p>

                {/* Sliders */}
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>THRESHOLD (τ)</span>
                      <span className="font-bold text-[#DE5D35]">
                        {threshold.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.01"
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="w-full accent-[#DE5D35] cursor-pointer"
                      aria-label="Threshold"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>DISTRIBUTION SEPARATION (d&apos;)</span>
                      <span className="font-bold text-[#1A1816]">
                        {separation.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={separation}
                      onChange={(e) =>
                        setSeparation(parseFloat(e.target.value))
                      }
                      className="w-full accent-[#1A1816] cursor-pointer"
                      aria-label="Distribution separation"
                    />
                  </div>
                </div>
              </div>

              {/* Right: SVG Density Chart */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1A1816]" />
                      <span>Class 0 (Negative)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DE5D35]" />
                      <span>Class 1 (Positive)</span>
                    </span>
                  </div>
                  <span className="font-semibold text-[#DE5D35]">
                    τ = {threshold.toFixed(2)}
                  </span>
                </div>

                <div className="relative bg-[#EBF5FB]/30 border border-[#1A1816]/10 p-2 rounded-[2px] h-64 flex items-end">
                  <svg
                    role="img"
                    aria-label="Score distributions for class 0 (negative) and class 1 (positive)"
                    viewBox="0 0 400 200"
                    className="w-full h-full overflow-visible select-none"
                  >
                    <line
                      x1="0"
                      y1="180"
                      x2="400"
                      y2="180"
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="20"
                      x2="0"
                      y2="180"
                      stroke="#1A1816"
                      strokeWidth="1"
                    />

                    <path
                      d={`M 10 180 Q ${simData.negMean * 4} 20, ${(simData.negMean + 25) * 4} 180`}
                      fill="rgba(26,24,22,0.06)"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />

                    <path
                      d={`M ${(simData.posMean - 25) * 4} 180 Q ${simData.posMean * 4} 20, ${(simData.posMean + 25) * 4} 180`}
                      fill="rgba(222,93,53,0.12)"
                      stroke="#DE5D35"
                      strokeWidth="2"
                    />

                    <line
                      x1={simData.tauX * 4}
                      y1="10"
                      x2={simData.tauX * 4}
                      y2="185"
                      stroke="#DE5D35"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    <polygon
                      points={`${simData.tauX * 4 - 5},10 ${simData.tauX * 4 + 5},10 ${simData.tauX * 4},18`}
                      fill="#DE5D35"
                    />
                    <text
                      x={simData.tauX * 4}
                      y="8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontWeight="bold"
                    >
                      τ = {threshold.toFixed(2)}
                    </text>

                    <text
                      x="200"
                      y="196"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      Classifier Score S(x) →
                    </text>
                  </svg>
                </div>

                {/* Metric Readout Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-2.5 bg-[#FAF9F5] border border-[#1A1816]/15 text-center">
                    <span className="block text-[10px] font-mono text-[#75716B]">
                      TRUE POSITIVE RATE
                    </span>
                    <span className="text-[18px] font-bold text-[#DE5D35] font-mono">
                      {(simData.tpr * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F5] border border-[#1A1816]/15 text-center">
                    <span className="block text-[10px] font-mono text-[#75716B]">
                      FALSE POSITIVE RATE
                    </span>
                    <span className="text-[18px] font-bold text-[#1A1816] font-mono">
                      {(simData.fpr * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F5] border border-[#1A1816]/15 text-center">
                    <span className="block text-[10px] font-mono text-[#75716B]">
                      SPECIFICITY (1-FPR)
                    </span>
                    <span className="text-[18px] font-bold text-[#1A1816] font-mono">
                      {((1 - simData.fpr) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF9F5] border border-[#1A1816]/15 text-center">
                    <span className="block text-[10px] font-mono text-[#75716B]">
                      AREA UNDER CURVE
                    </span>
                    <span className="text-[18px] font-bold text-[#DE5D35] font-mono">
                      {simData.auc.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Interactive ROC Curve */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Parametric Space
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Receiver Operating Characteristic
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Graph */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="relative aspect-square max-w-[420px] mx-auto bg-[#F4F1EA] border border-[#1A1816]/15 p-4 rounded-[2px]">
                  <svg
                    role="img"
                    aria-label="ROC curve of true positive rate against false positive rate"
                    viewBox="0 0 300 300"
                    className="w-full h-full overflow-visible select-none"
                  >
                    <line
                      x1="30"
                      y1="270"
                      x2="270"
                      y2="270"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <line
                      x1="30"
                      y1="30"
                      x2="30"
                      y2="270"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />

                    <line
                      x1="30"
                      y1="270"
                      x2="270"
                      y2="30"
                      stroke="#75716B"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {simData.curvePoints.length > 1 && (
                      <path
                        d={`M 30 270 ${simData.curvePoints
                          .map(
                            (p) => `L ${30 + p.fpr * 240} ${270 - p.tpr * 240}`,
                          )
                          .join(" ")} L 270 30`}
                        fill="rgba(222,93,53,0.08)"
                        stroke="#DE5D35"
                        strokeWidth="2.5"
                      />
                    )}

                    <circle
                      cx={30 + simData.fpr * 240}
                      cy={270 - simData.tpr * 240}
                      r="6"
                      fill="#DE5D35"
                      stroke="#FAF9F5"
                      strokeWidth="2"
                    />

                    <text
                      x={Math.min(240, Math.max(50, 30 + simData.fpr * 240))}
                      y={Math.max(45, 270 - simData.tpr * 240 - 12)}
                      fill="#1A1816"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      (FPR: {(simData.fpr * 100).toFixed(0)}%, TPR:{" "}
                      {(simData.tpr * 100).toFixed(0)}%)
                    </text>

                    <text
                      x="150"
                      y="295"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#1A1816"
                    >
                      False Positive Rate (1 - Specificity) →
                    </text>
                    <text
                      x="-150"
                      y="14"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#1A1816"
                      transform="rotate(-90)"
                    >
                      True Positive Rate (Sensitivity) →
                    </text>
                  </svg>
                </div>
              </div>

              {/* Right text & Math */}
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  The ROC curve plots <MathTex math="\text{TPR}" /> against{" "}
                  <MathTex math="\text{FPR}" /> across every continuous choice
                  of threshold <MathTex math="\tau \in [0, 1]" />.
                </p>

                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-1">
                    Area Under Curve (AUC)
                  </span>
                  <MathTex
                    math="\text{AUC} = \int_{0}^{1} \text{TPR}(\tau) \, d\text{FPR}(\tau) = P(S(X^+) > S(X^-))"
                    block
                  />
                </div>

                <p>
                  <strong>Probabilistic Interpretation:</strong> the AUC equals
                  the probability that the classifier ranks a randomly chosen
                  positive observation higher than a randomly chosen negative
                  one. 0.5 is coin-flipping; 1.0 is perfect ranking.
                </p>
                <p>
                  Increasing the separation <MathTex math="d'" /> pushes the
                  curve toward the upper-left corner <MathTex math="(0, 1)" /> —
                  the holy grail where every true positive is caught with zero
                  false alarms.
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    ROC vs Precision-Recall (Topic 03)
                  </span>
                  <p className="text-[13px]">
                    ROC&apos;s FPR divides by the huge negative count, so it
                    stays optimistic under heavy imbalance — a 1% FPR can hide
                    thousands of false alarms. For rare-event detection (fraud,
                    disease), the <strong>precision-recall curve</strong> tells
                    the harsher, more honest story.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 04: What Makes a Good ROC Curve */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / Reading the Shape
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                What Makes a Good ROC Curve?
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Before comparing models, learn the four shapes a ROC curve can
              take. Every classifier you will ever train lands somewhere between
              the first and the last of them.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {ROC_REFERENCE.map((item) => (
                <div
                  key={item.key}
                  className="border border-[#1A1816]/15 bg-[#FAF9F5] p-4"
                >
                  <div className="flex items-center justify-between mb-2 text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-[#75716B]">{item.name}</span>
                    <span className="font-bold" style={{ color: item.stroke }}>
                      AUC {item.auc}
                    </span>
                  </div>
                  <div className="bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] p-2">
                    <svg
                      viewBox="0 0 280 280"
                      className="w-full select-none"
                      role="img"
                      aria-label={`${item.name} ROC curve, area under curve ${item.auc}`}
                    >
                      <line
                        x1="40"
                        y1="240"
                        x2="240"
                        y2="240"
                        stroke={PALETTE.ink}
                        strokeWidth="1.2"
                      />
                      <line
                        x1="40"
                        y1="40"
                        x2="40"
                        y2="240"
                        stroke={PALETTE.ink}
                        strokeWidth="1.2"
                      />
                      <line
                        x1="40"
                        y1="240"
                        x2="240"
                        y2="40"
                        stroke={PALETTE.muted}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      {item.area ? (
                        <path
                          d={item.area}
                          fill={item.stroke}
                          fillOpacity="0.12"
                        />
                      ) : null}
                      <path
                        d={item.d}
                        fill="none"
                        stroke={item.stroke}
                        strokeWidth="2.5"
                      />
                      <text
                        x="140"
                        y="262"
                        fontSize="9"
                        fontFamily="monospace"
                        fill={PALETTE.muted}
                        textAnchor="middle"
                      >
                        FPR →
                      </text>
                      <text
                        x="20"
                        y="140"
                        fontSize="9"
                        fontFamily="monospace"
                        fill={PALETTE.muted}
                        textAnchor="middle"
                        transform="rotate(-90 20 140)"
                      >
                        TPR →
                      </text>
                    </svg>
                  </div>
                  <p className="text-[11px] text-[#4A4742] leading-[1.6] mt-2">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-[14px] text-[#4A4742] leading-[1.7] space-y-4 max-w-3xl">
              <p>
                <strong>The 0.5 baseline.</strong> A curve that tracks the
                dashed diagonal has <MathTex math="\text{TPR} = \text{FPR}" />{" "}
                at every threshold: the score carries no information, so AUC is
                0.5. Below the diagonal means the ranking is systematically
                inverted — AUC drops under 0.5, and simply negating the scores
                would push it back above. An AUC of exactly 0.5 on real data is
                suspicious; an AUC of exactly 1.0 usually means leakage, not
                genius.
              </p>
              <p>
                <strong>The probabilistic reading.</strong> AUC is the
                probability that a randomly chosen positive is scored above a
                randomly chosen negative:{" "}
                <MathTex math="\text{AUC} = P(S(X^{+}) > S(X^{-}))" />. This is
                why it is called a measure of <em>ranking</em> and not of
                accuracy. It also gives a cheap estimator — tally the fraction
                of positive-negative pairs the model orders correctly — which is
                exactly the Wilcoxon–Mann–Whitney U statistic.
              </p>
              <p>
                <strong>The geometric reading.</strong> Literally, AUC is the
                area under the curve:{" "}
                <MathTex math="\int_{0}^{1} \text{TPR} \, d(\text{FPR})" />, an
                average of sensitivity across the entire false-positive range.
                One number, no threshold commitment — the convenience that also
                becomes its blind spot in the next section.
              </p>
            </div>
          </section>

          {/* Section 05: When AUC Misleads */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <LoopedStyles
              css={ROC_MISLEAD_CSS}
              reduceMotionTargets={[
                ".roc-mis-a",
                ".roc-mis-b",
                ".roc-mis-cross",
              ]}
            />
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / The Fine Print
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                When AUC Misleads
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              AUC is a single number squeezed out of a whole curve — and any
              single number can hide the thing you care about. Three failures
              recur in practice.
            </p>

            {/* Looped animation: same area, different shapes */}
            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-[11px] font-mono text-[#75716B]">
                <span>SAME AREA · TWO DIFFERENT MODELS</span>
                <span className="font-semibold text-[#DE5D35]">
                  8s loop · area trades shape, never size
                </span>
              </div>
              <Looped
                label="Looped animation: two ROC curves with identical area cross each other while each area fills and empties in turn, showing that the same AUC can describe very different curves"
                className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px] max-w-[520px] mx-auto"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 380 320"
                  className="w-full select-none"
                >
                  <line
                    x1="40"
                    y1="280"
                    x2="340"
                    y2="280"
                    stroke={PALETTE.ink}
                    strokeWidth="1.2"
                  />
                  <line
                    x1="40"
                    y1="40"
                    x2="40"
                    y2="280"
                    stroke={PALETTE.ink}
                    strokeWidth="1.2"
                  />
                  <line
                    x1="40"
                    y1="280"
                    x2="340"
                    y2="40"
                    stroke={PALETTE.muted}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="190"
                    y="306"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                    textAnchor="middle"
                  >
                    FPR (1 − specificity) →
                  </text>
                  <text
                    x="22"
                    y="160"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                    textAnchor="middle"
                    transform="rotate(-90 22 160)"
                  >
                    TPR →
                  </text>

                  <path
                    d={misleading.areaA}
                    fill={PALETTE.accent}
                    className="roc-mis-a"
                  />
                  <path
                    d={misleading.areaB}
                    fill={PALETTE.ink}
                    className="roc-mis-b"
                  />

                  <path
                    d={misleading.pathA}
                    fill="none"
                    stroke={PALETTE.accent}
                    strokeWidth="2.5"
                  />
                  <path
                    d={misleading.pathB}
                    fill="none"
                    stroke={PALETTE.ink}
                    strokeWidth="2.5"
                    strokeDasharray="7 4"
                  />

                  <circle
                    cx="190"
                    cy={misleading.crossY}
                    r="5"
                    fill={PALETTE.surface}
                    stroke={PALETTE.ink}
                    strokeWidth="2"
                    className="roc-mis-cross"
                  />

                  <text
                    x="66"
                    y="196"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.accent}
                    fontWeight="bold"
                  >
                    A · strong early
                  </text>
                  <text
                    x="250"
                    y="120"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.ink}
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    B · strong late
                  </text>
                  <text
                    x="196"
                    y={misleading.crossY + 18}
                    fontSize="9"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                  >
                    cross
                  </text>
                </svg>
              </Looped>
              <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                Both curves enclose AUC 0.67 · identical area, opposite
                strengths
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  (a) Imbalance Flatters ROC
                </span>
                <p className="text-[12px] text-[#4A4742] leading-[1.65]">
                  FPR divides by the entire negative class, so when negatives
                  dominate, a flood of false alarms still reads as a tiny rate.
                  Take 1,000,000 transactions with 100 fraudulent ones: a model
                  that catches 90 (recall 0.90) while raising 1,000 false alerts
                  sits at{" "}
                  <span className="font-mono text-[11px]">
                    FPR = 1,000/999,900 ≈ 0.001
                  </span>
                  . The ROC point (0.001, 0.90) looks near-perfect. Precision is{" "}
                  <span className="font-mono text-[11px]">90/1,090 ≈ 8.3%</span>{" "}
                  — 92% of the alerts are noise. The PR curve is the honest
                  view; this is exactly the bridge built in Topic 03, section
                  07.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  (b) Ranking ≠ Calibration
                </span>
                <p className="text-[12px] text-[#4A4742] leading-[1.65]">
                  AUC only checks the <em>order</em> of the scores, never their
                  magnitude. A model that emits 0.51 for every positive and 0.49
                  for every negative has AUC 1.0 and probabilities that are
                  worthless: a policy acting above 0.30 never fires, and a risk
                  score that never exceeds 0.51 cannot feed an expected-loss
                  calculation. Whenever a decision needs real probabilities —
                  pricing, triage bands, cost models — read a reliability
                  diagram and the Brier score. AUC is blind to calibration.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  (c) A Global Average Hides Bands
                </span>
                <p className="text-[12px] text-[#4A4742] leading-[1.65]">
                  AUC averages TPR across the <em>whole</em> false-positive
                  range, including regions your workflow never visits. One
                  triage model can be excellent only inside the 10–20% risk band
                  where your team actually acts and poor everywhere else;
                  another can be uniformly mediocre. Both can land at AUC 0.80.
                  If your application lives in a narrow operating band, the
                  global average hides it — inspect the partial AUC, or zoom the
                  PR curve to that band.
                </p>
              </div>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/resources/precision-recall"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
            >
              <span>
                ← Topic 03: Confusion Matrix, Precision-Recall &amp; F1
              </span>
            </Link>
            <Link
              href="/resources/cross-validation"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
            >
              <span>Topic 05: K-Fold Cross-Validation →</span>
            </Link>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
