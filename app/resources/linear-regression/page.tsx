"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles } from "@/components/looped";
import MathTex from "@/components/MathTex";

// Section 05: the six classical regression assumptions
const ASSUMPTIONS: { name: string; math: string; test: string }[] = [
  {
    name: "Validity",
    math: "y = f(x_1, \\dots, x_p) + \\varepsilon",
    test: "Do the features and the target still mean what the decision needs?",
  },
  {
    name: "Representativeness",
    math: "\\hat{\\beta} \\to \\beta \\text{ as } n \\to N_{\\text{pop}}",
    test: "Would a fresh case from deployment look at home in your training rows?",
  },
  {
    name: "Additivity & Linearity",
    math: "y = \\beta_0 + \\beta_1 x_1 + \\cdots + \\beta_p x_p + \\varepsilon",
    test: "Plot residuals against fitted values — a curve hiding there breaks the straight-line claim.",
  },
  {
    name: "Independence of Errors",
    math: "\\text{Cov}(e_i, e_j) = 0 \\quad i \\neq j",
    test: "Do residuals drift with collection order, time, or group?",
  },
  {
    name: "Homoscedasticity",
    math: "\\text{Var}(e_i) = \\sigma^2 \\quad \\text{for all } i",
    test: "Does the residual cloud fan out as predictions grow?",
  },
  {
    name: "Normality of Errors",
    math: "e_i \\sim \\mathcal{N}(0, \\sigma^2)",
    test: "Read a QQ plot — this one buys valid confidence intervals, not better predictions.",
  },
];

// Section 05: residual-vs-fitted scatter for the variance loop and its static twin
const HET_LEFT = [
  { x: 62, e: 9 },
  { x: 82, e: -8 },
  { x: 104, e: 8 },
  { x: 128, e: -9 },
  { x: 152, e: 8 },
  { x: 178, e: -9 },
];
const HET_RIGHT = [
  { x: 212, e: 12 },
  { x: 236, e: -16 },
  { x: 262, e: 20 },
  { x: 288, e: -13 },
  { x: 316, e: 24 },
  { x: 344, e: -18 },
];
const HOMO_POINTS = [
  { x: 62, e: 11 },
  { x: 92, e: -10 },
  { x: 122, e: 12 },
  { x: 152, e: -11 },
  { x: 182, e: 10 },
  { x: 212, e: -12 },
  { x: 242, e: 11 },
  { x: 272, e: -10 },
  { x: 302, e: 12 },
  { x: 332, e: -11 },
];

// Section 05 loop: the right half of the residual cloud fans open while the left
// half barely moves — a funnel that never settles. Anchored on the e = 0 line.
const hetCss = `
    @keyframes lrHetOpen {
      0%, 100% { transform: scaleY(0.75); }
      55%      { transform: scaleY(1.85); }
    }
    @keyframes lrHetBreathe {
      0%, 100% { transform: scaleY(1); }
      55%      { transform: scaleY(1.12); }
    }
    .lr-het-r { transform-box: view-box; transform-origin: 0px 150px; animation: lrHetOpen 6s ease-in-out infinite; }
    .lr-het-l { transform-box: view-box; transform-origin: 0px 150px; animation: lrHetBreathe 6s ease-in-out infinite; }
  `;

