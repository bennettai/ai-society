"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles, PALETTE } from "@/components/looped";
import MathTex from "@/components/MathTex";

type Outcome = "tp" | "fp" | "fn" | "tn";

const OUTCOME_META: Record<
  Outcome,
  {
    code: string;
    name: string;
    tagline: string;
    definition: string;
    example: string;
    consequence: string;
    affects: string;
  }
> = {
  tp: {
    code: "TP",
    name: "True Positive",
    tagline: "Predicted Positive · Actually Positive",
    definition:
      "The model raised the alarm, and the alarm was real. The prediction and the ground truth agree on the positive class.",
    example: "A spam email is correctly flagged and moved to the junk folder.",
    consequence:
      "Every correct detection. The numerator of both Precision and Recall — the only cell every metric wants to grow.",
    affects: "Feeds Precision ↑ · Recall ↑ · Accuracy ↑",
  },
  fp: {
    code: "FP",
    name: "False Positive",
    tagline: "Predicted Positive · Actually Negative",
    definition:
      "A false alarm — the model flagged something as positive when it was actually negative. Statistically, the Type I error.",
    example:
      "A legitimate email is wrongly flagged as spam and buried in junk.",
    consequence:
      "Sits in the denominator of Precision, poisoning it. Recall is blind to this cell — a model can catch every positive and still drown in false alarms.",
    affects: "Hurts Precision ↓ · Specificity ↓",
  },
  fn: {
    code: "FN",
    name: "False Negative",
    tagline: "Predicted Negative · Actually Positive",
    definition:
      "A missed detection — the model stayed silent while the positive event occurred. Statistically, the Type II error.",
    example:
      "A spam email slips past the filter and lands in the primary inbox.",
    consequence:
      "Sits in the denominator of Recall, deflating it. Precision never sees this cell — a model can be extremely precise by predicting positive almost never.",
    affects: "Hurts Recall ↓ · Sensitivity ↓",
  },
  tn: {
    code: "TN",
    name: "True Negative",
    tagline: "Predicted Negative · Actually Negative",
    definition:
      "The model stayed silent, and silence was correct. The negative majority handled quietly and correctly.",
    example: "A legitimate email is correctly left in the primary inbox.",
    consequence:
      "Inflates Accuracy dramatically under class imbalance, which is exactly why accuracy alone is a trap. Feeds Specificity, but neither Precision nor Recall.",
    affects: "Feeds Accuracy ↑ · Specificity ↑",
  },
};

const MC_CLASSES = ["Cat", "Dog", "Bird"] as const;

// Rows = actual class, columns = predicted class
const MC_MATRIX = [
  [42, 5, 3],
  [7, 38, 5],
  [2, 4, 34],
];

type CellRole = "tp" | "fp" | "fn" | "tn";

function roleFor(i: number, j: number, k: number): CellRole {
  if (i === k && j === k) return "tp";
  if (j === k) return "fp";
  if (i === k) return "fn";
  return "tn";
}

// Section 07: threshold-sweep loop. Scores are laid out so that at τ = 0.5 the
// sweep reproduces the page's running example exactly (TP 15 · FP 8 · FN 5 · TN 72).
const PR_SWEEP_POS: number[] = [
  0.95, 0.91, 0.88, 0.84, 0.8, 0.77, 0.73, 0.69, 0.65, 0.61, 0.58, 0.56, 0.54,
  0.52, 0.51, 0.41, 0.33, 0.26, 0.19, 0.12,
];
const PR_SWEEP_NEG: number[] = [
  0.89,
  0.83,
  0.79,
  0.72,
  0.67,
  0.6,
  0.57,
  0.53,
  ...Array.from({ length: 72 }, (_, i) => 0.48 - (i * 0.46) / 71),
];
const PR_SCORE_X0 = 50;
const PR_SCORE_W = 300;
const PR_SCORE_YP = 152;
const PR_SCORE_YN = 202;
// (recall, precision) waypoints plotted at recall → x, precision → y.
const PR_CURVE = "M450 60 L525 72 L600 103.2 L675 144 L720 187.2 L750 252";
const PR_AREA = `${PR_CURVE} L450 300 Z`;

const PR_BRIDGE_CSS = `
    @keyframes prBridgeSweep {
      0%   { transform: translateX(0); }
      100% { transform: translateX(300px); }
    }
    @keyframes prBridgeTrack {
      0%   { transform: translate(750px, 252px); }
      20%  { transform: translate(720px, 187.2px); }
      40%  { transform: translate(675px, 144px); }
      60%  { transform: translate(600px, 103.2px); }
      80%  { transform: translate(525px, 72px); }
      100% { transform: translate(450px, 60px); }
    }
    @keyframes prBridgePulse {
      0%, 100% { opacity: 0.35; }
      50%      { opacity: 1; }
    }
    .pr-bridge-sweep { animation: prBridgeSweep 8s linear infinite; }
    .pr-bridge-track { animation: prBridgeTrack 8s linear infinite; }
    .pr-bridge-pulse { animation: prBridgePulse 8s ease-in-out infinite; }
  `;

// Section 07: the same cells, re-cut — which metric touches which counts.
const METRIC_LEDGER: {
  metric: string;
  cells: string;
  blind: string;
  answers: string;
}[] = [
  {
    metric: "Accuracy",
    cells: "(TP + TN) / N",
    blind: "the FP / FN split",
    answers: "How often am I right overall?",
  },
  {
    metric: "Precision",
    cells: "TP / (TP + FP)",
    blind: "FN · TN",
    answers: "How much of what I flagged is real?",
  },
  {
    metric: "Recall · TPR",
    cells: "TP / (TP + FN)",
    blind: "FP · TN",
    answers: "How many real positives did I catch?",
  },
  {
    metric: "Specificity",
    cells: "TN / (TN + FP)",
    blind: "FN · TP",
    answers: "How well do I leave negatives alone?",
  },
  {
    metric: "FPR",
    cells: "FP / (FP + TN)",
    blind: "FN · TP",
    answers: "How often do negatives get flagged?",
  },
  {
    metric: "F1",
    cells: "2TP / (2TP + FP + FN)",
    blind: "TN",
    answers: "A single harmonic compromise.",
  },
  {
    metric: "Fβ",
    cells: "weighted P & R",
    blind: "TN",
    answers: "A cost-weighted compromise.",
  },
  {
    metric: "ROC curve",
    cells: "TPR vs FPR",
    blind: "the operating threshold",
    answers: "Every threshold, at once.",
  },
  {
    metric: "AUC",
    cells: "∫ TPR d(FPR)",
    blind: "threshold · calibration",
    answers: "How well does it rank?",
  },
  {
    metric: "PR curve",
    cells: "Precision vs Recall",
    blind: "TN · prevalence",
    answers: "Ranking quality when positives are rare.",
  },
];

