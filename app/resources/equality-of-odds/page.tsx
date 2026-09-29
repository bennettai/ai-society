"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles } from "@/components/looped";
import MathTex from "@/components/MathTex";

const GROUPS = [
  { key: "a", name: "Group A", colour: "#1A1816" },
  { key: "b", name: "Group B", colour: "#DE5D35" },
] as const;

// Rates are read off a 2×2 confusion matrix per group. Group B gets fewer true
// positives and more false positives — the classic picture of a model that is
// accurate overall but unevenly wrong.
const COUNTS = [
  { pos: 120, neg: 480, tp: 96, fp: 76 }, // Group A
  { pos: 120, neg: 480, tp: 66, fp: 156 }, // Group B
];

const rates = (i: number) => {
  const c = COUNTS[i];
  return {
    tpr: c.tp / c.pos,
    fpr: c.fp / c.neg,
    accuracy: (c.tp + (c.neg - c.fp)) / (c.pos + c.neg),
  };
};

export default function EqualityOfOddsArticlePage() {
  // Section 03: how far the reader has dragged Group B toward parity.
  const [equalize, setEqualize] = useState<number>(0);

  const view = useMemo(() => {
    const a = rates(0);
    const raw = rates(1);
    // Dragging toward parity moves Group B's TPR and FPR onto Group A's.
    const tprB = raw.tpr + (a.tpr - raw.tpr) * equalize;
    const fprB = raw.fpr + (a.fpr - raw.fpr) * equalize;
    return {
      a,
      b: { ...raw, tpr: tprB, fpr: fprB },
      gapTpr: Math.abs(raw.tpr - a.tpr) * (1 - equalize),
      gapFpr: Math.abs(raw.fpr - a.fpr) * (1 - equalize),
    };
  }, [equalize]);

  // Section 04 loop: the two groups' TPR and FPR bars breathe between the
  // unconstrained and the equalised state, so the gap is visible in motion.
  const eoCss = `
    @keyframes eoBreathe {
      0%, 100% { opacity: 0.45; }
      50%      { opacity: 1; }
    }
    @keyframes eoGapPulse {
      0%, 100% { opacity: 0.25; }
      50%      { opacity: 1; }
    }
    .eo-bar { animation: eoBreathe 6s ease-in-out infinite; }
    .eo-gap { animation: eoGapPulse 6s ease-in-out infinite; }
  `;

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen">
        <LoopedStyles
          css={eoCss}
          reduceMotionTargets={[".eo-bar", ".eo-gap"]}
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
                Fairness · Equality of Odds
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 14
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              Equality of Odds
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              A model can be accurate overall and still be wrong in a pattern
              that tracks who you are. This essay defines what it means for two
              groups to be treated even-handedly, measures it, and shows the
              three places you can intervene.
            </p>
          </header>

          {/* Section 01 */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / The Same Model, Two Outcomes
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Accurate Isn&apos;t The Same As Even
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Suppose a model screens loan applications and clears 82% of
                  them correctly overall. That single number can hide a great
                  deal. Split the applicants by a protected attribute — say, two
                  demographic groups — and the errors may not be spread evenly
                  at all.
                </p>
                <p>
                  Group&nbsp;A might have most of its genuine defaulters caught,
                  while Group&nbsp;B&apos;s slip through more often.
                  Group&nbsp;B might simultaneously have more good applicants
                  wrongly rejected. The overall accuracy is unchanged; the{" "}
                  <em>experience</em> of the model is completely different
                  depending on which group you are in.
                </p>
                <div className="p-4 bg-[#1A1816] text-[#FAF9F5]">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    The question this essay answers
                  </span>
                  <p className="text-[13px] leading-[1.7]">
                    What exactly should be <em>equal</em> between the groups?
                    Two candidate answers look obviously right and turn out to
                    conflict. Picking between them is a decision you have to
                    make on purpose.
                  </p>
                </div>
                <p>
                  The two error rates that matter are the ones{" "}
                  <Link
                    href="/resources/precision-recall"
                    className="text-[#DE5D35] font-bold hover:underline"
                  >
                    Topic 03
                  </Link>{" "}
                  taught us to name: the <strong>true positive rate</strong>{" "}
                  (recall) and the <strong>false positive rate</strong>.
                </p>
              </div>

              <div className="lg:col-span-5 space-y-4">
                {GROUPS.map((g, i) => {
                  const r = rates(i);
                  return (
                    <div
                      key={g.key}
                      className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15"
                    >
                      <span
                        className="block text-[11px] font-mono uppercase tracking-widest font-bold mb-3"
                        style={{ color: g.colour }}
                      >
                        {g.name}
                      </span>
                      <div className="space-y-2 font-mono text-[12px]">
                        <div className="flex justify-between">
                          <span className="text-[#75716B]">TRUE POS RATE</span>
                          <span className="font-bold text-[#1A1816]">
                            {(r.tpr * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#75716B]">FALSE POS RATE</span>
                          <span className="font-bold text-[#1A1816]">
                            {(r.fpr * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[#1A1816]/10">
                          <span className="text-[#75716B]">ACCURACY</span>
                          <span className="font-bold text-[#75716B]">
                            {(r.accuracy * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#75716B] px-1">
                  Same accuracy class · very different error profile
                </p>
              </div>
            </div>
          </section>

          {/* Section 02 */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                02 / The Definition
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                What &ldquo;Equalized Odds&rdquo; Actually Requires
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  A predictor <MathTex math="\hat{Y}" /> satisfies{" "}
                  <strong>equalized odds</strong> with respect to a sensitive
                  attribute <MathTex math="A" /> and true outcome{" "}
                  <MathTex math="Y" /> when the prediction and the attribute are
                  independent <em>conditional on the true label</em>:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <MathTex
                    math="\hat{Y} \perp A \;\mid\; Y \quad \Longleftrightarrow \quad P(\hat{Y}{=}1 \mid A{=}0, Y{=}y) = P(\hat{Y}{=}1 \mid A{=}1, Y{=}y)"
                    block
                  />
                  <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                    for both <MathTex math="y = 0" /> and{" "}
                    <MathTex math="y = 1" />.
                  </p>
                </div>
                <p>
                  Reading it in the two cases spells out the practical
                  requirement. When <MathTex math="y = 1" /> the condition says
                  the two groups must have the same{" "}
                  <strong>true positive rate</strong>. When{" "}
                  <MathTex math="y = 0" /> it says they must have the same{" "}
                  <strong>false positive rate</strong>. Both, not either.
                </p>
                <p>
                  Because <MathTex math="\text{FPR}" /> and{" "}
                  <MathTex math="\text{TPR}" /> are the two axes of the{" "}
                  <Link
                    href="/resources/roc-auc"
                    className="text-[#DE5D35] font-bold hover:underline"
                  >
                    ROC curve
                  </Link>
                  , this has a tidy geometric reading: each group&apos;s
                  operating point must sit at the <em>same coordinates</em> in
                  ROC space.
                </p>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 bg-[#FAF9F5] border border-[#DE5D35]">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    The weaker cousin: Equal Opportunity
                  </span>
                  <MathTex
                    math="P(\hat{Y}{=}1 \mid A{=}0, Y{=}1) = P(\hat{Y}{=}1 \mid A{=}1, Y{=}1)"
                    block
                  />
                  <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                    Equal opportunity drops the <MathTex math="y = 0" /> half:
                    only the true positive rates must match. It permits unequal
                    false positive rates, which is sometimes exactly what you
                    want — and sometimes exactly the harm you were trying to
                    prevent.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                    What it deliberately does not require
                  </span>
                  <ul className="text-[13px] text-[#4A4742] leading-[1.7] space-y-1.5">
                    <li>
                      • <strong>Demographic parity</strong> — equal flag rates
                      regardless of the true outcome. It ignores the labels
                      entirely, so a model can satisfy it and still be useless.
                    </li>
                    <li>
                      • <strong>Equal accuracy</strong> per group — a group can
                      match on both rates and still differ in calibration.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03 — interactive */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Measuring The Gap
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Take The Parity Dial
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Group&nbsp;A is the reference. Drag the dial to move Group&nbsp;B
              from its original operating point toward Group&nbsp;A&apos;s —
              watching the true positive rate and the false positive rate close
              their gaps together. Parity is the point where both gaps reach
              zero at once.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 space-y-5">
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                    <span>GROUP B → PARITY</span>
                    <span className="font-bold text-[#DE5D35]">
                      {(equalize * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={equalize}
                    onChange={(e) => setEqualize(parseFloat(e.target.value))}
                    className="w-full accent-[#DE5D35] cursor-pointer"
                    aria-label="Group B parity adjustment"
                  />
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">TPR GAP:</span>
                    <span
                      className={`font-bold ${view.gapTpr < 0.005 ? "text-[#1A1816]" : "text-[#DE5D35]"}`}
                    >
                      {(view.gapTpr * 100).toFixed(1)} pp
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">FPR GAP:</span>
                    <span
                      className={`font-bold ${view.gapFpr < 0.005 ? "text-[#1A1816]" : "text-[#DE5D35]"}`}
                    >
                      {(view.gapFpr * 100).toFixed(1)} pp
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#1A1816]/10 text-[10px] uppercase tracking-wider">
                    {equalize > 0.99 ? (
                      <span className="text-[#1A1816] font-bold">
                        ✓ equalized odds satisfied
                      </span>
                    ) : (
                      <span className="text-[#75716B]">not yet equalized</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 text-[13px] text-[#4A4742] leading-[1.65]">
                  <strong className="text-[#1A1816]">
                    Note the dial&apos;s shape.
                  </strong>{" "}
                  You cannot close one gap without closing the other here,
                  because both rates move together. In general that is a
                  constraint you have to solve for, not a dial you can simply
                  turn.
                </div>
              </div>

              <div className="lg:col-span-8 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-4">
                  ERROR RATES BY GROUP
                </div>

                <svg
                  role="img"
                  aria-label="Error rates compared across groups"
                  viewBox="0 0 380 220"
                  className="w-full h-auto"
                >
                  {/* axes */}
                  <line
                    x1="46"
                    y1="188"
                    x2="368"
                    y2="188"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="46"
                    y1="16"
                    x2="46"
                    y2="188"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />

                  {/* gridlines at 25/50/75/100 % */}
                  {[0.25, 0.5, 0.75, 1].map((v) => (
                    <g key={v}>
                      <line
                        x1="46"
                        y1={188 - v * 164}
                        x2="368"
                        y2={188 - v * 164}
                        stroke="#1A1816"
                        strokeWidth="0.5"
                        opacity="0.16"
                      />
                      <text
                        x="40"
                        y={188 - v * 164 + 3}
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="end"
                        fill="#75716B"
                      >
                        {v * 100}%
                      </text>
                    </g>
                  ))}

                  {/* TPR pair */}
                  <text
                    x="118"
                    y="206"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#1A1816"
                    fontWeight="bold"
                  >
                    TRUE POS RATE
                  </text>
                  <rect
                    x="76"
                    y={188 - view.a.tpr * 164}
                    width="28"
                    height={view.a.tpr * 164}
                    fill="#1A1816"
                  />
                  <rect
                    className="eo-bar"
                    x="112"
                    y={188 - view.b.tpr * 164}
                    width="28"
                    height={view.b.tpr * 164}
                    fill="#DE5D35"
                  />
                  {Math.abs(view.b.tpr - view.a.tpr) > 0.01 && (
                    <line
                      className="eo-gap"
                      x1="126"
                      y1={188 - view.a.tpr * 164}
                      x2="126"
                      y2={188 - view.b.tpr * 164}
                      stroke="#DE5D35"
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />
                  )}

                  {/* FPR pair */}
                  <text
                    x="288"
                    y="206"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fill="#1A1816"
                    fontWeight="bold"
                  >
                    FALSE POS RATE
                  </text>
                  <rect
                    x="246"
                    y={188 - view.a.fpr * 164}
                    width="28"
                    height={view.a.fpr * 164}
                    fill="#1A1816"
                  />
                  <rect
                    className="eo-bar"
                    x="282"
                    y={188 - view.b.fpr * 164}
                    width="28"
                    height={view.b.fpr * 164}
                    fill="#DE5D35"
                  />
                  {Math.abs(view.b.fpr - view.a.fpr) > 0.01 && (
                    <line
                      className="eo-gap"
                      x1="296"
                      y1={188 - view.a.fpr * 164}
                      x2="296"
                      y2={188 - view.b.fpr * 164}
                      stroke="#DE5D35"
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />
                  )}
                </svg>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] font-mono uppercase tracking-wider text-[#75716B]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#1A1816]" /> Group A
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-[#DE5D35]" /> Group B
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 04 — looped */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / The Gap On Loop
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                What You Are Looking For
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  On a real audit you would plot exactly this: paired bars per
                  rate, one pair per group. The pulse marks the distance you are
                  trying to eliminate.
                </p>
                <p>
                  <strong>Both pairs must close.</strong> A model that matches
                  on the true positive rate but not the false positive rate
                  satisfies equal opportunity while still imposing a systematic
                  cost on one group — more of its innocent members get flagged.
                </p>
                <p>
                  Lending makes the asymmetry concrete. A missed defaulter is a
                  loss to the lender. A wrongly rejected applicant is a loss to
                  the applicant. Those two costs are borne by different people,
                  which is precisely why &ldquo;just maximise accuracy&rdquo; is
                  not a neutral choice.
                </p>
              </div>

              <Looped
                label="Paired bars showing true positive and false positive rates for two groups, with the disparity gaps pulsing"
                className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-4">
                  DISPARITY AUDIT · 6s LOOP
                </div>
                <svg
                  role="img"
                  aria-label="Disparity audit comparing error rates between groups"
                  viewBox="0 0 340 180"
                  className="w-full h-auto"
                >
                  <line
                    x1="20"
                    y1="152"
                    x2="320"
                    y2="152"
                    stroke="#1A1816"
                    strokeWidth="1.2"
                  />
                  {[0, 1].map((r) => {
                    const isTpr = r === 0;
                    const xBase = isTpr ? 30 : 180;
                    const label = isTpr ? "TPR" : "FPR";
                    const hi = isTpr ? 0.8 : 0.16;
                    const lo = isTpr ? 0.55 : 0.33;
                    return (
                      <g key={label}>
                        <text
                          x={xBase + 56}
                          y="170"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill="#1A1816"
                          fontWeight="bold"
                        >
                          {label}
                        </text>
                        <rect
                          x={xBase}
                          y={152 - hi * 108}
                          width="30"
                          height={hi * 108}
                          fill="#1A1816"
                        />
                        <rect
                          className="eo-bar"
                          x={xBase + 40}
                          y={152 - lo * 108}
                          width="30"
                          height={lo * 108}
                          fill="#DE5D35"
                        />
                        <line
                          className="eo-gap"
                          x1={xBase + 70}
                          y1={152 - hi * 108}
                          x2={xBase + 70}
                          y2={152 - lo * 108}
                          stroke="#DE5D35"
                          strokeWidth="2"
                          strokeDasharray="3 2"
                        />
                        <text
                          x={xBase + 78}
                          y={152 - ((hi + lo) * 108) / 2 + 3}
                          fontSize="8"
                          fontFamily="monospace"
                          fill="#DE5D35"
                          fontWeight="bold"
                        >
                          gap
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <p className="text-[11px] font-mono text-[#75716B] mt-3 uppercase tracking-wider">
                  Equalized odds requires every pair to be level
                </p>
              </Looped>
            </div>
          </section>

          {/* Section 05 */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / Three Places To Intervene
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Pre-, In-, and Post-Processing
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Every fairness intervention sits at one of three stages. Where you
              sit determines what you have to change, and what you must trust.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  Pre-processing
                </span>
                <p className="text-[13px] text-[#4A4742] leading-[1.65] mb-3">
                  Change the <em>data</em> before training: repair the labels,
                  reweight the rows, or project the features so the sensitive
                  attribute is harder to recover from them.
                </p>
                <p className="text-[12px] text-[#75716B] leading-[1.6]">
                  <strong>Pro:</strong> model-agnostic — works with any learner.
                  <br />
                  <strong>Con:</strong> you must touch the training data, and
                  the repair itself can destroy real signal.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  In-processing
                </span>
                <p className="text-[13px] text-[#4A4742] leading-[1.65] mb-3">
                  Change the <em>objective</em>: add the parity constraint to
                  the loss, or train adversarially so a second network cannot
                  recover the attribute from the predictions.
                </p>
                <p className="text-[12px] text-[#75716B] leading-[1.6]">
                  <strong>Pro:</strong> the constraint and the accuracy tradeoff
                  are optimised together.
                  <br />
                  <strong>Con:</strong> you need access to the training loop and
                  the sensitive labels <em>at training time</em>.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  Post-processing
                </span>
                <p className="text-[13px] text-[#4A4742] leading-[1.65] mb-3">
                  Leave the model alone and adjust the <em>decisions</em>: give
                  each group its own threshold, chosen so both error rates
                  match.
                </p>
                <p className="text-[12px] text-[#75716B] leading-[1.6]">
                  <strong>Pro:</strong> works on a frozen black-box model you
                  cannot retrain, and needs only a validation set.
                  <br />
                  <strong>Con:</strong> per-group thresholds are legally and
                  politically fraught in many domains.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#1A1816] text-[#FAF9F5]">
              <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                The uncomfortable part
              </span>
              <p className="text-[13px] leading-[1.7]">
                Parity is not free. Forcing the rates to match generally costs
                accuracy, because the unconstrained optimum is, by definition,
                the most accurate point. There is also a known impossibility
                result: except in degenerate cases you cannot simultaneously
                have equalized odds and <em>calibration within groups</em> when
                the groups have different base rates. Someone has to decide
                which guarantee matters more for this application — that
                decision is not a modelling choice, it is a policy one.
              </p>
            </div>
          </section>

          {/* Section 06 */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                06 / In Practice
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                An Audit You Can Actually Run
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Fairness is not a metric you compute once at the end. It is a
                  slicing exercise you run alongside the evaluation you already
                  do: take your held-out set — see{" "}
                  <Link
                    href="/resources/train-test-validation"
                    className="text-[#DE5D35] font-bold hover:underline"
                  >
                    Topic 12
                  </Link>{" "}
                  — and compute every metric you care about <em>per group</em>,
                  not just overall.
                </p>
                <p>
                  The absolute numbers matter less than the{" "}
                  <strong>gaps</strong>. A model with a 3-point TPR gap and a
                  2-point FPR gap is in a very different place from one with a
                  25-point gap, even when their headline accuracies are
                  identical.
                </p>
                <p>
                  And remember that the sensitive attribute you have labels for
                  is rarely the only axis that matters. The same slicing should
                  be run across every dimension on which your model could
                  plausibly be uneven — which means the honest answer to
                  &ldquo;is this model fair?&rdquo; is usually &ldquo;fair with
                  respect to these attributes, on this data, by these
                  measures&rdquo;.
                </p>
              </div>

              <div className="lg:col-span-5 p-4 bg-[#1A1816] text-[#FAF9F5]">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-3">
                  Checklist
                </span>
                <ul className="text-[13px] leading-[1.75] space-y-2">
                  <li>
                    • Define the sensitive attributes <em>before</em> modelling.
                  </li>
                  <li>• Report TPR and FPR per group, never only overall.</li>
                  <li>
                    • Decide which parity notion is required, and say why.
                  </li>
                  <li>
                    • Measure the accuracy you paid to get it — parity is never
                    free.
                  </li>
                  <li>
                    • Re-run the audit whenever the data or the model changes;
                    fairness does not survive a retrain untouched.
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
                href="/resources/double-descent"
                className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
              >
                <span>← Topic 13: Double Descent</span>
              </Link>
              <Link
                href="/resources/reinforcement-learning"
                className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
              >
                <span>Topic 15: Reinforcement Learning →</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
