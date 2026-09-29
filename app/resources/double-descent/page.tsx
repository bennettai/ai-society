"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles } from "@/components/looped";
import MathTex from "@/components/MathTex";

// Capacity axis: t = 0 is a tiny model, t = 1 is wildly over-parameterised.
// The interpolation threshold sits where parameters ≈ training rows.
const THRESHOLD_T = 0.5;

// Test error by capacity. Hand-placed anchors rather than a fitted function so
// the classical dip, the threshold spike and the second descent are all where
// the prose says they are.
const TEST_ANCHORS: { t: number; e: number }[] = [
  { t: 0.0, e: 0.74 },
  { t: 0.1, e: 0.54 },
  { t: 0.2, e: 0.38 },
  { t: 0.32, e: 0.27 },
  { t: 0.4, e: 0.34 },
  { t: 0.46, e: 0.58 },
  { t: 0.5, e: 0.9 },
  { t: 0.56, e: 0.62 },
  { t: 0.64, e: 0.4 },
  { t: 0.76, e: 0.24 },
  { t: 0.88, e: 0.17 },
  { t: 1.0, e: 0.14 },
];

// Training error falls to zero at the threshold and cannot go lower.
const TRAIN_ANCHORS: { t: number; e: number }[] = [
  { t: 0.0, e: 0.66 },
  { t: 0.15, e: 0.42 },
  { t: 0.3, e: 0.22 },
  { t: 0.42, e: 0.07 },
  { t: 0.5, e: 0.01 },
  { t: 1.0, e: 0.0 },
];

const X0 = 58;
const XS = 336; // horizontal span in SVG units
const Y0 = 232; // baseline (error = 0)
const YS = 196; // vertical span

const px = (t: number) => X0 + t * XS;
const py = (e: number) => Y0 - e * YS;