export default function PrecisionRecallArticlePage() {
  // Section 02: selected outcome term (highlights in both matrices)
  const [selected, setSelected] = useState<Outcome>("tp");
  // Section 03: selected class in the 3x3 matrix
  const [mClass, setMClass] = useState(0);
  // Section 05: simulator controls
  const [threshold, setThreshold] = useState<number>(0.45);
  const [imbalanceRate, setImbalanceRate] = useState<number>(0.1);
  // Section 06: F-beta weighting
  const [beta, setBeta] = useState<number>(1.0);

  // Section 02: binary worked example (spam filter, N = 100, 20 spam)
  const binary = { tp: 15, fn: 5, fp: 8, tn: 72 };

  // Section 05: threshold simulation (positive scores ~ Beta(4,2), negative ~ Beta(1.5,4))
  const sim = useMemo(() => {
    const totalSamples = 1000;
    const nPos = Math.max(1, Math.round(totalSamples * imbalanceRate));
    const nNeg = totalSamples - nPos;

    const tp = Math.round(nPos * (1 - threshold) ** 0.7);
    const fn = nPos - tp;
    const fp = Math.round(nNeg * (1 - threshold) ** 2.5);
    const tn = nNeg - fp;

    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;
    const accuracy = (tp + tn) / totalSamples;

    // Full precision-recall curve across thresholds for this imbalance
    const curve: { r: number; p: number }[] = [];
    for (let t = 0.98; t >= 0.02; t -= 0.02) {
      const cTp = nPos * (1 - t) ** 0.7;
      const cFp = nNeg * (1 - t) ** 2.5;
      curve.push({
        r: cTp / nPos,
        p: cTp + cFp > 0 ? cTp / (cTp + cFp) : 1,
      });
    }

    return {
      totalSamples,
      nPos,
      nNeg,
      tp,
      fp,
      fn,
      tn,
      precision,
      recall,
      f1,
      accuracy,
      curve,
    };
  }, [threshold, imbalanceRate]);

  // Section 06: F-beta for the current operating point
  const fBeta = useMemo(() => {
    const b2 = beta * beta;
    const denom = b2 * sim.precision + sim.recall;
    return denom > 0 ? ((1 + b2) * sim.precision * sim.recall) / denom : 0;
  }, [beta, sim.precision, sim.recall]);

  const meta = OUTCOME_META[selected];

  const cellStyle = (cell: Outcome, isSelected: boolean) => {
    if (!isSelected)
      return "bg-[#FAF9F5] border-[#1A1816]/15 text-[#1A1816]/45 hover:border-[#1A1816]/40";
    switch (cell) {
      case "tp":
        return "bg-[#DE5D35] border-[#DE5D35] text-[#FAF9F5]";
      case "tn":
        return "bg-[#1A1816] border-[#1A1816] text-[#FAF9F5]";
      default:
        return "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]";
    }
  };

  const mcCellStyle = (role: CellRole, isSelected: boolean) => {
    if (!isSelected)
      return "bg-[#FAF9F5] border-[#1A1816]/10 text-[#1A1816]/30 hover:border-[#1A1816]/30";
    switch (role) {
      case "tp":
        return "bg-[#DE5D35] border-[#DE5D35] text-[#FAF9F5]";
      case "tn":
        return "bg-[#1A1816] border-[#1A1816] text-[#FAF9F5]";
      default:
        return "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]";
    }
  };

  // PR curve path (SVG coords: x = recall, y = precision)
  const prPath = sim.curve
    .map(
      (pt, i) =>
        `${i === 0 ? "M" : "L"} ${(30 + pt.r * 240).toFixed(1)} ${(
          270 - pt.p * 240
        ).toFixed(1)}`,
    )
    .join(" ");
  const prArea = `${prPath} L ${(30 + sim.curve[sim.curve.length - 1]?.r * 240 || 30).toFixed(1)} 270 L 30 270 Z`;

  return (
    <FoldLayout>
      <main className="grow pt-28 sm:pt-36 pb-32 bg-[#EFECE6] text-[#1A1816] min-h-screen">
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
                Evaluation · Confusion Matrix, Precision-Recall &amp; F1
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 03
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              Confusion Matrix, Precision-Recall &amp; F1
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              Every classification error has a name and a cell. Dissect the
              confusion matrix in its 2×2 and 3×3 forms, learn what TP, FP, FN
              and TN really cost, and see how Precision, Recall and F1 are
              balanced under severe class imbalance.
            </p>
          </header>

          {/* Section 01: Anatomy of the 2x2 Confusion Matrix */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / The Ledger of Predictions
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                What Is a Confusion Matrix?
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  A confusion matrix is a simple table that cross-tabulates{" "}
                  <strong>what the model predicted</strong> against{" "}
                  <strong>what was actually true</strong>. It is called
                  &ldquo;confusion&rdquo; because it shows exactly where the
                  model gets confused — and where it does not.
                </p>
                <p>
                  For a binary problem, the matrix is 2×2. Read it by position:
                  <strong> rows are the actual class</strong>,{" "}
                  <strong>columns are the predicted class</strong>. The diagonal
                  (top-left, bottom-right) always holds correct predictions;
                  everything off the diagonal is a specific kind of mistake.
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-2">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B]">
                    Running Example · Spam Filter (N = 100)
                  </span>
                  <p className="text-[13px]">
                    Test set: <strong>20 spam</strong> emails (the positive
                    class) and <strong>80 legitimate</strong> emails. The
                    classifier flagged <strong>23 emails</strong> as spam. The
                    matrix on the right records every one of the 100 verdicts.
                  </p>
                </div>
                <p>
                  Two cells will dominate everything that follows: the diagonal{" "}
                  <MathTex math="\text{TP} + \text{TN} = 87" /> correct
                  predictions, and the two error cells{" "}
                  <MathTex math="\text{FP} + \text{FN} = 13" /> mistakes — each
                  with a very different real-world cost.
                </p>
              </div>

              {/* 2x2 matrix */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-4 text-[11px] font-mono text-[#75716B]">
                  <span>BINARY CONFUSION MATRIX · SPAM FILTER</span>
                  <span className="font-bold text-[#DE5D35]">N = 100</span>
                </div>
                <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 max-w-[440px] mx-auto">
                  <div />
                  <div className="text-center text-[10px] font-mono uppercase tracking-wider text-[#75716B] pb-1">
                    Predicted · Spam
                  </div>
                  <div className="text-center text-[10px] font-mono uppercase tracking-wider text-[#75716B] pb-1">
                    Predicted · Not Spam
                  </div>

                  <div className="flex items-center justify-end pr-2 text-[10px] font-mono uppercase tracking-wider text-[#75716B] [writing-mode:vertical-rl] rotate-180">
                    Actual · Spam
                  </div>
                  <div className="p-4 border-2 border-[#DE5D35] bg-[#DE5D35]/5 text-center">
                    <span className="block text-[10px] font-mono uppercase font-bold text-[#DE5D35]">
                      TP · 15
                    </span>
                    <span className="block text-[30px] font-black font-mono text-[#DE5D35] leading-tight">
                      15
                    </span>
                    <span className="block text-[10px] text-[#75716B]">
                      Spam caught
                    </span>
                  </div>
                  <div className="p-4 border border-[#1A1816]/20 bg-white text-center">
                    <span className="block text-[10px] font-mono uppercase font-bold text-[#EF4444]">
                      FN · 5
                    </span>
                    <span className="block text-[30px] font-black font-mono text-[#EF4444] leading-tight">
                      5
                    </span>
                    <span className="block text-[10px] text-[#75716B]">
                      Spam missed
                    </span>
                  </div>

                  <div className="flex items-center justify-end pr-2 text-[10px] font-mono uppercase tracking-wider text-[#75716B] [writing-mode:vertical-rl] rotate-180">
                    Actual · Not Spam
                  </div>
                  <div className="p-4 border border-[#1A1816]/20 bg-white text-center">
                    <span className="block text-[10px] font-mono uppercase font-bold text-[#EF4444]">
                      FP · 8
                    </span>
                    <span className="block text-[30px] font-black font-mono text-[#EF4444] leading-tight">
                      8
                    </span>
                    <span className="block text-[10px] text-[#75716B]">
                      Ham flagged
                    </span>
                  </div>
                  <div className="p-4 border-2 border-[#1A1816] bg-[#1A1816]/5 text-center">
                    <span className="block text-[10px] font-mono uppercase font-bold text-[#1A1816]">
                      TN · 72
                    </span>
                    <span className="block text-[30px] font-black font-mono text-[#1A1816] leading-tight">
                      72
                    </span>
                    <span className="block text-[10px] text-[#75716B]">
                      Ham ignored
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-4 uppercase tracking-wider">
                  Rows = Actual Class · Columns = Predicted Class
                </p>
              </div>
            </div>
          </section>

          {/* Section 02: The Four Outcomes — highlighted in 2x2 AND 3x3 */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                02 / The Four Verdicts
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                TP, FP, FN &amp; TN — Highlighted in Both Matrices
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Select an outcome below. The corresponding square lights up in the{" "}
              <strong>2×2 binary matrix</strong> and in the{" "}
              <strong>3×3 multiclass matrix</strong> simultaneously — the same
              four ideas extend from two classes to many.
            </p>

            {/* Term selector chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {(Object.keys(OUTCOME_META) as Outcome[]).map((key) => {
                const isActive = selected === key;
                const isError = key === "fp" || key === "fn";
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelected(key)}
                    className={`px-4 py-2 rounded-[2px] font-mono text-[12px] font-bold tracking-wider uppercase border transition-colors duration-200 active:scale-[0.98] ${
                      isActive
                        ? key === "tp"
                          ? "bg-[#DE5D35] border-[#DE5D35] text-[#FAF9F5]"
                          : isError
                            ? "bg-[#EF4444] border-[#EF4444] text-white"
                            : "bg-[#1A1816] border-[#1A1816] text-[#FAF9F5]"
                        : "bg-[#FAF9F5] border-[#1A1816]/25 text-[#4A4742] hover:border-[#1A1816]"
                    }`}
                  >
                    {OUTCOME_META[key].code}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Explanation panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <h3 className="text-[20px] font-bold text-[#1A1816]">
                      {meta.name}
                    </h3>
                    <span
                      className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                        selected === "tp"
                          ? "text-[#DE5D35]"
                          : selected === "tn"
                            ? "text-[#1A1816]"
                            : "text-[#EF4444]"
                      }`}
                    >
                      {meta.tagline}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#4A4742] leading-[1.7] mb-3">
                    {meta.definition}
                  </p>
                  <div className="p-3 border border-[#1A1816]/10 bg-[#EFECE6] text-[13px] text-[#4A4742] leading-[1.6] mb-3">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-1">
                      Spam Example
                    </span>
                    {meta.example}
                  </div>
                  <p className="text-[13px] text-[#4A4742] leading-[1.6] mb-3">
                    {meta.consequence}
                  </p>
                  <div className="pt-3 border-t border-[#1A1816]/10 font-mono text-[11px] uppercase tracking-wider text-[#75716B]">
                    {meta.affects}
                  </div>
                </div>

                {/* 2x2 highlight matrix */}
                <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-3">
                    2×2 · Binary — {meta.code} Highlighted
                  </div>
                  <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5">
                    <div />
                    <div className="text-center text-[9px] font-mono uppercase tracking-wider text-[#75716B]">
                      Pred +
                    </div>
                    <div className="text-center text-[9px] font-mono uppercase tracking-wider text-[#75716B]">
                      Pred −
                    </div>
                    <div className="flex items-center justify-end pr-1.5 text-[9px] font-mono uppercase tracking-wider text-[#75716B] [writing-mode:vertical-rl] rotate-180">
                      Act +
                    </div>
                    {(["tp", "fn"] as Outcome[]).map((cell) => (
                      <button
                        key={cell}
                        type="button"
                        aria-label={OUTCOME_META[cell].name}
                        onClick={() => setSelected(cell)}
                        className={`p-3 border text-center transition-colors duration-200 cursor-pointer active:scale-[0.98] ${cellStyle(cell, selected === cell)}`}
                      >
                        <span className="block text-[9px] font-mono uppercase font-bold">
                          {OUTCOME_META[cell].code}
                        </span>
                        <span className="block text-[20px] font-black font-mono leading-tight">
                          {binary[cell]}
                        </span>
                      </button>
                    ))}
                    <div className="flex items-center justify-end pr-1.5 text-[9px] font-mono uppercase tracking-wider text-[#75716B] [writing-mode:vertical-rl] rotate-180">
                      Act −
                    </div>
                    {(["fp", "tn"] as Outcome[]).map((cell) => (
                      <button
                        key={cell}
                        type="button"
                        aria-label={OUTCOME_META[cell].name}
                        onClick={() => setSelected(cell)}
                        className={`p-3 border text-center transition-colors duration-200 cursor-pointer active:scale-[0.98] ${cellStyle(cell, selected === cell)}`}
                      >
                        <span className="block text-[9px] font-mono uppercase font-bold">
                          {OUTCOME_META[cell].code}
                        </span>
                        <span className="block text-[20px] font-black font-mono leading-tight">
                          {binary[cell]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3x3 highlight matrix */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    3×3 · Multiclass — {meta.code} Highlighted
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B] mr-1">
                      View as:
                    </span>
                    {MC_CLASSES.map((c, k) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={mClass === k}
                        onClick={() => setMClass(k)}
                        className={`px-2.5 py-1 rounded-[2px] font-mono text-[10px] font-bold uppercase tracking-wider border transition-colors duration-200 active:scale-[0.98] ${
                          mClass === k
                            ? "bg-[#1A1816] border-[#1A1816] text-[#FAF9F5]"
                            : "bg-white border-[#1A1816]/25 text-[#4A4742] hover:border-[#1A1816]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1.5">
                  <div />
                  {MC_CLASSES.map((c) => (
                    <div
                      key={`h-${c}`}
                      className={`text-center text-[9px] font-mono uppercase tracking-wider pb-1 transition-colors duration-200 ${
                        mClass === MC_CLASSES.indexOf(c)
                          ? "text-[#1A1816] font-bold"
                          : "text-[#75716B]"
                      }`}
                    >
                      Pred {c}
                    </div>
                  ))}

                  {MC_CLASSES.map((actual, i) => (
                    <Fragment key={actual}>
                      <div
                        className={`flex items-center justify-end pr-1.5 text-[9px] font-mono uppercase tracking-wider [writing-mode:vertical-rl] rotate-180 transition-colors duration-200 ${
                          mClass === i
                            ? "text-[#1A1816] font-bold"
                            : "text-[#75716B]"
                        }`}
                      >
                        Act {actual}
                      </div>
                      {MC_CLASSES.map((_pred, j) => {
                        const role = roleFor(i, j, mClass);
                        const isSel = role === selected;
                        return (
                          <div
                            key={`cell-${actual}-${MC_CLASSES[j]}`}
                            className={`p-2.5 border text-center transition-colors duration-200 ${mcCellStyle(role, isSel)}`}
                          >
                            <span className="block text-[9px] font-mono uppercase font-bold opacity-80">
                              {role.toUpperCase()}
                            </span>
                            <span className="block text-[18px] font-black font-mono leading-tight">
                              {MC_MATRIX[i][j]}
                            </span>
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-[#EFECE6] border border-[#1A1816]/10 text-[12px] text-[#4A4742] leading-[1.6]">
                  <strong className="text-[#1A1816]">
                    The one-vs-rest trick:
                  </strong>{" "}
                  to evaluate the <strong>{MC_CLASSES[mClass]}</strong> class,
                  mentally collapse the 3×3 into a 2×2 — the diagonal cell{" "}
                  <MathTex
                    math={`M[${mClass}][${mClass}] = ${MC_MATRIX[mClass][mClass]}`}
                  />{" "}
                  becomes TP, its <strong>row</strong> becomes FN, its{" "}
                  <strong>column</strong> becomes FP, and everything else is TN.
                </div>
              </div>
            </div>
          </section>

          {/* Section 03: The 3x3 Multiclass Matrix — per-class metrics */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Beyond Binary
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Reading a 3×3 Matrix Per Class
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  With <MathTex math="K" /> classes the matrix becomes{" "}
                  <MathTex math="K \times K" />. There is no single global
                  TP/FP/FN anymore — instead we compute{" "}
                  <strong>one binary confusion matrix per class</strong> and
                  derive per-class metrics:
                </p>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-3">
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-1">
                      Precision of class {MC_CLASSES[mClass]}
                    </span>
                    <MathTex
                      math={`P_{${mClass}} = \\frac{M[${mClass}][${mClass}]}{\\sum_{i} M[i][${mClass}]} = \\frac{${MC_MATRIX[mClass][mClass]}}{${MC_MATRIX.map((r) => r[mClass]).join(" + ")}}`}
                      block
                    />
                  </div>
                  <div className="border-t border-[#1A1816]/10 pt-3">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-1">
                      Recall of class {MC_CLASSES[mClass]}
                    </span>
                    <MathTex
                      math={`R_{${mClass}} = \\frac{M[${mClass}][${mClass}]}{\\sum_{j} M[${mClass}][j]} = \\frac{${MC_MATRIX[mClass][mClass]}}{${MC_MATRIX[mClass].join(" + ")}}`}
                      block
                    />
                  </div>
                </div>

                <p>
                  <strong>Mnemonic:</strong> precision sums down the{" "}
                  <em>column</em> (everything predicted as this class), recall
                  sums across the <em>row</em> (everything that truly was this
                  class).
                </p>
              </div>

              {/* Averaging strategies */}
              <div className="lg:col-span-7 space-y-4">
                <p className="text-[14px] text-[#4A4742] leading-[1.7]">
                  Per-class numbers give <MathTex math="K" /> scores — but
                  leaderboards need one. Three averaging strategies collapse
                  them, each hiding different things:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                      MACRO
                    </span>
                    <MathTex math="\frac{1}{K}\sum_k P_k" block />
                    <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                      Unweighted mean over classes. Every class counts equally —
                      best when each class matters equally, regardless of how
                      rare it is.
                    </p>
                  </div>
                  <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                      MICRO
                    </span>
                    <MathTex
                      math="\frac{\sum_k TP_k}{\sum_k (TP_k + FP_k)}"
                      block
                    />
                    <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                      Pool all counts globally first. Dominated by frequent
                      classes — for single-label multiclass it equals accuracy.
                    </p>
                  </div>
                  <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                      WEIGHTED
                    </span>
                    <MathTex math="\sum_k \frac{n_k}{N}\, P_k" block />
                    <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                      Support-weighted mean. Frequent classes dominate — a
                      compromise that still reports rare-class failures.
                    </p>
                  </div>
                </div>

                {/* Worked example strip */}
                <div className="p-4 bg-[#1A1816] text-[#FAF9F5]">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-3">
                    Worked Example · Per-Class Recall
                  </span>
                  <div className="grid grid-cols-3 gap-3 font-mono text-[12px]">
                    {MC_CLASSES.map((c, k) => {
                      const tp = MC_MATRIX[k][k];
                      const rowSum = MC_MATRIX[k].reduce((a, b) => a + b, 0);
                      return (
                        <div key={c}>
                          <span className="block text-[10px] uppercase tracking-wider text-[#FAF9F5]/60">
                            {c}
                          </span>
                          <span className="text-[18px] font-bold text-[#DE5D35]">
                            {((tp / rowSum) * 100).toFixed(1)}%
                          </span>
                          <span className="block text-[10px] text-[#FAF9F5]/50">
                            {tp}/{rowSum} caught
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[12px] text-[#FAF9F5]/70 mt-3 leading-[1.6]">
                    Macro recall here ={" "}
                    {(
                      MC_CLASSES.reduce(
                        (acc, _, k) =>
                          acc +
                          MC_MATRIX[k][k] /
                            MC_MATRIX[k].reduce((a, b) => a + b, 0),
                        0,
                      ) / 3
                    )
                      .toFixed(3)
                      .toString()}
                    . If one rare class scored near zero, macro averaging would
                    expose it — micro averaging would bury it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 04: From Counts to Metrics */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / Derived Metrics
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                From Four Counts to Every Metric
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Every classification metric is just a different ratio over the
              same four cells. The question is never &ldquo;which formula&rdquo;
              — it is <strong>which error cell hurts your application</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-[#FAF9F5] border border-[#DE5D35]">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#DE5D35]">
                    Precision
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    Positive Predictive Value
                  </span>
                </div>
                <MathTex math="\text{Precision} = \frac{TP}{TP + FP}" block />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  <em>
                    &ldquo;Of everything I flagged, how much was real?&rdquo;
                  </em>{" "}
                  Punishes <strong>FP</strong>. Optimize when false alarms are
                  expensive — spam filters, recommendation reranking.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#DE5D35]">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#DE5D35]">
                    Recall
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    Sensitivity · TPR
                  </span>
                </div>
                <MathTex math="\text{Recall} = \frac{TP}{TP + FN}" block />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  <em>
                    &ldquo;Of all real positives, how many did I catch?&rdquo;
                  </em>{" "}
                  Punishes <strong>FN</strong>. Optimize when misses are
                  expensive — cancer screening, fraud detection.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#1A1816]">
                    Accuracy
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    Overall Correctness
                  </span>
                </div>
                <MathTex
                  math="\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}"
                  block
                />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  <em>&ldquo;How often am I right overall?&rdquo;</em> Collapses
                  under imbalance — 95% negatives make the trivial &ldquo;always
                  negative&rdquo; model 95% accurate.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-[#1A1816]">
                    Specificity
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                    True Negative Rate
                  </span>
                </div>
                <MathTex math="\text{Specificity} = \frac{TN}{TN + FP}" block />
                <p className="text-[12px] text-[#4A4742] leading-[1.6] mt-2">
                  <em>&ldquo;How well do I leave negatives alone?&rdquo;</em>{" "}
                  The mirror of recall — the two together form the ROC curve of
                  Topic 04.
                </p>
              </div>
            </div>

            {/* Worked numbers strip */}
            <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px]">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#75716B] mb-3">
                Worked · Spam Filter (TP 15 · FP 8 · FN 5 · TN 72)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#75716B]">
                    ACCURACY
                  </span>
                  <span className="text-[18px] font-bold text-[#1A1816]">
                    87.0%
                  </span>
                  <span className="block text-[10px] text-[#75716B]">
                    (15+72)/100
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#75716B]">
                    PRECISION
                  </span>
                  <span className="text-[18px] font-bold text-[#DE5D35]">
                    65.2%
                  </span>
                  <span className="block text-[10px] text-[#75716B]">
                    15/(15+8)
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#75716B]">
                    RECALL
                  </span>
                  <span className="text-[18px] font-bold text-[#DE5D35]">
                    75.0%
                  </span>
                  <span className="block text-[10px] text-[#75716B]">
                    15/(15+5)
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#75716B]">
                    SPECIFICITY
                  </span>
                  <span className="text-[18px] font-bold text-[#1A1816]">
                    90.0%
                  </span>
                  <span className="block text-[10px] text-[#75716B]">
                    72/(72+8)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 05: The Trade-off Simulator */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / The Accuracy Paradox
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Precision–Recall Trade-off Simulator
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Controls & text */}
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  In fraud detection, rare pathology, or cyber threats, positive
                  events occur in fewer than 5% of cases. A naive model
                  predicting &ldquo;all negative&rdquo; achieves 95% accuracy
                  while finding zero actual threats.
                </p>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>POSITIVE EVENT BASE RATE</span>
                      <span className="font-bold text-[#DE5D35]">
                        {(imbalanceRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.50"
                      step="0.01"
                      value={imbalanceRate}
                      onChange={(e) =>
                        setImbalanceRate(parseFloat(e.target.value))
                      }
                      className="w-full accent-[#DE5D35] cursor-pointer"
                      aria-label="Positive event base rate"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>DECISION THRESHOLD (τ)</span>
                      <span className="font-bold text-[#1A1816]">
                        {threshold.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.02"
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="w-full accent-[#1A1816] cursor-pointer"
                      aria-label="Decision threshold"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">OVERALL ACCURACY:</span>
                    <span className="font-bold text-[#1A1816]">
                      {(sim.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">PRECISION:</span>
                    <span className="font-bold text-[#DE5D35]">
                      {(sim.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">RECALL:</span>
                    <span className="font-bold text-[#DE5D35]">
                      {(sim.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75716B]">HARMONIC F1 SCORE:</span>
                    <span className="font-bold text-[#DE5D35]">
                      {sim.f1.toFixed(3)}
                    </span>
                  </div>
                </div>

                <p>
                  Drag <MathTex math="\tau" /> down: recall climbs, precision
                  collapses into false alarms. Drag it up: precision sharpens,
                  recall starves. Accuracy barely notices — watch how static it
                  stays while the errors swap places. That numbness is the
                  paradox.
                </p>
              </div>

              {/* Live matrix + PR curve */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                  <div className="flex items-center justify-between mb-4 text-[11px] font-mono text-[#75716B]">
                    <span>
                      LIVE 2×2 CONFUSION MATRIX (N = {sim.totalSamples})
                    </span>
                    <span className="font-bold text-[#DE5D35]">
                      τ = {threshold.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-4 border border-[#DE5D35] bg-[#DE5D35]/5">
                      <span className="block text-[11px] font-mono uppercase text-[#DE5D35] font-bold">
                        TRUE POSITIVE (TP)
                      </span>
                      <span className="text-[28px] font-black font-mono text-[#DE5D35]">
                        {sim.tp}
                      </span>
                      <span className="block text-[11px] text-[#75716B] mt-1">
                        Correctly caught rare events
                      </span>
                    </div>
                    <div className="p-4 border border-[#1A1816]/20 bg-white">
                      <span className="block text-[11px] font-mono uppercase text-[#EF4444] font-bold">
                        FALSE POSITIVE (FP)
                      </span>
                      <span className="text-[28px] font-black font-mono text-[#EF4444]">
                        {sim.fp}
                      </span>
                      <span className="block text-[11px] text-[#75716B] mt-1">
                        False alarms / spurious flags
                      </span>
                    </div>
                    <div className="p-4 border border-[#1A1816]/20 bg-white">
                      <span className="block text-[11px] font-mono uppercase text-[#EF4444] font-bold">
                        FALSE NEGATIVE (FN)
                      </span>
                      <span className="text-[28px] font-black font-mono text-[#EF4444]">
                        {sim.fn}
                      </span>
                      <span className="block text-[11px] text-[#75716B] mt-1">
                        Missed positive events (danger!)
                      </span>
                    </div>
                    <div className="p-4 border border-[#1A1816]/20 bg-white">
                      <span className="block text-[11px] font-mono uppercase text-[#1A1816] font-bold">
                        TRUE NEGATIVE (TN)
                      </span>
                      <span className="text-[28px] font-black font-mono text-[#1A1816]">
                        {sim.tn}
                      </span>
                      <span className="block text-[11px] text-[#75716B] mt-1">
                        Correct normal rejections
                      </span>
                    </div>
                  </div>
                </div>

                {/* PR Curve */}
                <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                  <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                    <span>PRECISION–RECALL CURVE</span>
                    <span className="font-semibold text-[#DE5D35]">
                      Operating point @ τ = {threshold.toFixed(2)}
                    </span>
                  </div>
                  <div className="max-w-[420px] mx-auto bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                    <svg
                      viewBox="0 0 300 300"
                      className="w-full overflow-visible select-none"
                      role="img"
                      aria-label="Precision-recall curve"
                    >
                      {/* Axes */}
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

                      {/* Area under curve */}
                      <path d={prArea} fill="rgba(222,93,53,0.10)" />
                      <path
                        d={prPath}
                        fill="none"
                        stroke="#DE5D35"
                        strokeWidth="2.5"
                      />

                      {/* Operating point */}
                      <circle
                        cx={30 + sim.recall * 240}
                        cy={270 - sim.precision * 240}
                        r="6"
                        fill="#DE5D35"
                        stroke="#FAF9F5"
                        strokeWidth="2"
                      />
                      <text
                        x={Math.min(245, Math.max(55, 30 + sim.recall * 240))}
                        y={Math.max(45, 270 - sim.precision * 240 - 12)}
                        fill="#1A1816"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        (R {(sim.recall * 100).toFixed(0)}%, P{" "}
                        {(sim.precision * 100).toFixed(0)}%)
                      </text>

                      {/* Axis labels */}
                      <text
                        x="150"
                        y="294"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill="#1A1816"
                      >
                        Recall →
                      </text>
                      <text
                        x="-150"
                        y="14"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill="#1A1816"
                        transform="rotate(-90)"
                      >
                        Precision →
                      </text>
                    </svg>
                  </div>
                  <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                    Lower τ slides the operating point right into the precision
                    cliff · Higher τ pushes it up-left
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 06: F1 & F-beta */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                06 / One Number to Rule Them
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                F1 &amp; the Generalized F-Beta
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-[14px] text-[#4A4742] leading-[1.7]">
              <div className="space-y-4">
                <p>
                  The arithmetic mean of <MathTex math="100\%" /> precision and{" "}
                  <MathTex math="0\%" /> recall is <MathTex math="50\%" /> —
                  concealing total failure. The harmonic mean heavily penalizes
                  asymmetry: whenever one side collapses, F1 collapses with it.
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    F1 Score Formulation
                  </span>
                  <MathTex
                    math="F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}} = \frac{2\text{TP}}{2\text{TP} + \text{FP} + \text{FN}}"
                    block
                  />
                </div>
                <p>
                  Because <MathTex math="F_1" /> can be rewritten purely in
                  confusion-matrix counts, it never touches TN — under extreme
                  imbalance it stays honest where accuracy cannot.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Real applications are rarely symmetric. When missed detections
                  matter <MathTex math="\beta" /> times more than false alarms,
                  the generalized <MathTex math="F_\beta" /> score shifts the
                  balance:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Generalized F-Beta Metric
                  </span>
                  <MathTex
                    math="F_\beta = (1 + \beta^2) \frac{\text{Precision} \cdot \text{Recall}}{(\beta^2 \cdot \text{Precision}) + \text{Recall}}"
                    block
                  />
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#75716B] mb-1">
                      <span>
                        BETA WEIGHT (β &gt; 1 FAVORS RECALL · β &lt; 1 FAVORS
                        PRECISION)
                      </span>
                      <span className="font-bold text-[#DE5D35]">
                        β = {beta.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.25"
                      max="2.5"
                      step="0.05"
                      value={beta}
                      onChange={(e) => setBeta(parseFloat(e.target.value))}
                      className="w-full accent-[#DE5D35] cursor-pointer"
                      aria-label="F-beta weight"
                    />
                  </div>
                  <div className="flex items-baseline justify-between font-mono text-[12px] border-t border-[#1A1816]/10 pt-3">
                    <span className="text-[#75716B]">
                      F<sub>β</sub> AT CURRENT OPERATING POINT (P{" "}
                      {(sim.precision * 100).toFixed(0)}% · R{" "}
                      {(sim.recall * 100).toFixed(0)}%):
                    </span>
                    <span className="text-[18px] font-bold text-[#DE5D35]">
                      {fBeta.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-[12px] leading-[1.6]">
                    {beta > 1.05
                      ? "Recall-weighted — the screening regime. Missing a positive is β² times worse than a false alarm, so the score tolerates extra FP."
                      : beta < 0.95
                        ? "Precision-weighted — the ranking regime. False alarms are costly; the score tolerates missed positives."
                        : "β = 1 is plain F1 — precision and recall weighted equally, the neutral harmonic compromise."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 07: The Bridge To ROC */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <LoopedStyles
              css={PR_BRIDGE_CSS}
              reduceMotionTargets={[
                ".pr-bridge-sweep",
                ".pr-bridge-track",
                ".pr-bridge-pulse",
              ]}
            />
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                07 / The Bridge To ROC
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Same Four Cells, A Different Curve
              </h2>
            </div>

            <div className="text-[14px] text-[#4A4742] leading-[1.7] space-y-4 max-w-3xl mb-8">
              <p>
                Nothing here is new data. The same four cells can be plotted in
                two coordinate systems, and each produces its own curve. Slide a
                single decision threshold across the score axis: every position
                yields one confusion matrix, and every confusion matrix yields
                one point. Connect the points and you have plotted{" "}
                <strong>recall against precision</strong> — the curve of this
                article — or, if you prefer, <strong>TPR against FPR</strong>,
                which is the ROC curve of Topic 04. The axes differ; the ledger
                underneath does not.
              </p>
              <p>
                The two axes are the same numbers wearing different labels.{" "}
                <MathTex math="\text{TPR} = \text{Recall} = \frac{TP}{TP + FN}" />{" "}
                and{" "}
                <MathTex math="\text{FPR} = 1 - \text{Specificity} = \frac{FP}{FP + TN}" />
                . Both curves sweep every threshold, so both are{" "}
                <strong>threshold-invariant</strong> in the sense of summarising
                the full range without committing to one operating point.
              </p>
              <p>
                They part ways on <strong>prevalence</strong>. TPR and FPR each
                normalise inside their own class — TPR divides by all the real
                positives, FPR by all the real negatives — so the ROC curve is
                unchanged if you keep the model fixed and make the positive
                class a hundred times rarer. Precision refuses that trick: it
                divides by <MathTex math="TP + FP" />, which contains the
                negative class through the false alarms. Change the class
                balance and the PR curve moves even though the model did not.
              </p>
            </div>

            <div className="p-4 bg-[#1A1816] text-[#FAF9F5] mb-8">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-3">
                Worked Contrast · The Spam Filter Under Two Balances
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] leading-[1.7]">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-[#FAF9F5]/60 mb-1">
                    As measured · 20 spam / 80 ham
                  </span>
                  <p className="font-mono text-[12px] text-[#FAF9F5]">
                    Recall = 15/20 = 0.750
                    <br />
                    FPR = 8/80 = 0.100
                    <br />
                    Precision = 15/23 = 0.652
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-[#FAF9F5]/60 mb-1">
                    Same 8 false alarms · 20 spam / 9,980 ham
                  </span>
                  <p className="font-mono text-[12px] text-[#FAF9F5]">
                    Recall = 15/20 = 0.750
                    <br />
                    FPR = 8/9,980 ≈ 0.0008
                    <br />
                    Precision = 15/23 = 0.652
                  </p>
                </div>
              </div>
              <p className="text-[12px] text-[#FAF9F5]/70 mt-3 leading-[1.6]">
                The false alarms did not change; only the pool of legitimate
                mail did. ROC&apos;s FPR collapses toward zero and the point
                climbs into the top-left corner, flattered by a denominator it
                never had to earn. Precision is unmoved at 65.2% — it has no TN
                term to hide behind. When positives are rare, the PR curve is
                the honest view.
              </p>
            </div>

            {/* Looped threshold sweep: 2×2 data re-cut into a PR curve */}
            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-[11px] font-mono text-[#75716B]">
                <span>THRESHOLD SWEEP · THE SAME VERDICTS, RE-PLOTTED</span>
                <span className="font-semibold text-[#DE5D35]">
                  8s loop · τ → PR operating point
                </span>
              </div>
              <Looped
                label="Looped animation: a decision threshold slides across the score axis while the resulting recall and precision point traces the precision-recall curve"
                className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px] overflow-x-auto"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 780 340"
                  className="w-full min-w-[620px] select-none"
                >
                  {/* ===== LEFT: score axis + sweep ===== */}
                  <text
                    x="50"
                    y="30"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                  >
                    TEST SET · 20 SPAM + 80 HAM
                  </text>
                  <line
                    x1={PR_SCORE_X0}
                    y1="240"
                    x2={PR_SCORE_X0 + PR_SCORE_W}
                    y2="240"
                    stroke={PALETTE.ink}
                    strokeWidth="1.2"
                  />
                  <text
                    x={PR_SCORE_X0}
                    y="262"
                    fontSize="9"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                  >
                    0.0
                  </text>
                  <text
                    x={PR_SCORE_X0 + PR_SCORE_W}
                    y="262"
                    fontSize="9"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                    textAnchor="end"
                  >
                    1.0
                  </text>
                  <text
                    x={PR_SCORE_X0 + PR_SCORE_W / 2}
                    y="284"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                    textAnchor="middle"
                  >
                    classifier score S(x) → · right of τ = flagged
                  </text>

                  <text
                    x="44"
                    y={PR_SCORE_YP - 18}
                    fontSize="9"
                    fontFamily="monospace"
                    fill={PALETTE.accent}
                    textAnchor="end"
                  >
                    spam
                  </text>
                  <text
                    x="44"
                    y={PR_SCORE_YN + 4}
                    fontSize="9"
                    fontFamily="monospace"
                    fill={PALETTE.ink}
                    textAnchor="end"
                  >
                    ham
                  </text>

                  {PR_SWEEP_POS.map((s) => (
                    <line
                      key={`pos-${s}`}
                      x1={PR_SCORE_X0 + s * PR_SCORE_W}
                      y1={PR_SCORE_YP - 14}
                      x2={PR_SCORE_X0 + s * PR_SCORE_W}
                      y2={PR_SCORE_YP + 14}
                      stroke={PALETTE.accent}
                      strokeWidth="2"
                    />
                  ))}
                  {PR_SWEEP_NEG.map((s, i) => (
                    <line
                      key={`neg-${i}`}
                      x1={PR_SCORE_X0 + s * PR_SCORE_W}
                      y1={PR_SCORE_YN - 10}
                      x2={PR_SCORE_X0 + s * PR_SCORE_W}
                      y2={PR_SCORE_YN + 10}
                      stroke={PALETTE.ink}
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  ))}

                  {/* Sweeping decision line */}
                  <g className="pr-bridge-pulse">
                    <line
                      x1={PR_SCORE_X0}
                      y1="120"
                      x2={PR_SCORE_X0}
                      y2="266"
                      stroke={PALETTE.accent}
                      strokeWidth="2.5"
                      strokeDasharray="5 4"
                      className="pr-bridge-sweep"
                    />
                  </g>
                  <text
                    x="60"
                    y="112"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={PALETTE.accent}
                  >
                    τ sweep
                  </text>

                  <path
                    d="M 360 170 C 396 170 414 170 450 170"
                    fill="none"
                    stroke={PALETTE.muted}
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <text
                    x="405"
                    y="160"
                    fontSize="9"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                    textAnchor="middle"
                  >
                    each τ → one point
                  </text>

                  {/* ===== RIGHT: PR curve ===== */}
                  <line
                    x1="450"
                    y1="300"
                    x2="750"
                    y2="300"
                    stroke={PALETTE.ink}
                    strokeWidth="1.2"
                  />
                  <line
                    x1="450"
                    y1="60"
                    x2="450"
                    y2="300"
                    stroke={PALETTE.ink}
                    strokeWidth="1.2"
                  />
                  <text
                    x="600"
                    y="326"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.ink}
                    textAnchor="middle"
                  >
                    Recall →
                  </text>
                  <text
                    x="432"
                    y="180"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.ink}
                    textAnchor="middle"
                    transform="rotate(-90 432 180)"
                  >
                    Precision →
                  </text>

                  {/* No-skill line at prevalence 0.20 */}
                  <line
                    x1="450"
                    y1="252"
                    x2="750"
                    y2="252"
                    stroke={PALETTE.muted}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="744"
                    y="246"
                    fontSize="9"
                    fontFamily="monospace"
                    fill={PALETTE.muted}
                    textAnchor="end"
                  >
                    no-skill (0.20)
                  </text>

                  <path d={PR_AREA} fill="rgba(222,93,53,0.10)" />
                  <path
                    d={PR_CURVE}
                    fill="none"
                    stroke={PALETTE.accent}
                    strokeWidth="2.5"
                  />

                  {/* Operating point tracing the curve */}
                  <circle
                    cx="0"
                    cy="0"
                    r="6"
                    fill={PALETTE.accent}
                    stroke={PALETTE.surface}
                    strokeWidth="2"
                    className="pr-bridge-track"
                  />
                  <text
                    x="560"
                    y="86"
                    fontSize="10"
                    fontFamily="monospace"
                    fill={PALETTE.accent}
                    fontWeight="bold"
                  >
                    (recall, precision) tracks τ
                  </text>
                </svg>
              </Looped>
              <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                At τ = 0.50 the sweep sits exactly on the running example · R
                75% · P 65.2%
              </p>
            </div>

            {/* Compact ledger: metric → cells */}
            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] overflow-x-auto">
              <div className="px-4 py-3 border-b border-[#1A1816]/15 text-[10px] font-mono uppercase tracking-widest text-[#75716B]">
                That&apos;s Not All · The Same Cells, Re-Cut
              </div>
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-[#75716B] border-b border-[#1A1816]/15">
                    <th className="px-4 py-2 font-bold">Metric</th>
                    <th className="px-4 py-2 font-bold">Cells Used</th>
                    <th className="px-4 py-2 font-bold">Blind To</th>
                    <th className="px-4 py-2 font-bold">Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {METRIC_LEDGER.map((row) => (
                    <tr
                      key={row.metric}
                      className="border-b border-[#1A1816]/10 last:border-0"
                    >
                      <td className="px-4 py-2 text-[#1A1816] font-bold whitespace-nowrap">
                        {row.metric}
                      </td>
                      <td className="px-4 py-2 text-[#DE5D35] whitespace-nowrap">
                        {row.cells}
                      </td>
                      <td className="px-4 py-2 text-[#75716B] whitespace-nowrap">
                        {row.blind}
                      </td>
                      <td className="px-4 py-2 text-[#4A4742]">
                        {row.answers}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/resources/logistic-regression"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
            >
              <span>← Topic 02: Logistic Regression</span>
            </Link>
            <Link
              href="/resources/roc-auc"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
            >
              <span>Topic 04: ROC &amp; AUC →</span>
            </Link>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
