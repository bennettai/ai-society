"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles } from "@/components/looped";
import MathTex from "@/components/MathTex";

export default function CrossValidationArticlePage() {
  const [kFolds, setKFolds] = useState<number>(5);
  const [activeIteration, setActiveIteration] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const foldScores = useMemo(() => {
    const baseErrors: Record<number, number[]> = {
      3: [0.142, 0.168, 0.155],
      5: [0.138, 0.152, 0.141, 0.16, 0.147],
      10: [0.135, 0.142, 0.158, 0.139, 0.146, 0.151, 0.163, 0.14, 0.148, 0.155],
    };
    return baseErrors[kFolds] || baseErrors[5];
  }, [kFolds]);

  const stats = useMemo(() => {
    const mean = foldScores.reduce((acc, s) => acc + s, 0) / foldScores.length;
    const variance =
      foldScores.reduce((acc, s) => acc + (s - mean) ** 2, 0) /
      (foldScores.length - 1);
    const stdErr = Math.sqrt(variance / foldScores.length);

    return {
      mean,
      stdErr,
    };
  }, [foldScores]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIteration((prev) => (prev + 1) % kFolds);
    }, 1400);
    return () => clearInterval(interval);
  }, [isAutoPlaying, kFolds]);

  // Loop animation: 5 fixed splits, one 5s cycle, row r lights up at r*1s
  const loopSplits = [0, 1, 2, 3, 4];
  const loopLosses = [13.8, 15.2, 14.1, 16.0, 14.7];

  const css = `
    @keyframes cvRotateRow {
      0%       { border-color: #DE5D35; background: rgba(222,93,53,0.07); }
      18%      { border-color: #DE5D35; background: rgba(222,93,53,0.07); }
      26%, 100% { border-color: rgba(26,24,22,0.15); background: transparent; }
    }
    @keyframes cvRotateBadge {
      0%       { opacity: 1; }
      18%      { opacity: 1; }
      26%, 100% { opacity: 0; }
    }
    @keyframes cvDataFlow {
      0%, 12%  { opacity: 0; transform: translateY(-8px); }
      20%      { opacity: 1; transform: translateY(0); }
      80%      { opacity: 1; }
      100%     { opacity: 0; }
    }
    .cv-row    { animation: cvRotateRow 5s linear infinite; }
    .cv-badge  { animation: cvRotateBadge 5s linear infinite; }
    .cv-flow   { animation: cvDataFlow 5s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .cv-row, .cv-badge, .cv-flow { animation: none; }
    }
  `;

  // Section 04 strip: rounds, training share, and bias/variance direction over K
  const kStrip = [
    {
      k: "K = 3",
      rounds: "3",
      train: "66.7%",
      bias: "HIGH ↓",
      variance: "LOWER ↑",
    },
    {
      k: "K = 5",
      rounds: "5",
      train: "80.0%",
      bias: "MODERATE ↓",
      variance: "MODERATE ↑",
    },
    {
      k: "K = 10",
      rounds: "10",
      train: "90.0%",
      bias: "LOW ↓",
      variance: "HIGHER ↑",
    },
    {
      k: "K = N",
      rounds: "N",
      train: "(N − 1) / N",
      bias: "NEAR ZERO ↓",
      variance: "HIGHEST ↑",
    },
  ];

  // Section 04 LOOCV diagram: N points, one lone holdout per illustrative round
  const loocvN = 24;
  const loocvHoldouts = [3, 11, 19];

  // Section 05 loop: marker walks the U once per 9s; bands cross-fade in counter-phase
  const choosingKCss = `
    @keyframes cv2MarkerWalk {
      0%    { transform: translate(0px, 0px);          opacity: 0; }
      3%    { opacity: 1; }
      12.5% { transform: translate(62.5px, 65px); }
      25%   { transform: translate(117.5px, 105.4px); }
      37.5% { transform: translate(168.8px, 125.3px); }
      50%   { transform: translate(220px, 129px); }
      62.5% { transform: translate(270.9px, 117.1px); }
      75%   { transform: translate(320px, 89.6px); }
      87.5% { transform: translate(369.1px, 50.4px); }
      97%   { opacity: 1; }
      100%  { transform: translate(420px, 3px);        opacity: 0; }
    }
    @keyframes cv2BiasBand {
      0%   { opacity: 0.75; transform: scaleY(1); }
      100% { opacity: 0.2;  transform: scaleY(0.45); }
    }
    @keyframes cv2VarBand {
      0%   { opacity: 0.2;  transform: scaleY(0.45); }
      100% { opacity: 0.75; transform: scaleY(1); }
    }
    .cv2-marker { animation: cv2MarkerWalk 9s linear infinite; }
    .cv2-bias {
      transform-box: fill-box; transform-origin: 50% 100%;
      animation: cv2BiasBand 9s ease-in-out infinite;
    }
    .cv2-var {
      transform-box: fill-box; transform-origin: 50% 100%;
      animation: cv2VarBand 9s ease-in-out infinite;
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
                Validation · Cross-Validation
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 05
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              K-Fold Partitioning &amp; Generalization
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              One test split is one lottery ticket. K-fold makes every data
              point take a turn as the examiner — watch the holdout rotate
              forever, then drive the machine yourself.
            </p>
          </header>

          {/* Section 01: Looped rotation animation */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / The Rotating Examiner
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Five Splits, One Honest Score
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  A single train/test split suffers from{" "}
                  <strong>sample variance</strong>: a lucky split makes a weak
                  model look brilliant; an unlucky one buries a strong model.
                  The fix is to hold a <em>tournament</em>:
                </p>
                <ol className="space-y-2 list-none">
                  <li>
                    <strong>1.</strong> Chop the dataset into{" "}
                    <MathTex math="K" /> equal folds.
                  </li>
                  <li>
                    <strong>2.</strong> Train on <MathTex math="K-1" /> folds,
                    validate on the one left out.
                  </li>
                  <li>
                    <strong>3.</strong> Rotate the holdout fold until every fold
                    has been the examiner once.
                  </li>
                  <li>
                    <strong>4.</strong> Average the <MathTex math="K" /> scores
                    — now <em>every</em> point was validated exactly once, by a
                    model that never saw it.
                  </li>
                </ol>
                <p>
                  In the loop on the right, watch the orange validation fold
                  march down the diagonal. Each flash is a fresh model trained
                  from scratch — nothing about the model carries over between
                  rounds, which is exactly why the average is trustworthy.
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">
                      FIVE-FOLD MEAN ERROR:
                    </span>
                    <span className="font-bold text-[#DE5D35]">14.76%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">SPREAD ACROSS FOLDS:</span>
                    <span className="font-bold text-[#1A1816]">
                      13.8% – 16.0%
                    </span>
                  </div>
                </div>
              </div>

              {/* CSS-only rotation loop */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-4 text-[11px] font-mono text-[#75716B]">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#EAE7DF] border border-[#1A1816]/20" />
                      <span>Train</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#DE5D35]" />
                      <span>Validation</span>
                    </span>
                  </div>
                  <span className="font-semibold text-[#DE5D35]">
                    auto-looping · 5s cycle
                  </span>
                </div>

                <div className="space-y-2">
                  {loopSplits.map((row) => (
                    <div
                      key={row}
                      className="cv-row flex items-center gap-2.5 p-2 border rounded-[2px]"
                      style={{ animationDelay: `${row}s` }}
                    >
                      <span className="text-[10px] font-mono text-[#75716B] w-14 shrink-0">
                        SPLIT #{row + 1}
                      </span>
                      <div className="flex gap-1 flex-1 h-6">
                        {loopSplits.map((col) => (
                          <div
                            key={col}
                            className={`flex-1 flex items-center justify-center text-[9px] font-mono rounded-[1px] transition-colors duration-200 ${
                              col === row
                                ? "bg-[#DE5D35] text-white font-bold"
                                : "bg-[#EAE7DF] text-[#75716B]"
                            }`}
                          >
                            {col === row ? "VAL" : `F${col + 1}`}
                          </div>
                        ))}
                      </div>
                      <span
                        className="cv-badge text-[10px] font-mono font-bold text-[#DE5D35] w-14 text-right shrink-0"
                        style={{ animationDelay: `${row}s` }}
                      >
                        {loopLosses[row].toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Aggregation bar */}
                <div className="cv-flow mt-4 p-3 bg-[#1A1816] text-[#FAF9F5] text-center text-[11px] font-mono uppercase tracking-widest rounded-[2px]">
                  CV score = mean of the five flashes = 14.76% ± 0.39%
                </div>
              </div>
            </div>
          </section>

          {/* Section 02: Interactive partition matrix */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                  02 / Take The Controls
                </span>
                <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                  Change K, Watch the Variance
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#75716B] mr-2">
                  FOLDS (K):
                </span>
                {[3, 5, 10].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setKFolds(k);
                      setActiveIteration(0);
                    }}
                    className={`px-3 py-1 text-[12px] font-mono border transition-colors cursor-pointer ${
                      kFolds === k
                        ? "bg-[#1A1816] text-[#EFECE6] border-[#1A1816] font-bold"
                        : "bg-[#FAF9F5] text-[#1A1816] border-[#1A1816]/20 hover:border-[#1A1816]"
                    }`}
                  >
                    K={k}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Switch between <MathTex math="K = 3, 5, 10" />. Larger{" "}
                  <MathTex math="K" /> means more training data per round (less
                  biased estimate) but higher variance between folds and more
                  compute. The trade-off ends at <strong>Leave-One-Out</strong>{" "}
                  (<MathTex math="K = N" />
                  ): maximal data, maximal variance, maximal cost.
                </p>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#75716B]">
                      ACTIVE ITERATION:
                    </span>
                    <span className="text-[13px] font-mono font-bold text-[#DE5D35]">
                      ROUND {activeIteration + 1} OF {kFolds}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIteration((prev) => (prev + 1) % kFolds)
                      }
                      className="flex-1 py-2 bg-[#FAF9F5] border border-[#1A1816]/20 text-[11px] font-mono hover:border-[#1A1816] transition-colors cursor-pointer"
                    >
                      Step to Next Fold →
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className={`px-4 py-2 border text-[11px] font-mono transition-colors cursor-pointer ${
                        isAutoPlaying
                          ? "bg-[#DE5D35] text-white border-[#DE5D35]"
                          : "bg-[#1A1816] text-[#EFECE6] border-[#1A1816]"
                      }`}
                    >
                      {isAutoPlaying ? "Pause Loop" : "Auto-Cycle"}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">MEAN CV ERROR:</span>
                    <span className="font-bold text-[#DE5D35]">
                      {(stats.mean * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">STANDARD ERROR (SE):</span>
                    <span className="font-bold text-[#1A1816]">
                      ±{(stats.stdErr * 100).toFixed(3)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Visual Matrix Grid */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-4 text-[11px] font-mono text-[#75716B]">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#EAE7DF] border border-[#1A1816]/20" />
                      <span>Train Folds ({kFolds - 1})</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#DE5D35]" />
                      <span>Validation Holdout (1)</span>
                    </span>
                  </div>
                  <span className="font-semibold text-[#DE5D35]">
                    Fold {activeIteration + 1}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {Array.from({ length: kFolds }, (_, iterIdx) => {
                    const isCurrent = iterIdx === activeIteration;
                    return (
                      <button
                        type="button"
                        key={iterIdx}
                        aria-pressed={isCurrent}
                        onClick={() => setActiveIteration(iterIdx)}
                        className={`block w-full text-left p-2.5 border transition-all cursor-pointer ${
                          isCurrent
                            ? "border-[#DE5D35] bg-[#DE5D35]/5 ring-1 ring-[#DE5D35]"
                            : "border-[#1A1816]/15 bg-white opacity-85 hover:opacity-100"
                        }`}
                      >
                        <span className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                          <span
                            className={
                              isCurrent
                                ? "font-bold text-[#DE5D35]"
                                : "text-[#75716B]"
                            }
                          >
                            SPLIT #{iterIdx + 1}
                          </span>
                          <span className="font-mono text-[11px]">
                            Holdout Loss:{" "}
                            {(foldScores[iterIdx] * 100).toFixed(1)}%
                          </span>
                        </span>

                        <span className="flex gap-1 h-6">
                          {Array.from({ length: kFolds }, (_, foldIdx) => {
                            const isHoldout = foldIdx === iterIdx;
                            return (
                              <span
                                key={foldIdx}
                                className={`flex-1 flex items-center justify-center text-[10px] font-mono rounded-[1px] transition-colors ${
                                  isHoldout
                                    ? "bg-[#DE5D35] text-white font-bold"
                                    : "bg-[#EAE7DF] text-[#75716B]"
                                }`}
                              >
                                {isHoldout ? "VAL" : `F${foldIdx + 1}`}
                              </span>
                            );
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: Variants & formulation */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / The Rulebook
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Variants, Formulas &amp; the 1-SE Rule
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  STRATIFIED K-FOLD
                </span>
                <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                  Preserves class ratios inside every fold — the default choice
                  for imbalanced data. Without it, a fold may contain almost no
                  positives and report nonsense.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  SHUFFLE FIRST
                </span>
                <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                  If data is ordered (by time, by class, by source), unshuffled
                  folds become systematically different. Always shuffle — unless
                  order is information, as in time series.
                </p>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  NESTED CV
                </span>
                <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                  Tuning hyperparameters on the same CV you report is leakage.
                  Nested CV runs an inner loop for tuning inside an outer loop
                  for honest evaluation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-[14px] text-[#4A4742] leading-[1.7]">
              <div className="space-y-4">
                <p>
                  The overall cross-validation generalization score aggregates
                  the out-of-fold validation loss across all{" "}
                  <MathTex math="K" /> splits:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    CV Error Aggregation
                  </span>
                  <MathTex
                    math="\text{CV}_{(K)} = \frac{1}{K} \sum_{k=1}^K \mathcal{L}_k = \frac{1}{K} \sum_{k=1}^K \left( \frac{1}{N_k} \sum_{i \in \mathcal{C}_k} \ell(y_i, \hat{f}^{(-k)}(x_i)) \right)"
                    block
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p>
                  <strong>The One-Standard-Error Rule:</strong> when comparing
                  models, don&apos;t blindly take the minimum. Pick the
                  <em> simplest</em> model whose error sits within one standard
                  error of the best — it will generalize more reliably:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    1-SE Selection Boundary
                  </span>
                  <MathTex
                    math="\text{Error}_{\text{candidate}} \le \text{Error}_{\text{best}} + \text{SE}(\text{Error}_{\text{best}})"
                    block
                  />
                </div>
                <p>
                  This estimator feeds every experiment in Topics 06–09: the
                  tree depths, forest sizes, and network capacities ahead are
                  all chosen by exactly this loop.
                </p>
              </div>
            </div>
          </section>

          {/* Section 04: Leave One Out */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / The Degenerate Limit
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Leave One Out, or K = N
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Put the single hold-out set back under the lamp. One
                  partition, one trained model, one number — and that number is
                  only as stable as the split. Move a handful of rows between
                  train and validation and the measured error can swing by more
                  than the real gap between two competing models. It is a
                  high-variance estimate because it is built from a single draw.
                </p>
                <p>
                  <strong>Leave-One-Out Cross-Validation</strong> pushes the
                  dial to its limit: set <MathTex math="K = N" />, one fold per
                  observation. Each round trains on <MathTex math="N-1" />{" "}
                  points and validates on the single point left out. Rotate
                  until every point has had a turn as the examiner, then average
                  the <MathTex math="N" /> scores. Nothing is held back — every
                  model sees almost the entire dataset.
                </p>
                <p>
                  The appeal is genuine: the estimate is{" "}
                  <strong>nearly unbiased</strong>. Each training set is the
                  full dataset minus one point, so LOOCV scores the model you
                  would actually ship, not one starved of 20% of the data. But
                  the <MathTex math="N" /> validation scores are not
                  independent. Consecutive models differ by a single training
                  point, so their errors move together. Correlated scores do not
                  average down — the standard error barely shrinks — and the
                  estimate stays noisy. You bought that noise with{" "}
                  <MathTex math="N" /> full fits.
                </p>
                <p>
                  That is why nobody ships LOOCV for large <MathTex math="N" />:{" "}
                  <MathTex math="N" /> rounds at <MathTex math="N \times" /> the
                  compute of one fit, for an estimate no steadier than a cheap{" "}
                  <MathTex math="K" /> would give. It survives only where the
                  arithmetic changes — tiny datasets where <MathTex math="N" />{" "}
                  is small, and models such as linear or ridge regression where
                  every leave-one-out residual can be recovered from a single
                  fit.
                </p>

                <div className="p-4 bg-[#1A1816] text-[#FAF9F5] font-mono text-[12px] space-y-1.5">
                  <div className="text-[11px] uppercase tracking-widest text-[#DE5D35] mb-2">
                    LOOCV · Cost Ledger
                  </div>
                  <div className="flex justify-between border-b border-[#FAF9F5]/15 pb-1.5">
                    <span className="text-[#FAF9F5]/60">ROUNDS TO FIT</span>
                    <span className="font-bold">N</span>
                  </div>
                  <div className="flex justify-between border-b border-[#FAF9F5]/15 pb-1.5">
                    <span className="text-[#FAF9F5]/60">
                      TRAIN SET PER ROUND
                    </span>
                    <span className="font-bold">N − 1 points</span>
                  </div>
                  <div className="flex justify-between border-b border-[#FAF9F5]/15 pb-1.5">
                    <span className="text-[#FAF9F5]/60">
                      VALIDATION PER ROUND
                    </span>
                    <span className="font-bold">1 point</span>
                  </div>
                  <div className="flex justify-between border-b border-[#FAF9F5]/15 pb-1.5">
                    <span className="text-[#FAF9F5]/60">BIAS OF ESTIMATE</span>
                    <span className="font-bold text-[#DE5D35]">NEAR ZERO</span>
                  </div>
                  <div className="flex justify-between border-b border-[#FAF9F5]/15 pb-1.5">
                    <span className="text-[#FAF9F5]/60">
                      VARIANCE OF ESTIMATE
                    </span>
                    <span className="font-bold text-[#DE5D35]">HIGH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FAF9F5]/60">TOTAL COMPUTE</span>
                    <span className="font-bold">N × one fit</span>
                  </div>
                </div>
              </div>

              {/* Left out: one point per round, N rounds */}
              <div className="lg:col-span-5 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-4 text-[11px] font-mono text-[#75716B]">
                  <span>N = 24 POINTS · ONE HELD OUT PER ROUND</span>
                  <span className="font-semibold text-[#DE5D35]">N rounds</span>
                </div>

                <div className="space-y-3">
                  {loocvHoldouts.map((holdout, rowIdx) => (
                    <div key={holdout}>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#75716B] mb-1">
                        <span>ROUND {rowIdx + 1}</span>
                        <span className="text-[#DE5D35]">
                          HOLDOUT = POINT {holdout + 1}
                        </span>
                      </div>
                      <div className="flex gap-[2px]">
                        {Array.from({ length: loocvN }, (_, pointIdx) => (
                          <div
                            key={pointIdx}
                            className={`flex-1 h-4 rounded-[1px] ${
                              pointIdx === holdout
                                ? "bg-[#DE5D35]"
                                : "bg-[#EAE7DF] border border-[#1A1816]/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[11px] font-mono text-[#75716B] leading-[1.6]">
                  …and so on for all N rounds. Every trained model sees N − 1
                  points; every score rests on exactly one.
                </p>
              </div>
            </div>

            {/* K comparison strip */}
            <div className="mt-8">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#75716B] mb-3">
                K at a glance · rounds, training share, bias and variance
                direction
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kStrip.map((row) => (
                  <div
                    key={row.k}
                    className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px] space-y-1.5"
                  >
                    <div className="text-[16px] font-black text-[#1A1816] mb-2">
                      {row.k}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#75716B]">ROUNDS</span>
                      <span className="font-bold text-[#1A1816]">
                        {row.rounds}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#75716B]">TRAIN SHARE</span>
                      <span className="font-bold text-[#1A1816]">
                        {row.train}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#75716B]">BIAS</span>
                      <span className="font-bold text-[#1A1816]">
                        {row.bias}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#75716B]">VARIANCE</span>
                      <span className="font-bold text-[#DE5D35]">
                        {row.variance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 05: Choosing K */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <LoopedStyles
              css={choosingKCss}
              reduceMotionTargets={[".cv2-marker", ".cv2-bias", ".cv2-var"]}
            />
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / The Practical Rule
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Choosing K
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  <MathTex math="K" /> is a dial with a failure mode at each
                  end. Turn it down and every training set is small: the model
                  you score is systematically worse than the one you will
                  actually ship, so the estimate reads <em>pessimistic</em> and
                  lurches between folds. Turn it up and each training set
                  approaches the full dataset: the estimate turns{" "}
                  <em>optimistic</em> and stable, but you paid for{" "}
                  <MathTex math="K" /> fits to measure a model that is already
                  almost the shipped one.
                </p>
                <p>
                  Plot measured error against <MathTex math="K" /> and you get a
                  rough <strong>U</strong>: bias falls monotonically as training
                  sets grow, variance climbs as the rounds become near-copies of
                  one another, and the sum dips in between. The useful choice is
                  the flat bottom of that U, not either wall.
                </p>
                <p>
                  Between roughly 5 and 10 the bottom is flat enough that moving
                  stops paying. Five folds train on 80% of the data and cost
                  five fits; ten folds train on 90% and cost ten. Past ten the
                  estimate barely moves and you are mostly buying arithmetic —
                  which is why <MathTex math="K = 5" /> and{" "}
                  <MathTex math="K = 10" /> are the defaults in essentially
                  every library, tutorial and paper.
                </p>
              </div>

              {/* Looped: marker walks the U, bands trade emphasis */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>ESTIMATE ERROR vs K</span>
                  <span className="font-semibold text-[#DE5D35]">
                    9s loop · bias fades as variance grows
                  </span>
                </div>
                <Looped
                  label="Looped animation: a marker travels left to right along a U-shaped curve of estimate error against K, while a dark bias band shrinks toward the baseline and an orange variance band grows to replace it"
                  className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]"
                >
                  <svg
                    viewBox="0 0 520 300"
                    className="w-full select-none"
                    aria-hidden="true"
                  >
                    {/* Sweet-spot window over K = 5..10 */}
                    <rect
                      x="180"
                      y="45"
                      width="130"
                      height="215"
                      fill="#DE5D35"
                      opacity="0.06"
                    />
                    <text
                      x="245"
                      y="58"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="10"
                      fill="#DE5D35"
                    >
                      5 ≤ K ≤ 10
                    </text>

                    {/* Axes */}
                    <line
                      x1="60"
                      y1="40"
                      x2="60"
                      y2="260"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />
                    <line
                      x1="60"
                      y1="260"
                      x2="500"
                      y2="260"
                      stroke="#1A1816"
                      strokeWidth="1.2"
                    />

                    {/* Component bands: bias falls with K, variance rises */}
                    <path
                      className="cv2-bias"
                      d="M 60 150 L 170 195 L 280 225 L 380 240 L 480 248 L 480 260 L 60 260 Z"
                      fill="#1A1816"
                      opacity="0.5"
                    />
                    <path
                      className="cv2-var"
                      d="M 60 250 L 180 242 L 300 220 L 400 185 L 480 140 L 480 260 L 60 260 Z"
                      fill="#DE5D35"
                      opacity="0.5"
                    />

                    {/* Total estimate error curve */}
                    <path
                      d="M 60 85 C 150 190, 210 218, 280 214 C 350 210, 410 155, 480 88"
                      fill="none"
                      stroke="#1A1816"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />

                    {/* Walking marker */}
                    <circle
                      className="cv2-marker"
                      cx="60"
                      cy="85"
                      r="6.5"
                      fill="#DE5D35"
                      stroke="#FAF9F5"
                      strokeWidth="2"
                    />

                    {/* Band labels */}
                    <text
                      x="74"
                      y="140"
                      fontFamily="monospace"
                      fontSize="11"
                      fill="#1A1816"
                    >
                      BIAS ↓
                    </text>
                    <text
                      x="398"
                      y="132"
                      textAnchor="end"
                      fontFamily="monospace"
                      fontSize="11"
                      fill="#DE5D35"
                    >
                      VARIANCE ↑
                    </text>

                    {/* Axis labels */}
                    <text
                      transform="rotate(-90 26 170)"
                      x="26"
                      y="170"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="10"
                      fill="#75716B"
                    >
                      ESTIMATE ERROR
                    </text>
                    <text
                      x="60"
                      y="278"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="10"
                      fill="#75716B"
                    >
                      K=2
                    </text>
                    <text
                      x="180"
                      y="278"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="10"
                      fill="#75716B"
                    >
                      K=5
                    </text>
                    <text
                      x="310"
                      y="278"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="10"
                      fill="#75716B"
                    >
                      K=10
                    </text>
                    <text
                      x="470"
                      y="278"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="10"
                      fill="#75716B"
                    >
                      K=N
                    </text>
                  </svg>
                </Looped>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#75716B] mb-3">
                Three splits that break the naive shuffle
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    STRATIFIED K-FOLD
                  </span>
                  <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                    Random folds can starve a fold of the minority class: with a
                    2% positive rate, some folds land near zero positives and
                    report a meaningless score. Stratified K-fold samples each
                    fold so its class ratio mirrors the dataset. Reach for it
                    whenever the target is imbalanced.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    GROUPED K-FOLD
                  </span>
                  <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                    Rows are not always independent. Ten scans from one patient
                    scattered by a random split means the model trains on nine
                    and is validated on the tenth — a near-copy it has already
                    memorized. Grouped K-fold keeps every group wholly on one
                    side, so the score reflects unseen patients, not unseen
                    rows.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    TIME-SERIES SPLITS
                  </span>
                  <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                    Ordered data must never be shuffled: validating on Tuesday
                    with a model trained through Wednesday leaks the future
                    backwards into the past. Rolling and expanding-window splits
                    always train on what came before and validate on what comes
                    next, fold by fold.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/resources/roc-auc"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
            >
              <span>← Topic 04: ROC &amp; AUC</span>
            </Link>
            <Link
              href="/resources/decision-trees"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
            >
              <span>Topic 06: Decision Trees &amp; Random Forests →</span>
            </Link>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
