"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles, PALETTE } from "@/components/looped";
import MathTex from "@/components/MathTex";

// Synthetic 1D data points for logistic classification
const dataPoints = [
  { x: -4, y: 0 },
  { x: -3, y: 0 },
  { x: -2, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 4, y: 1 },
  { x: 5, y: 1 },
];

export default function LogisticRegressionArticlePage() {
  const [weight, setWeight] = useState<number>(1.2);
  const [bias, setBias] = useState<number>(-2.4);
  const [coef, setCoef] = useState<number>(1.2);

  // Section 05: one-unit push on the logit, read back as a probability at p = 0.5
  const oddsMult = Math.exp(coef);
  const pFromHalf = oddsMult / (1 + oddsMult);

  // Sigmoid probabilities and cross-entropy loss for current weights
  const stats = useMemo(() => {
    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
    let totalLoss = 0;

    const predictions = dataPoints.map((pt) => {
      const z = weight * pt.x + bias;
      const prob = sigmoid(z);
      const eps = 1e-6;
      const loss = -(
        pt.y * Math.log(prob + eps) +
        (1 - pt.y) * Math.log(1 - prob + eps)
      );
      totalLoss += loss;
      return { ...pt, prob };
    });

    const bceLoss = totalLoss / dataPoints.length;
    const boundaryX = weight !== 0 ? -bias / weight : 0;

    return {
      bceLoss,
      boundaryX,
      predictions,
    };
  }, [weight, bias]);

  // Static sigmoid path for the hero animation (generic σ, w=1, b=0)
  const sigmoidPath = Array.from({ length: 111 }, (_, i) => {
    const xVal = -5.5 + i * 0.1;
    const p = 1 / (1 + Math.exp(-xVal));
    return `${i === 0 ? "M" : "L"} ${xVal * 10} ${100 - p * 100}`;
  }).join(" ");

  const css = `
    @keyframes lr2DrawS {
      0%       { stroke-dashoffset: 460; }
      55%, 92% { stroke-dashoffset: 0; }
      100%     { stroke-dashoffset: 0; opacity: 0.35; }
    }
    .lr2-scurve {
      stroke-dasharray: 460;
      animation: lr2DrawS 7s ease-in-out infinite;
    }
    .lr2-travel { offset-rotate: 0deg; }
    @keyframes lr2BoundaryPulse {
      0%, 100% { opacity: 0.35; }
      50%      { opacity: 1; }
    }
    .lr2-bpulse { animation: lr2BoundaryPulse 2.4s ease-in-out infinite; }
    @keyframes lr2Misclassified {
      0%, 100% { opacity: 0.2; }
      50%      { opacity: 1; }
    }
    .lr2-mis { animation: lr2Misclassified 1.6s ease-in-out infinite; }
    @keyframes lr2Verdict {
      0%   { opacity: 0; transform: translateX(-30px); }
      18%  { opacity: 1; transform: translateX(0); }
      78%  { opacity: 1; }
      100% { opacity: 0; }
    }
    .lr2-verdict { animation: lr2Verdict 6s ease-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .lr2-scurve, .lr2-bpulse, .lr2-mis, .lr2-verdict { animation: none; }
    }
  `;

  // Section 06: marker sweeps p 0→1→0 while two cost bars track −ln p and −ln(1−p).
  // Bar heights are pre-sampled from the log curve at each keyframe stop, capped at 3 nats.
  const logrCss = `
    @keyframes logrWalk {
      0%, 100% { left: 5%; }
      50%      { left: 95%; }
    }
    .logr-walk { animation: logrWalk 8s linear infinite; }
    @keyframes logrBarOne {
      0%     { transform: scaleY(0.999); }
      6.25%  { transform: scaleY(0.606); }
      12.5%  { transform: scaleY(0.430); }
      25%    { transform: scaleY(0.231); }
      37.5%  { transform: scaleY(0.107); }
      50%    { transform: scaleY(0.017); }
      62.5%  { transform: scaleY(0.107); }
      75%    { transform: scaleY(0.231); }
      87.5%  { transform: scaleY(0.430); }
      93.75% { transform: scaleY(0.606); }
      100%   { transform: scaleY(0.999); }
    }
    .logr-bar1 { animation: logrBarOne 8s linear infinite; }
    @keyframes logrBarZero {
      0%     { transform: scaleY(0.017); }
      6.25%  { transform: scaleY(0.059); }
      12.5%  { transform: scaleY(0.107); }
      25%    { transform: scaleY(0.231); }
      37.5%  { transform: scaleY(0.430); }
      50%    { transform: scaleY(0.999); }
      62.5%  { transform: scaleY(0.430); }
      75%    { transform: scaleY(0.231); }
      87.5%  { transform: scaleY(0.107); }
      93.75% { transform: scaleY(0.059); }
      100%   { transform: scaleY(0.017); }
    }
    .logr-bar0 { animation: logrBarZero 8s linear infinite; }
  `;

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen">
        <style>{css}</style>
        <LoopedStyles
          css={logrCss}
          reduceMotionTargets={[".logr-walk", ".logr-bar1", ".logr-bar0"]}
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
                Classification · Logistic Regression
              </span>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 02
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              Logistic Regression &amp; The Sigmoid Curve
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              Despite the name, it is a classifier. Watch a straight line get
              bent into an S, see how one threshold splits the world into two
              decisions, and learn the loss that keeps probabilities honest.
            </p>
          </header>

          {/* Section 01: Looped hero — line bends into the S */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / From Line to Probability
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Sigmoid Transformation
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Topic 01 predicted <em>numbers</em>. But &ldquo;spam or
                  not?&rdquo; needs a <em>probability</em> — and probabilities
                  must live in <MathTex math="[0, 1]" />, while a straight line{" "}
                  <MathTex math="z = wx + b" /> runs off to{" "}
                  <MathTex math="\pm\infty" />.
                </p>
                <p>
                  The fix is a squashing function. Feed the unbounded line score{" "}
                  <MathTex math="z" /> into the <strong>sigmoid</strong> and it
                  gets bent into a soft S that saturates at exactly 0 and 1:
                </p>
                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[13px]">
                  <MathTex
                    math="\sigma(z) = \frac{1}{1 + e^{-z}} \quad\quad P(Y=1|x) = \sigma(wx + b)"
                    block
                  />
                </div>
                <p>
                  In the animation, a prediction point slides along the input
                  axis: far left the model is{" "}
                  <strong>almost sure class&nbsp;0</strong>, far right{" "}
                  <strong>almost sure class&nbsp;1</strong>, and near the center
                  — where <MathTex math="z = 0" /> — it genuinely cannot decide
                  and outputs <MathTex math="0.5" />.
                </p>
              </div>

              {/* Looped sigmoid animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>σ(z) SELF-DRAWING · DOT TRAVERSES FOREVER</span>
                  <span className="font-bold text-[#DE5D35]">P(y=1|x)</span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="-70 -12 140 124"
                    className="w-full select-none overflow-visible"
                    role="img"
                    aria-label="Animated sigmoid curve with a traveling prediction dot"
                  >
                    {/* Axes */}
                    <line
                      x1="-55"
                      y1="100"
                      x2="55"
                      y2="100"
                      stroke="#1A1816"
                      strokeWidth="0.8"
                    />
                    <line
                      x1="-55"
                      y1="50"
                      x2="55"
                      y2="50"
                      stroke="#75716B"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                    />
                    <text
                      x="-58"
                      y="3"
                      fontSize="4"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#75716B"
                    >
                      1.0
                    </text>
                    <text
                      x="-58"
                      y="52"
                      fontSize="4"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#DE5D35"
                    >
                      0.5
                    </text>
                    <text
                      x="-58"
                      y="102"
                      fontSize="4"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#75716B"
                    >
                      0.0
                    </text>
                    <text
                      x="0"
                      y="110"
                      fontSize="5"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      z = wx + b
                    </text>

                    {/* Class saturation tints */}
                    <rect
                      x="-55"
                      y="50"
                      width="55"
                      height="50"
                      fill="rgba(26,24,22,0.05)"
                    />
                    <rect
                      x="0"
                      y="0"
                      width="55"
                      height="50"
                      fill="rgba(222,93,53,0.08)"
                    />
                    <text
                      x="-30"
                      y="60"
                      fontSize="4.5"
                      fontFamily="monospace"
                      fill="#75716B"
                    >
                      class 0 zone
                    </text>
                    <text
                      x="18"
                      y="60"
                      fontSize="4.5"
                      fontFamily="monospace"
                      fill="#DE5D35"
                    >
                      class 1 zone
                    </text>

                    {/* Self-drawing sigmoid */}
                    <path
                      className="lr2-scurve"
                      d={sigmoidPath}
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="1.6"
                    />

                    {/* Traveling dot on the curve */}
                    <circle
                      r="2.4"
                      fill="#DE5D35"
                      stroke="#FAF9F5"
                      strokeWidth="0.7"
                      className="lr2-travel"
                    >
                      <animateMotion
                        dur="7s"
                        repeatCount="indefinite"
                        calcMode="linear"
                        path={sigmoidPath}
                      />
                    </circle>

                    {/* Midpoint marker */}
                    <circle cx="0" cy="50" r="1.4" fill="#1A1816" />
                    <text
                      x="3"
                      y="47"
                      fontSize="4"
                      fontFamily="monospace"
                      fill="#1A1816"
                    >
                      0.5 — the fence
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  Flat ends = confident. Steep middle = everything is decided
                  here.
                </p>
              </div>
            </div>
          </section>

          {/* Section 02: Interactive sigmoid lab */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                02 / The Sigmoid Lab
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Steer the Curve, Fit the Data
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  The <strong>weight</strong> <MathTex math="w" /> controls how
                  steep the S is (how quickly the model becomes confident), and
                  the <strong>bias</strong> <MathTex math="b" /> slides the
                  decision boundary left or right. Fit the 10 observations below
                  by hand.
                </p>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>WEIGHT (w) · SLOPE SHARPNESS</span>
                      <span className="font-bold text-[#DE5D35]">
                        {weight.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.05"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      className="w-full accent-[#DE5D35] cursor-pointer"
                      aria-label="Weight"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>BIAS (b) · HORIZONTAL SHIFT</span>
                      <span className="font-bold text-[#1A1816]">
                        {bias.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-5.0"
                      max="5.0"
                      step="0.1"
                      value={bias}
                      onChange={(e) => setBias(parseFloat(e.target.value))}
                      className="w-full accent-[#1A1816] cursor-pointer"
                      aria-label="Bias"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 text-[12px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">
                      DECISION BOUNDARY (z=0):
                    </span>
                    <span className="font-bold text-[#DE5D35]">
                      x = {stats.boundaryX.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">LOG LOSS (BCE):</span>
                    <span className="font-bold text-[#1A1816]">
                      {stats.bceLoss.toFixed(4)}
                    </span>
                  </div>
                </div>

                <p>
                  Lower the loss to win. The boundary sits where{" "}
                  <MathTex math="wx + b = 0" />, i.e.{" "}
                  <MathTex math="x^* = -b/w" /> — a hyperplane in feature space.
                </p>
              </div>

              {/* Right: Interactive sigmoid */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1A1816]" />
                      <span>Class 0 (y=0)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DE5D35]" />
                      <span>Class 1 (y=1)</span>
                    </span>
                  </div>
                  <span className="font-semibold text-[#DE5D35]">P(y=1|x)</span>
                </div>

                <div className="relative bg-[#EBF5FB]/30 border border-[#1A1816]/10 p-2 rounded-[2px] h-72 flex items-end">
                  <svg
                    role="img"
                    aria-label="Sigmoid curve of P(y=1|x) over class 0 and class 1 data points"
                    viewBox="-60 -10 120 120"
                    className="w-full h-full overflow-visible select-none"
                  >
                    <line
                      x1="-55"
                      y1="100"
                      x2="55"
                      y2="100"
                      stroke="#1A1816"
                      strokeWidth="0.8"
                    />
                    <line
                      x1="-55"
                      y1="0"
                      x2="55"
                      y2="0"
                      stroke="#1A1816"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                    />
                    <line
                      x1="-55"
                      y1="50"
                      x2="55"
                      y2="50"
                      stroke="#75716B"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                    />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="100"
                      stroke="#1A1816"
                      strokeWidth="0.8"
                    />

                    <text
                      x="-58"
                      y="3"
                      fontSize="4"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#75716B"
                    >
                      1.0
                    </text>
                    <text
                      x="-58"
                      y="52"
                      fontSize="4"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#DE5D35"
                    >
                      0.5
                    </text>
                    <text
                      x="-58"
                      y="102"
                      fontSize="4"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#75716B"
                    >
                      0.0
                    </text>

                    {stats.boundaryX >= -5 && stats.boundaryX <= 5 && (
                      <g>
                        <line
                          x1={stats.boundaryX * 10}
                          y1="0"
                          x2={stats.boundaryX * 10}
                          y2="100"
                          stroke="#DE5D35"
                          strokeWidth="0.8"
                          strokeDasharray="2 2"
                        />
                        <text
                          x={stats.boundaryX * 10}
                          y="-3"
                          fontSize="4"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill="#DE5D35"
                          fontWeight="bold"
                        >
                          x* = {stats.boundaryX.toFixed(1)}
                        </text>
                      </g>
                    )}

                    <path
                      d={Array.from({ length: 110 }, (_, i) => {
                        const xVal = -5.5 + i * 0.1;
                        const z = weight * xVal + bias;
                        const p = 1 / (1 + Math.exp(-z));
                        return `${i === 0 ? "M" : "L"} ${xVal * 10} ${100 - p * 100}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="1.6"
                    />

                    {dataPoints.map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt.x * 10}
                        cy={pt.y === 1 ? 0 : 100}
                        r="2"
                        fill={pt.y === 1 ? "#DE5D35" : "#1A1816"}
                        stroke="#FAF9F5"
                        strokeWidth="0.6"
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Decision boundary looped classification */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Drawing the Border
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Decision Boundary &amp; Its Casualties
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Looped boundary animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>2D CLASSIFICATION · BLINKING = MISCLASSIFIED</span>
                  <span className="font-bold text-[#DE5D35]">P &gt; 0.5 ?</span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 400 240"
                    className="w-full select-none"
                    role="img"
                    aria-label="Animated decision boundary separating two classes with misclassified points blinking"
                  >
                    {/* Region tints split by boundary x=200 */}
                    <rect
                      x="40"
                      y="20"
                      width="160"
                      height="190"
                      fill="rgba(26,24,22,0.05)"
                    />
                    <rect
                      x="200"
                      y="20"
                      width="160"
                      height="190"
                      fill="rgba(222,93,53,0.08)"
                    />

                    {/* Boundary */}
                    <line
                      x1="200"
                      y1="10"
                      x2="200"
                      y2="220"
                      stroke="#DE5D35"
                      strokeWidth="2"
                      className="lr2-bpulse"
                    />
                    <text
                      x="200"
                      y="8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontWeight="bold"
                    >
                      w·x + b = 0
                    </text>

                    {/* Class 0 points (left) */}
                    {[
                      [80, 60],
                      [120, 100],
                      [95, 150],
                      [150, 70],
                      [70, 120],
                    ].map(([x, y], i) => (
                      <circle
                        key={`c0-${i}`}
                        cx={x}
                        cy={y}
                        r="7"
                        fill="#1A1816"
                        stroke="#FAF9F5"
                        strokeWidth="2"
                      />
                    ))}

                    {/* Class 1 points (right) */}
                    {[
                      [260, 60],
                      [300, 110],
                      [270, 160],
                      [330, 70],
                      [310, 170],
                    ].map(([x, y], i) => (
                      <circle
                        key={`c1-${i}`}
                        cx={x}
                        cy={y}
                        r="7"
                        fill="#DE5D35"
                        stroke="#FAF9F5"
                        strokeWidth="2"
                      />
                    ))}

                    {/* Misclassified casualties */}
                    <circle
                      cx="245"
                      cy="185"
                      r="7"
                      fill="#1A1816"
                      stroke="#FAF9F5"
                      strokeWidth="2"
                    />
                    <circle
                      cx="245"
                      cy="185"
                      r="11"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      className="lr2-mis"
                    />
                    <circle
                      cx="165"
                      cy="45"
                      r="7"
                      fill="#DE5D35"
                      stroke="#FAF9F5"
                      strokeWidth="2"
                    />
                    <circle
                      cx="165"
                      cy="45"
                      r="11"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      className="lr2-mis"
                      style={{ animationDelay: "0.8s" }}
                    />

                    <text
                      x="245"
                      y="210"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#EF4444"
                      textAnchor="middle"
                    >
                      FP
                    </text>
                    <text
                      x="165"
                      y="26"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#EF4444"
                      textAnchor="middle"
                    >
                      FP
                    </text>

                    <text
                      x="120"
                      y="225"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#75716B"
                      textAnchor="middle"
                    >
                      predict class 0
                    </text>
                    <text
                      x="280"
                      y="225"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#75716B"
                      textAnchor="middle"
                    >
                      predict class 1
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  A linear boundary can never be perfect — those two blinking
                  points are where Topic 03 begins.
                </p>
              </div>

              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4 order-1 lg:order-2">
                <p>
                  The sigmoid outputs a continuous probability, but the world
                  wants verdicts. Applying a threshold (default{" "}
                  <MathTex math="0.5" />) turns the S-curve into a{" "}
                  <strong>linear decision boundary</strong> — everything on one
                  side is class 0, everything on the other is class 1.
                </p>
                <p>
                  In 2D that boundary is a line; in 3D a plane; in 100
                  dimensions a hyperplane. Same idea, same equation{" "}
                  <MathTex math="w \cdot x + b = 0" />.
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Why Not Just Use MSE (Like Topic 01)?
                  </span>
                  <p className="text-[13px]">
                    Squared error over a sigmoid creates a{" "}
                    <strong>non-convex</strong>, wavy loss surface — gradient
                    descent gets stranded in fake minima. Cross-entropy keeps
                    the bowl-shaped surface that made Topic 01&apos;s descent
                    work, and it punishes confident wrong answers without mercy:
                    predicting <MathTex math="0.99" /> on a true{" "}
                    <MathTex math="0" /> costs{" "}
                    <MathTex math="-\ln(0.01) \approx 4.6" /> per point and
                    grows without bound.
                  </p>
                </div>
                <p>
                  Those two blinking misclassified points are exactly the{" "}
                  <strong>FP / FN cells</strong> of the confusion matrix — Topic
                  03 teaches you to price them properly.
                </p>
              </div>
            </div>
          </section>

          {/* Section 04: Odds, logit & cross-entropy */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / The Betting Interpretation
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Odds, Logits &amp; Binary Cross-Entropy
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-[14px] text-[#4A4742] leading-[1.7]">
              <div className="space-y-4">
                <p>
                  Probability asks &ldquo;how likely?&rdquo;.{" "}
                  <strong>Odds</strong> ask &ldquo;how many times more
                  likely?&rdquo; — a 75% event has odds 3:1. Take the log and
                  you get the <strong>logit</strong>, and something beautiful
                  happens:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Log-Odds (Logit) Form
                  </span>
                  <MathTex
                    math="\ln \left( \frac{p}{1 - p} \right) = w \cdot x + b"
                    block
                  />
                  <p className="text-[12px] text-[#75716B] mt-2">
                    The log-odds is <strong>linear</strong> in the features —
                    logistic regression <em>is</em> linear regression running in
                    odds-space, then translated back by{" "}
                    <MathTex math="\sigma" />. Each weight multiplies the odds
                    by <MathTex math="e^{w}" /> per unit of <MathTex math="x" />
                    .
                  </p>
                </div>
                <p>
                  To train it, maximize the likelihood of the observed labels —
                  equivalently minimize binary cross-entropy:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Cross-Entropy Loss
                  </span>
                  <MathTex
                    math="\mathcal{L}(w, b) = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \ln(\hat{y}_i) + (1 - y_i) \ln(1 - \hat{y}_i) \right]"
                    block
                  />
                </div>
              </div>

              {/* Looped BCE loss curves */}
              <div className="space-y-4">
                <p>
                  Each term of the loss is a curve, and the ball riding it tells
                  you what the model feels: when a true-1 point gets probability
                  near 1, the <MathTex math="-\ln(p)" /> cost flattens to zero;
                  let it drift toward 0 and the cost rockets to infinity.
                </p>
                <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                  <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                    <span>PER-POINT COST −ln(p)</span>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#DE5D35]" />
                        <span>y = 1</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1A1816]" />
                        <span>y = 0</span>
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                    <svg
                      viewBox="0 0 400 230"
                      className="w-full select-none"
                      role="img"
                      aria-label="Animated cost curves for cross-entropy with traveling balls"
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
                        predicted probability p →
                      </text>
                      <text
                        x="-100"
                        y="14"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill="#75716B"
                        transform="rotate(-90)"
                      >
                        cost −ln(p) →
                      </text>

                      {/* y=1 cost: -ln(p), p in (0,1] — steep at left */}
                      <path
                        d="M 48 24 Q 80 150 205 165 L 370 168"
                        fill="none"
                        stroke="#DE5D35"
                        strokeWidth="2"
                      />
                      {/* y=0 cost: -ln(1-p) mirrored */}
                      <path
                        d="M 362 24 Q 330 150 205 165 L 40 168"
                        fill="none"
                        stroke="#1A1816"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />

                      {/* Balls traveling the two curves */}
                      <circle r="6" fill="#DE5D35" className="lr2-travel">
                        <animateMotion
                          dur="6s"
                          repeatCount="indefinite"
                          calcMode="linear"
                          keyPoints="1;0;1"
                          keyTimes="0;0.5;1"
                          path="M 370 168 L 205 165 Q 80 150 48 24"
                        />
                      </circle>
                      <circle r="6" fill="#1A1816" className="lr2-travel">
                        <animateMotion
                          dur="6s"
                          repeatCount="indefinite"
                          calcMode="linear"
                          keyPoints="1;0;1"
                          keyTimes="0;0.5;1"
                          path="M 40 168 L 205 165 Q 330 150 362 24"
                        />
                      </circle>

                      <text
                        x="60"
                        y="40"
                        fontSize="9"
                        fontFamily="monospace"
                        fill="#DE5D35"
                      >
                        confident &amp; right = cheap
                      </text>
                      <text
                        x="150"
                        y="150"
                        fontSize="9"
                        fontFamily="monospace"
                        fill="#75716B"
                      >
                        p = 0.5 → ln 2 ≈ 0.69
                      </text>
                      <text
                        x="200"
                        y="30"
                        fontSize="9"
                        fontFamily="monospace"
                        fill="#EF4444"
                        textAnchor="middle"
                      >
                        confident &amp; wrong = ∞ expensive
                      </text>
                    </svg>
                  </div>
                  <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                    Because the loss is convex in (w, b), gradient descent
                    always finds the global minimum.
                  </p>
                </div>
                <p>
                  Multi-class? Stack sigmoids and normalize — that is{" "}
                  <strong>softmax regression</strong>, the last layer of every
                  neural network in Topics 07–09.
                </p>
              </div>
            </div>
          </section>

          {/* Section 05: Coefficient interpretation & odds multiplier */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / Reading The Coefficients
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Weights Multiply Odds, Not Probabilities
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  A weight is not a nudge on the probability dial. It acts on
                  the <strong>odds</strong> — the ratio of an event happening to
                  it not happening.
                </p>
                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[13px]">
                  <MathTex
                    math="\text{odds} = \frac{p}{1-p} \qquad \text{logit}(p) = \ln \!\left( \frac{p}{1-p} \right) = w \cdot x + b"
                    block
                  />
                </div>
                <p>
                  Because the logit is linear, adding one unit of{" "}
                  <MathTex math="x" /> adds <MathTex math="w" /> to the{" "}
                  <em>log-odds</em> — and exponentiating turns that addition
                  into a multiplication: the odds scale by{" "}
                  <strong>
                    <MathTex math="e^{w}" />
                  </strong>
                  . A weight of <MathTex math="\ln 2 \approx 0.69" /> doubles
                  the odds; <MathTex math="w = 1.2" /> multiplies them by{" "}
                  <MathTex math="e^{1.2} \approx 3.3" />.
                </p>
                <p>
                  That multiplicative reading is the whole reason logistic
                  regression counts as <strong>interpretable</strong>: each
                  coefficient is a self-contained odds ratio, legible without
                  inspecting the rest of the model.
                </p>
                <div className="p-4 bg-[#1A1816] text-[#FAF9F5]">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    The Scale Trap
                  </span>
                  <p className="text-[13px] leading-[1.6] text-[#FAF9F5]/80">
                    Ranking raw coefficients across features is meaningless when
                    the features live on different scales — a weight of 2 on a
                    centimetre axis is not the same as 2 on a kilometre axis.{" "}
                    <strong className="text-[#FAF9F5]">
                      Standardize first
                    </strong>{" "}
                    (mean 0, unit variance), then compare. Same model,
                    comparable numbers.
                  </p>
                </div>
              </div>

              {/* Interactive odds multiplier */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>ONE-UNIT PUSH · START AT p = 0.5</span>
                  <span className="font-bold text-[#DE5D35]">Δ logit = w</span>
                </div>

                <div className="p-4 bg-[#F4F1EA] border border-[#1A1816]/10 rounded-[2px] mb-4">
                  <div className="relative h-8 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1A1816]/40" />
                    <div
                      className="absolute top-0 bottom-0 w-3 bg-[#DE5D35] -translate-x-1/2 transition-all duration-200"
                      style={{ left: `${pFromHalf * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#75716B] mt-2">
                    <span>0.50 before</span>
                    <span className="font-bold text-[#DE5D35]">
                      {pFromHalf.toFixed(3)} after
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>WEIGHT (w) · LOG-ODDS SHIFT</span>
                      <span className="font-bold text-[#DE5D35]">
                        {coef.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-3"
                      max="3"
                      step="0.05"
                      value={coef}
                      onChange={(e) => setCoef(parseFloat(e.target.value))}
                      className="w-full accent-[#DE5D35] cursor-pointer"
                      aria-label="Logistic coefficient weight"
                    />
                  </div>

                  <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 text-[12px] font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#75716B]">
                        ODDS MULTIPLIER e^w:
                      </span>
                      <span className="font-bold text-[#DE5D35]">
                        ×{oddsMult.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#75716B]">
                        p AFTER x + 1 (FROM 0.5):
                      </span>
                      <span className="font-bold text-[#1A1816]">
                        {pFromHalf.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#1A1816]/10">
                      <span className="text-[#EF4444] line-through">
                        WRONG · 0.5 + w
                      </span>
                      <span className="text-[#EF4444] line-through">
                        {(0.5 + coef).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  Slide w negative to shrink the odds toward zero · positive to
                  inflate them · the probability never moves additively
                </p>
              </div>
            </div>
          </section>

          {/* Section 06: Log loss & the confidence penalty */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                06 / Log Loss
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Why Cross-Entropy, Not MSE
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Training maximizes the likelihood of the labels you actually
                  saw — equivalently, it minimizes <strong>log loss</strong>,
                  one <MathTex math="-\ln(\hat{p})" /> term per point, scored
                  only against the truth:
                </p>
                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[13px]">
                  <MathTex
                    math="\mathcal{L} = -\frac{1}{N} \sum_{i=1}^{N} \left[ y_i \ln \hat{y}_i + (1 - y_i) \ln(1 - \hat{y}_i) \right]"
                    block
                  />
                </div>
                <p>
                  The logarithm is the entire point. <MathTex math="-\ln(p)" />{" "}
                  is nearly flat near <MathTex math="p = 1" />, so a confident
                  correct answer costs almost nothing — but it plunges toward
                  infinity as <MathTex math="p \to 0" />. Being confidently
                  wrong is not merely penalized; it is{" "}
                  <strong>catastrophically</strong> penalized.
                </p>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-3">
                    Asymmetry · Cost In Nats
                  </span>
                  <table className="w-full text-[12px] font-mono">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-[#75716B]">
                        <th className="text-left font-normal pb-1">p̂</th>
                        <th className="text-right font-normal pb-1">
                          cost | y=0
                        </th>
                        <th className="text-right font-normal pb-1">
                          cost | y=1
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0.99, 0.9, 0.5, 0.1, 0.01].map((p) => {
                        const c0 = -Math.log(1 - p);
                        const c1 = -Math.log(p);
                        return (
                          <tr key={p} className="border-t border-[#1A1816]/10">
                            <td className="py-1 text-[#75716B]">
                              {p.toFixed(2)}
                            </td>
                            <td
                              className={`py-1 text-right text-[#1A1816] ${
                                c0 >= c1 ? "font-bold" : ""
                              }`}
                            >
                              {c0.toFixed(2)}
                            </td>
                            <td
                              className={`py-1 text-right text-[#DE5D35] ${
                                c1 > c0 ? "font-bold" : ""
                              }`}
                            >
                              {c1.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-3">
                    Predicting <MathTex math="0.99" /> on a true{" "}
                    <MathTex math="0" /> costs{" "}
                    <MathTex math="-\ln(0.01) \approx 4.61" />. Flip the blunder
                    — predict <MathTex math="0.01" /> on that same true{" "}
                    <MathTex math="0" /> — and you pay only{" "}
                    <MathTex math="-\ln(0.99) \approx 0.01" />. Confidence is
                    cheap when it is right and ruinous when it is wrong.
                  </p>
                </div>
                <p>
                  That explode-to-infinity edge is not a bug to be capped. It is
                  the gradient reporting, in exact proportion, how far the model
                  has strayed.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <p className="text-[14px] text-[#4A4742] leading-[1.7]">
                  Watch the cost as the marker sweeps <MathTex math="p" />. One
                  bar tracks the penalty for a true 1, the other for a true 0 —
                  and at either edge one of them races off the top of the frame.
                </p>

                <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                  <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                    <span>CONFIDENCE PENALTY · MARKER WALKS p</span>
                    <span className="font-bold text-[#DE5D35]">LOOP · 8s</span>
                  </div>

                  <Looped
                    label="A marker walks from probability zero to one while two bottom-anchored cost bars grow according to negative log loss, one exploding toward infinity at the left edge and the other at the right edge"
                    className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-2">
                      <span className="text-[#DE5D35]">y = 1 · cost −ln p</span>
                      <span className="text-[#1A1816]">
                        y = 0 · cost −ln(1 − p)
                      </span>
                    </div>
                    <div className="relative h-40 bg-[#FAF9F5] border border-[#1A1816]/15 overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1A1816]/30" />
                      <div className="logr-walk absolute top-0 bottom-0 w-0">
                        <div
                          className="logr-bar1 absolute bottom-0 right-0.5 h-full w-2.5"
                          style={{
                            backgroundColor: PALETTE.accent,
                            transformOrigin: "bottom",
                          }}
                        />
                        <div
                          className="logr-bar0 absolute bottom-0 left-0.5 h-full w-2.5"
                          style={{
                            backgroundColor: PALETTE.ink,
                            transformOrigin: "bottom",
                          }}
                        />
                        <div className="absolute top-0 bottom-0 left-0 w-px bg-[#1A1816]/50" />
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#75716B] mt-2">
                      <span>p = 0</span>
                      <span>0.5</span>
                      <span>p = 1</span>
                    </div>
                  </Looped>

                  <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                    Bar height ∝ −ln p, clipped at 3 nats · one bar fills the
                    frame as the other vanishes
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-[#FAF9F5] border border-[#DE5D35]">
                    <span className="block text-[11px] font-mono uppercase tracking-widest font-bold text-[#DE5D35] mb-1">
                      Cross-Entropy + Sigmoid
                    </span>
                    <span className="block text-[18px] font-black font-mono text-[#1A1816]">
                      CONVEX
                    </span>
                    <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                      A single bowl with one global minimum — gradient descent
                      cannot get stranded, no matter where it starts.
                    </p>
                  </div>
                  <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[11px] font-mono uppercase tracking-widest font-bold text-[#EF4444] mb-1">
                      MSE + Sigmoid
                    </span>
                    <span className="block text-[18px] font-black font-mono text-[#1A1816]">
                      NON-CONVEX
                    </span>
                    <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-1">
                      A wavy surface with flat plateaus. Squared error saturates
                      the sigmoid, vanishing gradients stall training, and the
                      descent can settle in a fake minimum.
                    </p>
                  </div>
                </div>

                <p className="text-[14px] text-[#4A4742] leading-[1.7]">
                  Pair the sigmoid with log loss and the surface stays convex;
                  pair it with squared error and it does not. That single
                  compatibility is why every modern classifier — up to the
                  softmax heads of Topics 07–09 — trains on cross-entropy.
                </p>
              </div>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/resources/linear-regression"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
            >
              <span>← Topic 01: Linear Regression</span>
            </Link>
            <Link
              href="/resources/precision-recall"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
            >
              <span>
                Topic 03: Confusion Matrix, Precision-Recall &amp; F1 →
              </span>
            </Link>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