export default function LinearRegressionArticlePage() {
  const [slope, setSlope] = useState<number>(0.8);
  const [intercept, setIntercept] = useState<number>(15);

  // Observed points
  const points = useMemo(
    () => [
      { x: 10, y: 22 },
      { x: 20, y: 38 },
      { x: 30, y: 32 },
      { x: 40, y: 55 },
      { x: 50, y: 62 },
      { x: 60, y: 58 },
      { x: 70, y: 79 },
      { x: 80, y: 84 },
      { x: 90, y: 92 },
    ],
    [],
  );

  // Analytical optimal OLS solution
  const optimalOLS = useMemo(() => {
    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    points.forEach((p) => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
    });

    const mOpt = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const cOpt = (sumY - mOpt * sumX) / n;

    return { mOpt, cOpt };
  }, [points]);

  // Residuals and MSE for the current manual fit
  const metrics = useMemo(() => {
    let sumSqError = 0;
    const residuals = points.map((p) => {
      const yPred = slope * p.x + intercept;
      const error = p.y - yPred;
      sumSqError += error * error;
      return {
        ...p,
        yPred,
        error,
      };
    });

    const mse = sumSqError / points.length;
    const rSquared = 1 - sumSqError / 4680;

    return {
      residuals,
      mse,
      rSquared: Math.max(0, Math.min(1, rSquared)),
    };
  }, [slope, intercept, points]);

  // Section 06: the four fit scores on this dataset, evaluated at the OLS optimum
  const fitScores = useMemo(() => {
    const n = points.length;
    const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;
    let sse = 0;
    let sae = 0;
    let tss = 0;

    points.forEach((p) => {
      const yPred = optimalOLS.mOpt * p.x + optimalOLS.cOpt;
      const error = p.y - yPred;
      sse += error * error;
      sae += Math.abs(error);
      tss += (p.y - meanY) ** 2;
    });

    const mse = sse / n;
    return {
      n,
      sse,
      sae,
      tss,
      mse,
      rmse: Math.sqrt(mse),
      mae: sae / n,
      r2: 1 - sse / tss,
    };
  }, [points, optimalOLS]);

  const handleSnapToOptimal = () => {
    setSlope(parseFloat(optimalOLS.mOpt.toFixed(3)));
    setIntercept(parseFloat(optimalOLS.cOpt.toFixed(2)));
  };

  // Section 01 hero animation data (SVG coords: x 40..360, y 20..200)
  const heroPoints = [
    { x: 60, y: 150 },
    { x: 100, y: 118 },
    { x: 140, y: 132 },
    { x: 180, y: 96 },
    { x: 220, y: 84 },
    { x: 260, y: 70 },
    { x: 300, y: 52 },
    { x: 340, y: 40 },
  ];

  const css = `
    @keyframes lrFitSweep {
      0%, 100% { transform: rotate(-8deg); }
      50%      { transform: rotate(8deg); }
    }
    @keyframes lrResidualPulse {
      0%, 100% { opacity: 0.25; }
      50%      { opacity: 1; }
    }
    @keyframes lrBallDrop {
      0%   { opacity: 0; offset-distance: 0%; }
      8%   { opacity: 1; }
      82%  { opacity: 1; offset-distance: 100%; }
      90%, 100% { opacity: 0; offset-distance: 100%; }
    }
    @keyframes lrZigzag {
      0%   { opacity: 0; offset-distance: 0%; }
      6%   { opacity: 1; }
      82%  { opacity: 1; offset-distance: 100%; }
      90%, 100% { opacity: 0; offset-distance: 100%; }
    }
    @keyframes lrStepFade {
      0%, 10%  { opacity: 0; }
      25%      { opacity: 1; }
      85%      { opacity: 0.9; }
      100%     { opacity: 0; }
    }
    .lr-sweep { transform-origin: 200px 110px; animation: lrFitSweep 7s ease-in-out infinite; }
    .lr-res { animation: lrResidualPulse 7s ease-in-out infinite; }
    .lr-ball { offset-rotate: 0deg; animation: lrBallDrop 5.5s cubic-bezier(0.45, 0, 0.7, 1) infinite; }
    .lr-zig  { offset-rotate: 0deg; animation: lrZigzag 5.5s linear infinite; }
    .lr-step { animation: lrStepFade 5.5s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .lr-sweep, .lr-res, .lr-ball, .lr-zig, .lr-step { animation: none; }
    }
  `;

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
                Regression · Linear Regression
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 01
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              Linear Regression: Ordinary Least Squares
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              The first model everyone learns — and the one everything else is
              built on. Watch a line hunt for the best fit, drag your own
              residuals, and race gradient descent against the closed-form
              solution.
            </p>
          </header>

          {/* Section 01: Looped hero animation — the line hunting for the fit */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / The Line That Hunts
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                What Does &ldquo;Fitting a Line&rdquo; Actually Mean?
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  You have data: hours studied vs exam score. Linear regression
                  draws the straight line <MathTex math="\hat{y} = mx + c" />{" "}
                  that comes closest to all points at once —{" "}
                  <MathTex math="m" /> is the <strong>slope</strong> (how much
                  the score rises per extra hour) and <MathTex math="c" /> is
                  the <strong>intercept</strong> (the baseline score).
                </p>
                <p>
                  But &ldquo;closest&rdquo; needs a definition. For every point
                  we measure the <strong>residual</strong>{" "}
                  <MathTex math="e_i = y_i - \hat{y}_i" /> — the vertical gap
                  between truth and prediction. We square each gap (so negatives
                  don&apos;t cancel positives) and add them up:
                </p>
                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[13px]">
                  <MathTex
                    math="\text{SSE} = \sum_{i=1}^N (y_i - (mx_i + c))^2"
                    block
                  />
                </div>
                <p>
                  In the animation, the orange line is a candidate fit sweeping
                  through angles — too steep, too flat, too steep again. The red
                  dashed segments are the residuals it leaves behind.
                  <strong>
                    {" "}
                    The best line is the one minimizing the total squared length
                    of those red segments
                  </strong>{" "}
                  — Ordinary Least Squares (OLS).
                </p>
              </div>

              {/* Looped sweep animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>CANDIDATE LINE SWEEPING ↔</span>
                  <span className="font-bold text-[#DE5D35]">
                    minimize Σ e²
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 400 230"
                    className="w-full select-none overflow-visible"
                    role="img"
                    aria-label="Animated regression line sweeping across a scatter plot"
                  >
                    {/* Axes */}
                    <line
                      x1="40"
                      y1="200"
                      x2="370"
                      y2="200"
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <line
                      x1="40"
                      y1="20"
                      x2="40"
                      y2="200"
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <text
                      x="205"
                      y="220"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      hours studied →
                    </text>
                    <text
                      x="-105"
                      y="14"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                      transform="rotate(-90)"
                    >
                      exam score →
                    </text>

                    {/* Optimal OLS reference line (dashed ink) */}
                    <line
                      x1="52"
                      y1={200 - (0.62 * 52 - 4)}
                      x2="352"
                      y2={200 - (0.62 * 352 - 4)}
                      stroke="#75716B"
                      strokeWidth="1"
                      strokeDasharray="5 4"
                    />
                    <text
                      x="330"
                      y={200 - (0.62 * 330 - 4) - 8}
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#75716B"
                      textAnchor="end"
                    >
                      best fit (OLS)
                    </text>

                    {/* Sweeping candidate line + its residuals */}
                    <g className="lr-sweep">
                      <line
                        x1="45"
                        y1="168"
                        x2="360"
                        y2="32"
                        stroke="#DE5D35"
                        strokeWidth="2"
                      />
                      {heroPoints.map((p, i) => {
                        const t = (p.x - 45) / (360 - 45);
                        const lineY = 168 + t * (32 - 168);
                        const clipped = Math.max(24, Math.min(200, lineY));
                        return (
                          <line
                            key={i}
                            className="lr-res"
                            style={{ animationDelay: `${i * 0.35}s` }}
                            x1={p.x}
                            y1={p.y}
                            x2={p.x}
                            y2={clipped}
                            stroke="#EF4444"
                            strokeWidth="1.2"
                            strokeDasharray="4 3"
                          />
                        );
                      })}
                    </g>

                    {/* Data points on top */}
                    {heroPoints.map((p, i) => (
                      <circle
                        key={`pt-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="#1A1816"
                        stroke="#FAF9F5"
                        strokeWidth="1.5"
                      />
                    ))}
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  The dashed ink line never moves — OLS already found it.
                </p>
              </div>
            </div>
          </section>

          {/* Section 02: Interactive residual sandbox */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                  02 / Residual Geometry
                </span>
                <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                  Sandbox: Steal the Line Yourself
                </h2>
              </div>
              <button
                type="button"
                onClick={handleSnapToOptimal}
                className="px-3.5 py-1.5 bg-[#DE5D35] text-white text-[11px] font-mono tracking-wider uppercase font-bold hover:bg-[#c94d27] transition-colors cursor-pointer self-start sm:self-auto"
              >
                Snap to Analytical OLS Solution
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sliders & Math */}
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Drag the slope and intercept and watch the squared error
                  react. Can you beat the computer&apos;s answer before you
                  press the snap button?
                </p>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>SLOPE (m)</span>
                      <span className="font-bold text-[#DE5D35]">
                        {slope.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.8"
                      step="0.02"
                      value={slope}
                      onChange={(e) => setSlope(parseFloat(e.target.value))}
                      className="w-full accent-[#DE5D35] cursor-pointer"
                      aria-label="Slope"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>INTERCEPT (c)</span>
                      <span className="font-bold text-[#1A1816]">
                        {intercept.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="40"
                      step="0.5"
                      value={intercept}
                      onChange={(e) => setIntercept(parseFloat(e.target.value))}
                      className="w-full accent-[#1A1816] cursor-pointer"
                      aria-label="Intercept"
                    />
                  </div>
                </div>

                {/* Error Readout */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[10px] font-mono text-[#75716B]">
                      MEAN SQUARED ERROR
                    </span>
                    <span className="text-[18px] font-mono font-bold text-[#DE5D35]">
                      {metrics.mse.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[10px] font-mono text-[#75716B]">
                      COEFFICIENT R²
                    </span>
                    <span className="text-[18px] font-mono font-bold text-[#1A1816]">
                      {metrics.rSquared.toFixed(3)}
                    </span>
                  </div>
                </div>

                <p>
                  Notice that <MathTex math="R^2" /> reads as{" "}
                  <em>
                    &ldquo;the fraction of variance the line explains&rdquo;
                  </em>{" "}
                  — 0 means the line is no better than predicting the mean,{" "}
                  <MathTex math="1.0" /> means a perfect fit through every
                  point.
                </p>
              </div>

              {/* Right: SVG Scatter & Residuals Canvas */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>RESIDUALS (VERTICAL DISTANCES)</span>
                  <span className="font-bold text-[#DE5D35]">
                    ŷ = {slope.toFixed(2)}x + {intercept.toFixed(1)}
                  </span>
                </div>

                <div className="relative bg-[#EBF5FB]/30 border border-[#1A1816]/10 p-2 rounded-[2px] h-72 flex items-end">
                  <svg
                    role="img"
                    aria-label="Scatter plot with a fitted regression line and its residuals"
                    viewBox="0 0 100 100"
                    className="w-full h-full overflow-visible select-none"
                  >
                    <line
                      x1="5"
                      y1="95"
                      x2="95"
                      y2="95"
                      stroke="#1A1816"
                      strokeWidth="0.6"
                    />
                    <line
                      x1="5"
                      y1="5"
                      x2="5"
                      y2="95"
                      stroke="#1A1816"
                      strokeWidth="0.6"
                    />

                    {metrics.residuals.map((r, idx) => {
                      const svgX = r.x;
                      const svgYActual = 100 - r.y;
                      const svgYPred = 100 - r.yPred;
                      return (
                        <line
                          key={idx}
                          x1={svgX}
                          y1={svgYActual}
                          x2={svgX}
                          y2={svgYPred}
                          stroke="#EF4444"
                          strokeWidth="0.8"
                          strokeDasharray="1.5 1.5"
                        />
                      );
                    })}

                    <line
                      x1="5"
                      y1={100 - (slope * 5 + intercept)}
                      x2="95"
                      y2={100 - (slope * 95 + intercept)}
                      stroke="#DE5D35"
                      strokeWidth="1.6"
                    />

                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={100 - p.y}
                        r="2.2"
                        fill="#1A1816"
                        stroke="#FAF9F5"
                        strokeWidth="0.6"
                      />
                    ))}
                  </svg>
                </div>

                <p className="text-[12px] font-mono text-[#75716B] mt-3 text-center">
                  Red dashed hairlines are the errors <MathTex math="e_i" />.
                  OLS minimizes the sum of their squares.
                </p>
              </div>
            </div>
          </section>

          {/* Section 03: Gradient descent looped animation */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Two Ways Down the Bowl
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Normal Equations vs Gradient Descent
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  The error is a <strong>bowl</strong> over the parameter space
                  — every pair <MathTex math="(m, c)" /> is a point on its
                  surface, and the height is the MSE. There are two classic ways
                  to reach the bottom:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Closed-Form Normal Equation
                  </span>
                  <MathTex
                    math="\mathbf{\beta}^* = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{y}"
                    block
                  />
                  <p className="text-[12px] text-[#75716B] mt-2">
                    One matrix inversion teleports you straight to the bottom.
                    Exact — but <MathTex math="\mathcal{O}(D^3)" /> cost makes
                    it impractical for huge feature counts.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Gradient Descent Update
                  </span>
                  <MathTex
                    math="\beta_{t+1} = \beta_t - \eta \nabla_\beta \, \text{MSE}"
                    block
                  />
                  <p className="text-[12px] text-[#75716B] mt-2">
                    Take small steps <MathTex math="\eta" /> downhill, opposite
                    the gradient. Cheap per step, iterative — and the learning
                    rate is everything: too small crawls, too large overshoots
                    and zigzags (watch the ink ball).
                  </p>
                </div>
              </div>

              {/* Looped descent animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DE5D35]" />
                      <span>η = 0.3 (smooth)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1A1816]" />
                      <span>η = 1.6 (overshooting)</span>
                    </span>
                  </div>
                  <span>MSE SURFACE · m</span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 400 250"
                    className="w-full select-none"
                    role="img"
                    aria-label="Two animated balls descending a parabolic loss surface"
                  >
                    {/* Bowl */}
                    <path
                      d="M 60 55 Q 200 345 340 55"
                      fill="rgba(222,93,53,0.06)"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                    />
                    <text
                      x="200"
                      y="238"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      slope m → (c fixed) · minimum at m*
                    </text>

                    {/* Step trail for the smooth ball */}
                    {[70, 88, 109, 134, 162, 191].map((x, i) => {
                      const t = (x - 60) / 280;
                      const y =
                        55 + (3 * (200 - 55) * t * (1 - t)) / 1.5 + t * t * 190;
                      return (
                        <circle
                          key={i}
                          className="lr-step"
                          style={{ animationDelay: `${i * 0.55}s` }}
                          cx={x}
                          cy={Math.min(200, y)}
                          r="3"
                          fill="none"
                          stroke="#DE5D35"
                          strokeWidth="1.2"
                        />
                      );
                    })}

                    {/* Smooth ball follows the bowl */}
                    <circle r="7" fill="#DE5D35" className="lr-ball">
                      <animateMotion
                        dur="5.5s"
                        repeatCount="indefinite"
                        path="M 60 55 Q 200 345 200 200"
                      />
                    </circle>

                    {/* Overshooting ball zigzags across the bowl */}
                    <circle r="7" fill="#1A1816" className="lr-zig">
                      <animateMotion
                        dur="5.5s"
                        repeatCount="indefinite"
                        path="M 60 55 L 305 95 L 105 150 L 268 175 L 165 195 L 200 200"
                      />
                    </circle>

                    {/* Minimum marker */}
                    <line
                      x1="200"
                      y1="200"
                      x2="200"
                      y2="230"
                      stroke="#75716B"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />
                    <text
                      x="212"
                      y="215"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#75716B"
                    >
                      m* (global min)
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  Both balls want the same minimum — only the journey differs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 04: Regression metrics & assumptions */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / Judging a Regression
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Metrics &amp; the Fine Print
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[12px] font-bold uppercase tracking-wider text-[#DE5D35] mb-2">
                  MSE / RMSE
                </span>
                <MathTex
                  math="\text{RMSE} = \sqrt{\tfrac{1}{N}\sum (y_i - \hat{y}_i)^2}"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  Squaring makes outliers scream — a single point 10× off hurts
                  100× more. RMSE returns to the target&apos;s units.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[12px] font-bold uppercase tracking-wider text-[#DE5D35] mb-2">
                  MAE
                </span>
                <MathTex
                  math="\text{MAE} = \tfrac{1}{N}\sum |y_i - \hat{y}_i|"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  Every error counts linearly — robust to outliers. Pick MAE
                  when a few wild points shouldn&apos;t dominate the score.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[12px] font-bold uppercase tracking-wider text-[#DE5D35] mb-2">
                  R² (Coefficient of Determination)
                </span>
                <MathTex
                  math="R^2 = 1 - \frac{\text{SSE}}{\sum (y_i - \bar{y})^2}"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  Variance explained vs a mean-only baseline. Comparable across
                  datasets — but a high R² never implies causation.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[12px] font-bold uppercase tracking-wider text-[#1A1816] mb-2">
                  Assumptions (The Fine Print)
                </span>
                <ul className="text-[12px] text-[#4A4742] leading-[1.7] list-none space-y-1">
                  <li>
                    <strong>Linearity</strong> — the relationship really is
                    straight.
                  </li>
                  <li>
                    <strong>Independence</strong> — errors don&apos;t correlate
                    (no time leakage).
                  </li>
                  <li>
                    <strong>Homoscedasticity</strong> — error spread is
                    constant, not funnel-shaped.
                  </li>
                  <li>
                    <strong>Normal residuals</strong> — needed for valid
                    confidence intervals.
                  </li>
                </ul>
              </div>
            </div>

            {/* Reference optimum */}
            <div className="p-4 bg-[#1A1816] text-[#FAF9F5] font-mono text-[12px]">
              <span className="text-[#DE5D35] font-bold">
                OPTIMAL SOLUTION FOR THE SANDBOX DATASET:
              </span>
              <span className="ml-3">
                m* = {optimalOLS.mOpt.toFixed(3)}, c* ={" "}
                {optimalOLS.cOpt.toFixed(2)}
              </span>
            </div>
          </section>

          {/* Section 05: Regression assumptions */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / The Fine Print
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Six Assumptions Holding the Line Up
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              OLS will hand you coefficients no matter how badly the data
              misbehaves. These six assumptions are the conditions under which
              those coefficients mean what the textbook says they mean. Read
              each one as a question you can ask of a residual plot.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {ASSUMPTIONS.map((a) => (
                <div
                  key={a.name}
                  className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15"
                >
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    {a.name}
                  </span>
                  <MathTex math={a.math} block />
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mt-3 mb-1">
                    Test
                  </span>
                  <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                    {a.test}
                  </p>
                </div>
              ))}
            </div>

            {/* Looped funnel vs the homoscedastic ideal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
              <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>RESIDUALS vs FITTED · HETEROSCEDASTIC</span>
                  <span className="font-bold text-[#DE5D35]">
                    spread grows with ŷ
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <LoopedStyles
                    css={hetCss}
                    reduceMotionTargets={[".lr-het-l", ".lr-het-r"]}
                  />
                  <Looped label="Animated residual plot whose vertical spread fans open and snaps shut, widest at high fitted values">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 400 240"
                      className="w-full select-none overflow-visible"
                    >
                      <line
                        x1="40"
                        y1="215"
                        x2="375"
                        y2="215"
                        stroke="#1A1816"
                        strokeWidth="1"
                      />
                      <line
                        x1="40"
                        y1="30"
                        x2="40"
                        y2="215"
                        stroke="#1A1816"
                        strokeWidth="1"
                      />
                      <line
                        x1="40"
                        y1="150"
                        x2="375"
                        y2="150"
                        stroke="#75716B"
                        strokeWidth="1"
                        strokeDasharray="5 4"
                      />

                      {/* Static funnel envelope */}
                      <line
                        x1="50"
                        y1="142"
                        x2="358"
                        y2="116"
                        stroke="#DE5D35"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.45"
                      />
                      <line
                        x1="50"
                        y1="158"
                        x2="358"
                        y2="184"
                        stroke="#DE5D35"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.45"
                      />

                      {/* Left cluster — barely moves */}
                      <g className="lr-het-l">
                        {HET_LEFT.map((p) => (
                          <g key={`hl-${p.x}`}>
                            <line
                              x1={p.x}
                              y1="150"
                              x2={p.x}
                              y2={150 - p.e}
                              stroke="#EF4444"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                              opacity="0.5"
                            />
                            <circle
                              cx={p.x}
                              cy={150 - p.e}
                              r="4.5"
                              fill="#1A1816"
                              stroke="#FAF9F5"
                              strokeWidth="1.5"
                            />
                          </g>
                        ))}
                      </g>

                      {/* Right cluster — fans open */}
                      <g className="lr-het-r">
                        {HET_RIGHT.map((p) => (
                          <g key={`hr-${p.x}`}>
                            <line
                              x1={p.x}
                              y1="150"
                              x2={p.x}
                              y2={150 - p.e}
                              stroke="#EF4444"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                              opacity="0.5"
                            />
                            <circle
                              cx={p.x}
                              cy={150 - p.e}
                              r="4.5"
                              fill="#1A1816"
                              stroke="#FAF9F5"
                              strokeWidth="1.5"
                            />
                          </g>
                        ))}
                      </g>

                      <text
                        x="205"
                        y="232"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill="#75716B"
                      >
                        fitted value ŷ →
                      </text>
                      <text
                        x="-125"
                        y="14"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill="#75716B"
                        transform="rotate(-90)"
                      >
                        residual e →
                      </text>
                      <text
                        x="356"
                        y="110"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                        fill="#DE5D35"
                      >
                        growing envelope
                      </text>
                    </svg>
                  </Looped>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  The cloud fans open and snaps shut — variance is not constant.
                </p>
              </div>

              <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>RESIDUALS vs FITTED · HOMOSCEDASTIC</span>
                  <span className="font-bold text-[#1A1816]">
                    assumed · spread = σ²
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 400 240"
                    className="w-full select-none overflow-visible"
                    role="img"
                    aria-label="Static residual plot with constant vertical spread across all fitted values"
                  >
                    <line
                      x1="40"
                      y1="215"
                      x2="375"
                      y2="215"
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <line
                      x1="40"
                      y1="30"
                      x2="40"
                      y2="215"
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <line
                      x1="40"
                      y1="150"
                      x2="375"
                      y2="150"
                      stroke="#75716B"
                      strokeWidth="1"
                      strokeDasharray="5 4"
                    />

                    {/* Constant-variance band */}
                    <line
                      x1="50"
                      y1="138"
                      x2="375"
                      y2="138"
                      stroke="#1A1816"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.35"
                    />
                    <line
                      x1="50"
                      y1="162"
                      x2="375"
                      y2="162"
                      stroke="#1A1816"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.35"
                    />

                    {HOMO_POINTS.map((p) => (
                      <g key={`ho-${p.x}`}>
                        <line
                          x1={p.x}
                          y1="150"
                          x2={p.x}
                          y2={150 - p.e}
                          stroke="#EF4444"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                          opacity="0.5"
                        />
                        <circle
                          cx={p.x}
                          cy={150 - p.e}
                          r="4.5"
                          fill="#1A1816"
                          stroke="#FAF9F5"
                          strokeWidth="1.5"
                        />
                      </g>
                    ))}

                    <text
                      x="205"
                      y="232"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      fitted value ŷ →
                    </text>
                    <text
                      x="-125"
                      y="14"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                      transform="rotate(-90)"
                    >
                      residual e →
                    </text>
                    <text
                      x="356"
                      y="132"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#1A1816"
                    >
                      constant envelope
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  The ideal the assumption asks for — same width everywhere.
                </p>
              </div>
            </div>

            {/* When assumptions fail */}
            <div className="p-5 bg-[#1A1816] text-[#FAF9F5]">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                When Assumptions Fail
              </span>
              <p className="text-[14px] leading-[1.7] text-[#FAF9F5]/80 max-w-3xl mb-4">
                A violated assumption is not an automatic failure. In machine
                learning the test is narrower:{" "}
                <strong className="text-[#FAF9F5]">
                  does the model generalize to unseen data?
                </strong>{" "}
                A predictor that scores well on a held-out set is still useful
                even when its errors are lumpy or its residuals are not
                Gaussian. Statistical purity matters most when you are making{" "}
                <em>inferences</em> — confidence intervals, p-values, causal
                claims — and far less when you are shipping predictions. So
                start by asking whether the assumption even applies to your
                question.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 border border-[#FAF9F5]/15">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-1">
                    Transform the data
                  </span>
                  <p className="text-[12px] text-[#FAF9F5]/60 leading-[1.6]">
                    Logs or square roots tame a fanning residual cloud and
                    straighten a multiplicative relationship.
                  </p>
                </div>
                <div className="p-3 border border-[#FAF9F5]/15">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-1">
                    Extend the model
                  </span>
                  <p className="text-[12px] text-[#FAF9F5]/60 leading-[1.6]">
                    Add interaction or polynomial terms, or move to something
                    that bends — splines, GAMs, trees.
                  </p>
                </div>
                <div className="p-3 border border-[#FAF9F5]/15">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-1">
                    Gather more data
                  </span>
                  <p className="text-[12px] text-[#FAF9F5]/60 leading-[1.6]">
                    Widen the sample until it represents the population you
                    actually deploy to.
                  </p>
                </div>
                <div className="p-3 border border-[#FAF9F5]/15">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-1">
                    Restrict the question
                  </span>
                  <p className="text-[12px] text-[#FAF9F5]/60 leading-[1.6]">
                    Narrow the claim or the input range until the data can
                    honestly support it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 06: Scoring the fit */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                06 / Scoring The Fit
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                MSE, RMSE, MAE &amp; R² — Four Lenses on One Error
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              All four scores are computed from the same residuals. They differ
              only in how they weigh a miss — and that choice is a statement
              about what you care about.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#DE5D35]">
                    MSE
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    Mean Squared Error
                  </span>
                </div>
                <MathTex
                  math="\text{MSE} = \frac{1}{N}\sum_{i=1}^N (y_i - \hat{y}_i)^2"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  <strong>Units:</strong> squared target units — score², ₹²,
                  whatever <MathTex math="y" /> is measured in.
                </p>
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                  <strong>Failure mode:</strong> punishes outliers quadratically
                  — an error twice as large contributes four times as much.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#DE5D35]">
                    RMSE
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    Root Mean Squared Error
                  </span>
                </div>
                <MathTex
                  math="\text{RMSE} = \sqrt{\frac{1}{N}\sum_{i=1}^N (y_i - \hat{y}_i)^2}"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  <strong>Units:</strong> the target&apos;s own units —{" "}
                  <MathTex math="\sqrt{\text{MSE}}" /> is why RMSE is the score
                  you report out loud.
                </p>
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                  <strong>Failure mode:</strong> the square is still inside the
                  root, so one wild point can set your headline number.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#1A1816]">
                    MAE
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    Mean Absolute Error
                  </span>
                </div>
                <MathTex
                  math="\text{MAE} = \frac{1}{N}\sum_{i=1}^N |y_i - \hat{y}_i|"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  <strong>Units:</strong> target units — directly readable as
                  &ldquo;the average miss&rdquo;.
                </p>
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                  <strong>Failure mode:</strong> robust to outliers, but{" "}
                  <MathTex math="|\cdot|" /> is non-differentiable at{" "}
                  <MathTex math="0" />, and a fat tail of medium errors hides
                  inside the same average.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#1A1816]">
                    R²
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    Coefficient of Determination
                  </span>
                </div>
                <MathTex
                  math="R^2 = 1 - \frac{\sum_i (y_i - \hat{y}_i)^2}{\sum_i (y_i - \bar{y})^2}"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  <strong>Units:</strong> dimensionless — <MathTex math="1" />{" "}
                  is perfect, <MathTex math="0" /> is no better than the mean,
                  negative is worse than the mean.
                </p>
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                  <strong>Failure mode:</strong> always rises as you add
                  features, even pure noise — never compare R² across models
                  with different feature counts. Use adjusted R² or a held-out
                  set.
                </p>
              </div>
            </div>

            {/* Worked numbers strip */}
            <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px]">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-3">
                Worked · Study-Hours Dataset at the OLS Optimum (N ={" "}
                {fitScores.n})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#75716B]">
                    MSE
                  </span>
                  <span className="text-[18px] font-bold text-[#DE5D35]">
                    {fitScores.mse.toFixed(2)}
                  </span>
                  <span className="block text-[10px] text-[#75716B]">
                    SSE / N = {fitScores.sse.toFixed(2)} / {fitScores.n}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#75716B]">
                    RMSE
                  </span>
                  <span className="text-[18px] font-bold text-[#1A1816]">
                    {fitScores.rmse.toFixed(2)}
                  </span>
                  <span className="block text-[10px] text-[#75716B]">
                    √{fitScores.mse.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#75716B]">
                    MAE
                  </span>
                  <span className="text-[18px] font-bold text-[#DE5D35]">
                    {fitScores.mae.toFixed(2)}
                  </span>
                  <span className="block text-[10px] text-[#75716B]">
                    Σ|e| / N = {fitScores.sae.toFixed(2)} / {fitScores.n}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#75716B]">
                    R²
                  </span>
                  <span className="text-[18px] font-bold text-[#1A1816]">
                    {fitScores.r2.toFixed(3)}
                  </span>
                  <span className="block text-[10px] text-[#75716B]">
                    1 − {fitScores.sse.toFixed(2)} / {fitScores.tss.toFixed(0)}
                  </span>
                </div>
              </div>
              <p className="text-[12px] text-[#75716B] mt-3 leading-[1.6]">
                RMSE ({fitScores.rmse.toFixed(2)}) sits above MAE (
                {fitScores.mae.toFixed(2)}) — that gap is the outlier signature.
                When the two converge, errors are evenly sized; when RMSE runs
                away, a handful of points are carrying the score.
              </p>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
            >
              <span>← Back to Archive Index</span>
            </Link>
            <Link
              href="/resources/logistic-regression"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
            >
              <span>Topic 02: Logistic Regression →</span>
            </Link>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