/** Sample a hand-placed anchor set into an SVG polyline. */
function curvePath(anchors: { t: number; e: number }[], samples = 140) {
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    let lo = anchors[0];
    let hi = anchors[anchors.length - 1];
    for (let a = 0; a < anchors.length - 1; a++) {
      if (t >= anchors[a].t && t <= anchors[a + 1].t) {
        lo = anchors[a];
        hi = anchors[a + 1];
        break;
      }
    }
    const span = hi.t - lo.t || 1;
    const w = (t - lo.t) / span;
    const e = lo.e + (hi.e - lo.e) * w;
    pts.push(`${i === 0 ? "M" : "L"}${px(t).toFixed(1)} ${py(e).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Error at a capacity, for the interactive readout. */
function errorAt(anchors: { t: number; e: number }[], t: number) {
  for (let a = 0; a < anchors.length - 1; a++) {
    const lo = anchors[a];
    const hi = anchors[a + 1];
    if (t >= lo.t && t <= hi.t) {
      const w = (t - lo.t) / (hi.t - lo.t || 1);
      return lo.e + (hi.e - lo.e) * w;
    }
  }
  return anchors[anchors.length - 1].e;
}

export default function DoubleDescentArticlePage() {
  // Section 02 cursor: where on the capacity axis the reader has parked.
  const [capacity, setCapacity] = useState<number>(THRESHOLD_T);

  const testPath = useMemo(() => curvePath(TEST_ANCHORS), []);
  const trainPath = useMemo(() => curvePath(TRAIN_ANCHORS), []);

  const readout = useMemo(() => {
    const test = errorAt(TEST_ANCHORS, capacity);
    const train = errorAt(TRAIN_ANCHORS, capacity);
    const regime =
      capacity < 0.42
        ? "under-parameterised · classical regime"
        : capacity <= 0.58
          ? "at the interpolation threshold"
          : "over-parameterised · modern regime";
    return { test, train, regime };
  }, [capacity]);

  // Section 03 loop: a marker walks the test-error curve while the training
  // curve draws itself in behind it. One shared 9s clock, no scroll input.
  const ddCss = `
    @keyframes ddTravel {
      0%   { offset-distance: 0%;   opacity: 0; }
      5%   { opacity: 1; }
      93%  { opacity: 1; }
      100% { offset-distance: 100%; opacity: 0; }
    }
    @keyframes ddDraw {
      0%   { stroke-dashoffset: 760; }
      92%, 100% { stroke-dashoffset: 0; }
    }
    @keyframes ddSpike {
      0%, 34%   { opacity: 0.15; }
      48%, 56%  { opacity: 1; }
      70%, 100% { opacity: 0.15; }
    }
    @keyframes ddRegime {
      0%, 30%   { opacity: 0; }
      40%, 52%  { opacity: 1; }
      62%, 100% { opacity: 0; }
    }
    .dd-dot {
      offset-path: path("${testPath}");
      offset-rotate: 0deg;
      animation: ddTravel 9s linear infinite;
    }
    .dd-train {
      stroke-dasharray: 760;
      animation: ddDraw 9s linear infinite;
    }
    .dd-spike { animation: ddSpike 9s ease-in-out infinite; }
    .dd-regime { animation: ddRegime 9s ease-in-out infinite; }
  `;

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen">
        <LoopedStyles
          css={ddCss}
          reduceMotionTargets={[
            ".dd-dot",
            ".dd-train",
            ".dd-spike",
            ".dd-regime",
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
                Foundations · Double Descent
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 13
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              Double Descent
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              For decades the rule was simple: too much capacity and you
              overfit. Then models with far more parameters than data points
              started winning. This essay follows the error curve past the point
              it was supposed to explode — and finds it falling again.
            </p>
          </header>

          {/* Section 01 */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / The Picture You Were Taught
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                A Curve With One Bottom
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  <Link
                    href="/resources/bias-variance"
                    className="text-[#DE5D35] font-bold hover:underline"
                  >
                    Topic 11
                  </Link>{" "}
                  gave us the classic tradeoff. Sweep model capacity from tiny
                  to large and test error traces a single U: a stiff model
                  misses real structure (<strong>bias</strong>), a flexible one
                  chases noise (<strong>variance</strong>), and somewhere
                  between them sits the bottom of the bowl.
                </p>
                <p>
                  The story comes with a warning attached. Increase capacity far
                  enough and you can drive <em>training</em> error to exactly
                  zero — the model has enough freedom to memorise every label
                  you gave it. Classical theory treats that moment as the worst
                  place to stand. Fit the noise perfectly and you should
                  generalise terribly.
                </p>
                <div className="p-4 bg-[#1A1816] text-[#FAF9F5]">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    The claim under test
                  </span>
                  <p className="text-[13px] leading-[1.7]">
                    Once a model can interpolate the training set — zero
                    training error — test error should spike and stay high.
                    Everything to the right of that point is a model you should
                    not ship.
                  </p>
                </div>
                <p>
                  That claim is where the interesting part begins, because for
                  modern model classes it turns out to be <strong>false</strong>
                  .
                </p>
              </div>

              <div className="lg:col-span-6 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-4">
                  The classical U · bias-variance
                </div>
                <svg
                  role="img"
                  aria-label="Classical U-shaped test error curve from the bias-variance trade-off"
                  viewBox="0 0 380 200"
                  className="w-full h-auto"
                >
                  <line
                    x1="40"
                    y1="170"
                    x2="352"
                    y2="170"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="40"
                    y1="24"
                    x2="40"
                    y2="170"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />
                  {/* bias falls, variance rises, their sum is the U */}
                  <path
                    d="M48 44 C 110 96 150 128 196 128 C 250 128 300 74 344 34"
                    fill="none"
                    stroke="#75716B"
                    strokeWidth="1.4"
                    strokeDasharray="4 3"
                  />
                  <path
                    d="M48 158 C 110 152 160 148 196 128 C 240 104 300 46 344 28"
                    fill="none"
                    stroke="#75716B"
                    strokeWidth="1.4"
                    strokeDasharray="4 3"
                  />
                  <path
                    d="M48 60 C 96 128 150 156 196 148 C 250 138 300 68 344 30"
                    fill="none"
                    stroke="#DE5D35"
                    strokeWidth="2.6"
                  />
                  <circle cx="196" cy="148" r="5" fill="#DE5D35" />
                  <text
                    x="196"
                    y="192"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#1A1816"
                  >
                    capacity →
                  </text>
                  <text
                    x="196"
                    y="18"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#DE5D35"
                    fontWeight="bold"
                  >
                    TEST ERROR
                  </text>
                  <text
                    x="128"
                    y="140"
                    fontSize="8"
                    fontFamily="monospace"
                    fill="#75716B"
                  >
                    bias²
                  </text>
                  <text
                    x="272"
                    y="60"
                    fontSize="8"
                    fontFamily="monospace"
                    fill="#75716B"
                  >
                    variance
                  </text>
                </svg>
              </div>
            </div>
          </section>

          {/* Section 02 — interactive */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                02 / The Second Descent
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Take The Capacity Dial
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Drag the dial from a model with a handful of parameters to one
              with far more than it has training rows. Watch three things at
              once: the training error pinning to zero, the test error spiking
              at the threshold — and then, against every classical instinct,{" "}
              <strong>falling again</strong>.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 space-y-5">
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                    <span>MODEL CAPACITY</span>
                    <span className="font-bold text-[#DE5D35]">
                      {(capacity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={capacity}
                    onChange={(e) => setCapacity(parseFloat(e.target.value))}
                    className="w-full accent-[#DE5D35] cursor-pointer"
                    aria-label="Model capacity"
                  />
                  <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-[#75716B] mt-1">
                    <span>tiny</span>
                    <span>threshold</span>
                    <span>huge</span>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">TRAIN ERROR:</span>
                    <span className="font-bold text-[#1A1816]">
                      {readout.train.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">TEST ERROR:</span>
                    <span className="font-bold text-[#DE5D35]">
                      {readout.test.toFixed(3)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#1A1816]/10 text-[10px] uppercase tracking-wider text-[#75716B]">
                    {readout.regime}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 text-[13px] text-[#4A4742] leading-[1.65]">
                  <strong className="text-[#1A1816]">The threshold</strong> is
                  the capacity at which parameters ≈ training rows — the first
                  point where exact interpolation becomes possible. It is the
                  peak, not the destination.
                </div>
              </div>

              <div className="lg:col-span-8 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                  <span>ERROR VS CAPACITY</span>
                  <span className="text-[#DE5D35] font-bold">
                    {capacity < 0.42
                      ? "UNDER-PARAMETERISED"
                      : capacity <= 0.58
                        ? "INTERPOLATION THRESHOLD"
                        : "OVER-PARAMETERISED"}
                  </span>
                </div>
                <svg
                  role="img"
                  aria-label="Test error plotted against model capacity"
                  viewBox="0 0 420 260"
                  className="w-full h-auto"
                >
                  {/* axes */}
                  <line
                    x1={X0}
                    y1="236"
                    x2="404"
                    y2="236"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={X0}
                    y1="20"
                    x2={X0}
                    y2="236"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />

                  {/* threshold marker */}
                  <line
                    x1={px(THRESHOLD_T)}
                    y1="20"
                    x2={px(THRESHOLD_T)}
                    y2="236"
                    stroke="#1A1816"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity="0.45"
                  />
                  <text
                    x={px(THRESHOLD_T)}
                    y="14"
                    fontSize="8.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#1A1816"
                  >
                    params = n
                  </text>

                  {/* training error — monotonically down to zero */}
                  <path
                    d={trainPath}
                    fill="none"
                    stroke="#75716B"
                    strokeWidth="1.8"
                    strokeDasharray="5 3"
                  />

                  {/* test error — the double descent */}
                  <path
                    d={testPath}
                    fill="none"
                    stroke="#DE5D35"
                    strokeWidth="2.8"
                  />

                  {/* cursor */}
                  <line
                    x1={px(capacity)}
                    y1="20"
                    x2={px(capacity)}
                    y2="236"
                    stroke="#1A1816"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <circle
                    cx={px(capacity)}
                    cy={py(readout.test)}
                    r="5.5"
                    fill="#DE5D35"
                    stroke="#FAF9F5"
                    strokeWidth="2"
                  />
                  <circle
                    cx={px(capacity)}
                    cy={py(readout.train)}
                    r="4"
                    fill="#1A1816"
                    stroke="#FAF9F5"
                    strokeWidth="1.5"
                  />

                  <text
                    x="222"
                    y="254"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#1A1816"
                  >
                    model capacity →
                  </text>
                  <text
                    x="16"
                    y="128"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#1A1816"
                    transform="rotate(-90 16 128)"
                  >
                    error →
                  </text>
                </svg>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] font-mono uppercase tracking-wider text-[#75716B]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-[#DE5D35]" /> test error
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-[#75716B]" /> train error
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03 — looped */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Watching It Happen
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Marker Walks The Curve
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Same curve, on a loop. The accent dot traces test error from a
              stiff model to an enormous one; the dashed ink line draws the
              training error in behind it. Watch the dot climb into the spike at
              the threshold — then keep going and come back down.
            </p>

            <Looped
              label="Test error traced against model capacity, spiking at the interpolation threshold and descending again"
              className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-3">
                DOUBLE DESCENT · 9s LOOP
              </div>
              <svg
                role="img"
                aria-label="Double descent curve with a marker moving along it"
                viewBox="0 0 420 260"
                className="w-full h-auto"
              >
                <line
                  x1={X0}
                  y1="236"
                  x2="404"
                  y2="236"
                  stroke="#1A1816"
                  strokeWidth="1.2"
                />
                <line
                  x1={X0}
                  y1="20"
                  x2={X0}
                  y2="236"
                  stroke="#1A1816"
                  strokeWidth="1.2"
                />

                {/* the threshold band, highlighted as the dot passes */}
                <rect
                  className="dd-spike"
                  x={px(0.42)}
                  y="20"
                  width={px(0.58) - px(0.42)}
                  height="216"
                  fill="rgba(222,93,53,0.10)"
                />

                <path
                  className="dd-train"
                  d={trainPath}
                  fill="none"
                  stroke="#1A1816"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
                <path
                  d={testPath}
                  fill="none"
                  stroke="#DE5D35"
                  strokeWidth="2.8"
                />

                {/* regime captions swap as the dot crosses each boundary */}
                <text
                  className="dd-regime"
                  x={px(0.2)}
                  y="210"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fill="#1A1816"
                >
                  classical regime
                </text>
                <text
                  x={px(0.78)}
                  y="210"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fill="#DE5D35"
                  fontWeight="bold"
                >
                  modern regime
                </text>

                <circle className="dd-dot" r="6" fill="#DE5D35" />
              </svg>
            </Looped>
            <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
              Left of the threshold the classical rule holds · right of it, it
              stops predicting anything useful
            </p>
          </section>

          {/* Section 04 */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / Why The Curve Bends Back
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Not All Zero-Training-Error Models Are Equal
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  The classical claim assumed that &ldquo;fits the training set
                  perfectly&rdquo; picks out one model. It does not. Past the
                  threshold there is an <strong>entire family</strong> of
                  parameter settings that all drive training error to zero — so
                  the training loss alone no longer says which one you got.
                </p>
                <p>
                  What breaks the tie is the <em>optimiser</em>. Gradient
                  descent started from a small initialisation does not wander
                  into an arbitrary interpolating solution; it converges toward
                  the one with the smallest parameter norm — the
                  &ldquo;closest&rdquo; interpolating fit to where it started.
                  That implicit preference is a form of regularisation nobody
                  wrote down, and it is doing real work:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-2">
                    What SGD converges toward
                  </span>
                  <MathTex
                    math="\min_{\theta} \; \lVert \theta \rVert_2^2 \quad \text{subject to} \quad \hat{y}_\theta(x_i) = y_i \;\; \forall i"
                    block
                  />
                </div>
                <p>
                  Among all the fits that nail the training data, prefer the
                  smoothest. A minimum-norm interpolating fit is typically much
                  less wiggly than the pathological memoriser the classical
                  picture imagined — and a smoother fit is exactly what
                  generalises.
                </p>
                <p>
                  There is a second effect stacked on top. In the
                  over-parameterised regime the model has far more directions to
                  move in than it has data constraints, so many of those extra
                  directions stay near their initialisation and never get shaped
                  by noise at all. Capacity you cannot steer is capacity that
                  cannot overfit.
                </p>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-3">
                    Three regimes
                  </span>
                  <div className="space-y-3 text-[12px] text-[#4A4742] leading-[1.6]">
                    <div>
                      <strong className="text-[#1A1816]">
                        Under-parameterised
                      </strong>
                      <br />
                      Cannot fit the signal. Train and test error both high.
                    </div>
                    <div className="pt-3 border-t border-[#1A1816]/10">
                      <strong className="text-[#1A1816]">
                        At the threshold
                      </strong>
                      <br />
                      Just enough freedom to interpolate, and the optimiser has
                      almost no spare directions to be smooth in. Worst
                      generalisation.
                    </div>
                    <div className="pt-3 border-t border-[#1A1816]/10">
                      <strong className="text-[#DE5D35]">
                        Over-parameterised
                      </strong>
                      <br />
                      Plenty of interpolating solutions, and the optimiser lands
                      on a smooth one. Test error falls again.
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#1A1816] text-[#FAF9F5]">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    The reframing
                  </span>
                  <p className="text-[13px] leading-[1.7]">
                    Bias-variance was never wrong — it was describing a
                    different axis. What matters is not raw parameter count but{" "}
                    <em>effective</em> capacity, which the optimiser and the
                    architecture decide as much as the size does.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 05 */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / Before You Throw Away Regularisation
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Fine Print
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                  It is not universal
                </span>
                <p className="text-[13px] text-[#4A4742] leading-[1.65]">
                  Double descent shows up clearly for some model families and
                  optimisers, weakly or not at all for others. It is an observed
                  phenomenon with conditions, not a law that replaces the
                  U-curve everywhere. Do not assume it applies to your problem
                  because it applied to someone else&apos;s.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                  The valley still exists
                </span>
                <p className="text-[13px] text-[#4A4742] leading-[1.65]">
                  The spike at the threshold is real and it is the worst place
                  to be. If your model sits anywhere near it, the second descent
                  is not a rescue — you have to travel all the way through the
                  bad region to reach the good one.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                  Bigger is not free
                </span>
                <p className="text-[13px] text-[#4A4742] leading-[1.65]">
                  That over-parameterised models generalise well does not mean
                  they cost nothing. They need the data, the compute and the
                  engineering to train. The useful reading is &ldquo;large
                  models can be worth it&rdquo;, never &ldquo;larger is always
                  better&rdquo;.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                  Measure, don&apos;t assume
                </span>
                <p className="text-[13px] text-[#4A4742] leading-[1.65]">
                  The only way to know where your curve turns is to sweep
                  capacity and plot the result. That plot is a validation-set
                  exercise — see{" "}
                  <Link
                    href="/resources/cross-validation"
                    className="text-[#DE5D35] font-bold hover:underline"
                  >
                    Topic 05
                  </Link>{" "}
                  for how to get an honest estimate.
                </p>
              </div>
            </div>
          </section>

          {/* Section 06 */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                06 / What Survives
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Practical Read
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Keep the classical instinct — it is still the right default
                  for the small, deliberately constrained models most tabular
                  problems want. A regularised linear model or a shallow tree
                  lives nowhere near the threshold, and the U-curve governs it
                  completely.
                </p>
                <p>
                  Update the part that said zero training error is automatically
                  fatal. It is a warning sign, not a verdict: what matters is
                  how the zero was reached. Reached by memorising, it
                  generalises badly. Reached by a smooth minimum-norm fit in a
                  hugely over-parameterised space, it can generalise very well
                  indeed.
                </p>
                <p>
                  And keep the habit that both pictures agree on: judge a model
                  on data it has not seen. Every curve on this page was measured
                  on a held-out set — that discipline is the one thing double
                  descent never overturns.
                </p>
              </div>

              <div className="lg:col-span-5 p-4 bg-[#1A1816] text-[#FAF9F5]">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-3">
                  Takeaways
                </span>
                <ul className="text-[13px] leading-[1.75] space-y-2">
                  <li>
                    • Test error can rise at the interpolation threshold and
                    then fall again.
                  </li>
                  <li>
                    • Past the threshold, training loss stops identifying a
                    unique model — the optimiser picks among many.
                  </li>
                  <li>
                    • Minimum-norm bias is implicit regularisation you get for
                    free.
                  </li>
                  <li>
                    • Bias-variance still holds; the axis is effective capacity,
                    not parameter count.
                  </li>
                  <li>
                    • Sweep and measure. Never infer the shape of your own curve
                    from someone else&apos;s.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8">
            <p className="text-[11px] font-mono text-[#75716B] mb-5">
              Adapted from MLU-Explain (Amazon, CC BY-SA 4.0).
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/resources/train-test-validation"
                className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
              >
                <span>← Topic 12: Train, Test &amp; Validation</span>
              </Link>
              <Link
                href="/resources/equality-of-odds"
                className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
              >
                <span>Topic 14: Equality of Odds →</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
