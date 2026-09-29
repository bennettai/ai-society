"use client";

import Link from "next/link";
import { useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles } from "@/components/looped";
import MathTex from "@/components/MathTex";

export default function DecisionTreesArticlePage() {
  const [depthMode, setDepthMode] = useState<"shallow" | "deep">("shallow");

  const css = `
    @keyframes dtGatePulse {
      0%, 100% { opacity: 0.55; }
      50%      { opacity: 1; }
    }
    @keyframes dtTally {
      0%   { opacity: 0; transform: translateY(4px); }
      12%  { opacity: 1; transform: translateY(0); }
      88%  { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes dtSwapParent {
      0%, 45%  { opacity: 1; }
      55%, 95% { opacity: 0; }
      100%     { opacity: 1; }
    }
    @keyframes dtSwapChildren {
      0%, 45%  { opacity: 0; }
      55%, 95% { opacity: 1; }
      100%     { opacity: 0; }
    }
    @keyframes dtVoteFill {
      0%, 60%  { opacity: 0; transform: scale(0.6); }
      75%      { opacity: 1; transform: scale(1); }
      95%      { opacity: 1; }
      100%     { opacity: 0; transform: scale(0.6); }
    }
    .dt-gate  { animation: dtGatePulse 2.2s ease-in-out infinite; }
    .dt-tally { animation: dtTally 4s linear infinite; }
    .dt-parent  { animation: dtSwapParent 4.5s ease-in-out infinite; }
    .dt-children { animation: dtSwapChildren 4.5s ease-in-out infinite; }
    .dt-vote  { animation: dtVoteFill 4s ease-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .dt-gate, .dt-tally, .dt-parent, .dt-children, .dt-vote { animation: none; }
    }
  `;

  // Entropy node-impurity loop: the parent's uncertainty drains into the
  // children's purity, and information gain fills the gap that closes.
  const entropyCss = `
    @keyframes dt2Fade {
      0%, 10%  { opacity: 1; }
      52%, 90% { opacity: 0.3; }
      100%     { opacity: 1; }
    }
    @keyframes dt2Shrink {
      0%, 10%  { transform: scaleX(1); }
      52%, 90% { transform: scaleX(0.04); }
      100%     { transform: scaleX(1); }
    }
    @keyframes dt2Fill {
      0%, 10%  { transform: scaleX(0.16); }
      52%, 90% { transform: scaleX(1); }
      100%     { transform: scaleX(0.16); }
    }
    @keyframes dt2Gain {
      0%, 10%  { transform: scaleX(0); }
      52%, 90% { transform: scaleX(1); }
      100%     { transform: scaleX(0); }
    }
    @keyframes dt2Pop {
      0%, 10%  { transform: scaleY(0.5); opacity: 0.4; }
      52%, 90% { transform: scaleY(1); opacity: 1; }
      100%     { transform: scaleY(0.5); opacity: 0.4; }
    }
    @keyframes dt2SwapOut {
      0%, 12%  { opacity: 1; }
      46%, 94% { opacity: 0; }
      100%     { opacity: 1; }
    }
    @keyframes dt2SwapIn {
      0%, 12%  { opacity: 0; }
      46%, 94% { opacity: 1; }
      100%     { opacity: 0; }
    }
    .dt2-mix, .dt2-drain, .dt2-pure, .dt2-gain, .dt2-pop { transform-box: fill-box; }
    .dt2-mix   { animation: dt2Fade 7s ease-in-out infinite; }
    .dt2-drain { transform-origin: left center; transform: scaleX(1); animation: dt2Shrink 7s ease-in-out infinite; }
    .dt2-pure  { transform-origin: left center; transform: scaleX(0.16); animation: dt2Fill 7s ease-in-out infinite; }
    .dt2-gain  { transform-origin: left center; transform: scaleX(0); animation: dt2Gain 7s ease-in-out infinite; }
    .dt2-pop   { transform-origin: center; transform: scaleY(0.5); opacity: 0.4; animation: dt2Pop 7s ease-in-out infinite; }
    .dt2-on    { animation: dt2SwapOut 7s ease-in-out infinite; }
    .dt2-off   { opacity: 0; animation: dt2SwapIn 7s ease-in-out infinite; }
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
                Tree Ensembles · Decision Trees &amp; Random Forests
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 06
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              Decision Trees &amp; Random Forests
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              The most human model in machine learning: a flowchart that asks
              yes/no questions until it is confident. Watch data fall through
              the branches, learn how splits are chosen, and see why a forest
              beats a tree.
            </p>
          </header>

          {/* Section 01: THE BALL-DROP TREE */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / Watch Data Fall
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Ball-Drop Classifier
              </h2>
            </div>

            <p className="text-[14px] text-[#4A4742] leading-[1.7] max-w-3xl mb-6">
              Think of a decision tree as a Plinko machine for data. Every
              student is a ball —{" "}
              <span className="text-[#DE5D35] font-bold">
                orange balls pass
              </span>
              , <span className="font-bold">ink balls fail</span> — and every
              gate is a yes/no question. The ball falls, the gate deflects it
              left or right, and by the time it reaches a bucket, all balls in
              that bucket share a label.{" "}
              <strong>
                The tree learns by choosing questions that make each bucket as
                pure as possible.
              </strong>
            </p>

            {/* Ball drop animation panel */}
            <div className="border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
              <div className="flex flex-wrap items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#DE5D35]" />
                    <span>PASS student</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#1A1816]" />
                    <span>FAIL student</span>
                  </span>
                </div>
                <span className="font-semibold text-[#DE5D35]">
                  looping forever · 4 balls per cycle
                </span>
              </div>

              <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px] overflow-x-auto">
                <svg
                  viewBox="0 0 800 500"
                  className="w-full min-w-[620px] select-none"
                  role="img"
                  aria-label="Animated balls of two classes falling through a decision tree into labeled buckets"
                >
                  {/* ---- Routes (drawn under everything) ---- */}
                  <g
                    stroke="#1A1816"
                    strokeOpacity="0.25"
                    strokeWidth="1.5"
                    fill="none"
                  >
                    {/* Root to level 2 */}
                    <path d="M 400 95 L 200 205" />
                    <path d="M 400 95 L 600 205" />
                    {/* Left gate to leaves */}
                    <path d="M 200 235 L 100 385" />
                    <path d="M 200 235 L 300 385" />
                    {/* Right gate to leaves */}
                    <path d="M 600 235 L 500 385" />
                    <path d="M 600 235 L 700 385" />
                  </g>

                  {/* Named motion routes for the balls */}
                  <path
                    id="dt-r-pass-left"
                    d="M 400 25 L 400 95 L 200 205 L 200 235 L 100 385 L 100 420"
                    fill="none"
                  />
                  <path
                    id="dt-r-fail-left"
                    d="M 400 25 L 400 95 L 200 205 L 200 235 L 300 385 L 300 420"
                    fill="none"
                  />
                  <path
                    id="dt-r-fail-right"
                    d="M 400 25 L 400 95 L 600 205 L 600 235 L 500 385 L 500 420"
                    fill="none"
                  />
                  <path
                    id="dt-r-pass-right"
                    d="M 400 25 L 400 95 L 600 205 L 600 235 L 700 385 L 700 420"
                    fill="none"
                  />
                  <path
                    id="dt-r-pass-left-2"
                    d="M 400 25 L 400 95 L 200 205 L 200 235 L 100 385 L 100 420"
                    fill="none"
                  />
                  <path
                    id="dt-r-fail-right-2"
                    d="M 400 25 L 400 95 L 600 205 L 600 235 L 500 385 L 500 420"
                    fill="none"
                  />

                  {/* ---- Gates ---- */}
                  <g>
                    {/* Root */}
                    <rect
                      x="352"
                      y="55"
                      width="96"
                      height="40"
                      rx="3"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="2"
                    />
                    <text
                      x="400"
                      y="79"
                      fontSize="13"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontWeight="bold"
                    >
                      Hours &gt; 2?
                    </text>
                    {/* Left gate */}
                    <rect
                      x="128"
                      y="200"
                      width="144"
                      height="34"
                      rx="3"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      className="dt-gate"
                    />
                    <text
                      x="200"
                      y="221"
                      fontSize="12"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#1A1816"
                    >
                      Assignments &gt; 5?
                    </text>
                    {/* Right gate */}
                    <rect
                      x="528"
                      y="200"
                      width="144"
                      height="34"
                      rx="3"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                      className="dt-gate"
                      style={{ animationDelay: "1.1s" }}
                    />
                    <text
                      x="600"
                      y="221"
                      fontSize="12"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#1A1816"
                    >
                      Attendance &gt; 60%?
                    </text>
                  </g>

                  {/* Yes/No edge labels */}
                  <text
                    x="285"
                    y="140"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#75716B"
                  >
                    no
                  </text>
                  <text
                    x="510"
                    y="140"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#75716B"
                  >
                    yes
                  </text>
                  <text
                    x="128"
                    y="300"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#75716B"
                    textAnchor="end"
                  >
                    yes
                  </text>
                  <text
                    x="215"
                    y="300"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#75716B"
                  >
                    no
                  </text>
                  <text
                    x="585"
                    y="300"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#75716B"
                  >
                    no
                  </text>
                  <text
                    x="615"
                    y="300"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#75716B"
                  >
                    yes
                  </text>

                  {/* ---- Buckets ---- */}
                  {[
                    { x: 60, label: "PASS", fill: "#DE5D35", tc: "#DE5D35" },
                    { x: 260, label: "FAIL", fill: "#1A1816", tc: "#1A1816" },
                    { x: 460, label: "FAIL", fill: "#1A1816", tc: "#1A1816" },
                    { x: 660, label: "PASS", fill: "#DE5D35", tc: "#DE5D35" },
                  ].map((b) => (
                    <g key={b.label + b.x}>
                      <path
                        d={`M ${b.x} 390 L ${b.x} 445 L ${b.x + 80} 445 L ${b.x + 80} 390`}
                        fill="none"
                        stroke={b.tc}
                        strokeWidth="2.5"
                      />
                      <text
                        x={b.x + 40}
                        y="468"
                        fontSize="13"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill={b.tc}
                        fontWeight="bold"
                      >
                        {b.label}
                      </text>
                    </g>
                  ))}

                  {/* Tally dots accumulating in buckets (looped) */}
                  {[0, 1, 2].map((i) => (
                    <circle
                      key={`t-left-${i}`}
                      className="dt-tally"
                      style={{ animationDelay: `${1.2 + i * 0.35}s` }}
                      cx={80 + i * 18}
                      cy={430}
                      r="6"
                      fill="#DE5D35"
                    />
                  ))}
                  {[0, 1, 2].map((i) => (
                    <circle
                      key={`t-l2-${i}`}
                      className="dt-tally"
                      style={{ animationDelay: `${1.9 + i * 0.35}s` }}
                      cx={280 + i * 18}
                      cy={430}
                      r="6"
                      fill="#1A1816"
                    />
                  ))}
                  {[0, 1, 2].map((i) => (
                    <circle
                      key={`t-r2-${i}`}
                      className="dt-tally"
                      style={{ animationDelay: `${2.2 + i * 0.35}s` }}
                      cx={480 + i * 18}
                      cy={430}
                      r="6"
                      fill="#1A1816"
                    />
                  ))}
                  {[0, 1, 2].map((i) => (
                    <circle
                      key={`t-right-${i}`}
                      className="dt-tally"
                      style={{ animationDelay: `${2.9 + i * 0.35}s` }}
                      cx={680 + i * 18}
                      cy={430}
                      r="6"
                      fill="#DE5D35"
                    />
                  ))}

                  {/* ---- The falling balls ---- */}
                  {/* Orange through left to PASS */}
                  <circle r="9" fill="#DE5D35" stroke="#FAF9F5" strokeWidth="2">
                    <animateMotion
                      dur="4s"
                      begin="0s"
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#dt-r-pass-left" />
                    </animateMotion>
                  </circle>
                  {/* Ink through left to FAIL */}
                  <circle r="9" fill="#1A1816" stroke="#FAF9F5" strokeWidth="2">
                    <animateMotion
                      dur="4s"
                      begin="1s"
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#dt-r-fail-left" />
                    </animateMotion>
                  </circle>
                  {/* Ink through right to FAIL */}
                  <circle r="9" fill="#1A1816" stroke="#FAF9F5" strokeWidth="2">
                    <animateMotion
                      dur="4s"
                      begin="2s"
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#dt-r-fail-right" />
                    </animateMotion>
                  </circle>
                  {/* Orange through right to PASS */}
                  <circle r="9" fill="#DE5D35" stroke="#FAF9F5" strokeWidth="2">
                    <animateMotion
                      dur="4s"
                      begin="3s"
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#dt-r-pass-right" />
                    </animateMotion>
                  </circle>
                  {/* Second wave: orange left, ink right, offset */}
                  <circle
                    r="9"
                    fill="#DE5D35"
                    stroke="#FAF9F5"
                    strokeWidth="2"
                    opacity="0.75"
                  >
                    <animateMotion
                      dur="4s"
                      begin="2s"
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#dt-r-pass-left-2" />
                    </animateMotion>
                  </circle>
                  <circle
                    r="9"
                    fill="#1A1816"
                    stroke="#FAF9F5"
                    strokeWidth="2"
                    opacity="0.75"
                  >
                    <animateMotion
                      dur="4s"
                      begin="0.5s"
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#dt-r-fail-right-2" />
                    </animateMotion>
                  </circle>
                </svg>
              </div>

              <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                Every bucket is a leaf · every gate is a learned question
              </p>
            </div>
          </section>

          {/* Section 02: Anatomy & how training works */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                02 / How the Questions Are Chosen
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Impurity, Information Gain &amp; Greedy Splitting
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  A tree is grown top-down, greedily: at every node the
                  algorithm tries <em>every feature and every threshold</em>,
                  and keeps the split that produces the{" "}
                  <strong>purest children</strong>. Purity is measured by:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Gini Impurity
                  </span>
                  <MathTex math="G = 1 - \sum_{k} p_k^2" block />
                  <p className="text-[12px] text-[#75716B] mt-2">
                    Probability of mislabeling a random sample. 0 = pure node.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Entropy &amp; Information Gain
                  </span>
                  <MathTex
                    math="H = -\sum_{k} p_k \log_2 p_k \quad\quad \text{IG} = H(\text{parent}) - \tfrac{n_L}{n} H(\text{left}) - \tfrac{n_R}{n} H(\text{right})"
                    block
                  />
                  <p className="text-[12px] text-[#75716B] mt-2">
                    Gini and entropy behave almost identically in practice —
                    scikit-learn defaults to Gini because it skips a logarithm.
                  </p>
                </div>
                <p>
                  Worked example: a node holds 4 pass + 4 fail (Gini = 0.5).
                  Split on &ldquo;Assignments &gt; 5?&rdquo; and the children
                  hold 4+0 and 0+4 — Gini drops to 0. That information gain of
                  0.5 is why the tree asks this question first.
                </p>
              </div>

              {/* Purification loop animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>ONE SPLIT, TWO PURE CHILDREN</span>
                  <span className="font-bold text-[#DE5D35]">
                    Gini 0.50 → 0.00
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 640 300"
                    className="w-full select-none"
                    role="img"
                    aria-label="Animation of a mixed parent node splitting into two pure child nodes"
                  >
                    {/* Parent node box */}
                    <rect
                      x="220"
                      y="30"
                      width="200"
                      height="90"
                      rx="4"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                    />
                    <text
                      x="320"
                      y="22"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      parent · 4 pass + 4 fail
                    </text>

                    {/* Mixed dots (fade out) */}
                    <g className="dt-parent">
                      {[0, 1, 2, 3].map((i) => (
                        <circle
                          key={`m-a-${i}`}
                          cx={255 + i * 24}
                          cy={68}
                          r="9"
                          fill="#DE5D35"
                        />
                      ))}
                      {[0, 1, 2, 3].map((i) => (
                        <circle
                          key={`m-b-${i}`}
                          cx={255 + i * 24}
                          cy={96}
                          r="9"
                          fill="#1A1816"
                        />
                      ))}
                    </g>

                    {/* Split arrows */}
                    <path
                      d="M 270 125 L 150 195"
                      stroke="#75716B"
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray="4 3"
                    />
                    <path
                      d="M 370 125 L 490 195"
                      stroke="#75716B"
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray="4 3"
                    />
                    <text
                      x="150"
                      y="165"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="#75716B"
                      textAnchor="middle"
                    >
                      yes
                    </text>
                    <text
                      x="490"
                      y="165"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="#75716B"
                      textAnchor="middle"
                    >
                      no
                    </text>

                    {/* Child boxes with pure dots (fade in) */}
                    <rect
                      x="60"
                      y="195"
                      width="180"
                      height="80"
                      rx="4"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="2"
                    />
                    <g className="dt-children">
                      {[0, 1, 2, 3].map((i) => (
                        <circle
                          key={`c-a-${i}`}
                          cx={95 + i * 26}
                          cy={228}
                          r="9"
                          fill="#DE5D35"
                        />
                      ))}
                    </g>
                    <text
                      x="150"
                      y="262"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontWeight="bold"
                    >
                      4 pass · Gini 0
                    </text>

                    <rect
                      x="400"
                      y="195"
                      width="180"
                      height="80"
                      rx="4"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <g className="dt-children">
                      {[0, 1, 2, 3].map((i) => (
                        <circle
                          key={`c-b-${i}`}
                          cx={435 + i * 26}
                          cy={228}
                          r="9"
                          fill="#1A1816"
                        />
                      ))}
                    </g>
                    <text
                      x="490"
                      y="262"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontWeight="bold"
                    >
                      4 fail · Gini 0
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  Repeat until pure — or until told to stop.
                </p>
              </div>
            </div>
          </section>

          {/* Section 03: Entropy, information gain & ID3 */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <LoopedStyles
              css={entropyCss}
              reduceMotionTargets={[
                ".dt2-mix",
                ".dt2-drain",
                ".dt2-pure",
                ".dt2-gain",
                ".dt2-pop",
                ".dt2-on",
                ".dt2-off",
              ]}
            />
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Entropy, Information Gain &amp; ID3
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Measuring Surprise in Bits
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Gini is one way to score a split; the original one is{" "}
                  <strong>entropy</strong>. Entropy is the{" "}
                  <em>expected surprise</em> of a random draw from the node. A
                  bucket that holds one class surprises nobody; a 50/50 bucket
                  is a coin flip every single time.
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Shannon Entropy
                  </span>
                  <MathTex math="H(S) = -\sum_{k=1}^{K} p_k \log_2 p_k" block />
                  <p className="text-[12px] text-[#75716B] mt-2">
                    p_k is the share of class k in the node. The minus sign is
                    only there because the logarithm of a probability is
                    negative.
                  </p>
                </div>
                <p>
                  The base-2 logarithm is what makes the units{" "}
                  <strong>bits</strong>. <MathTex math="-\log_2 p" /> counts how
                  many halvings it takes to narrow the field down to one outcome
                  — a number of yes/no questions. Entropy is therefore a
                  question budget, and since every split in a tree is a yes/no
                  question, bits are its natural currency. Change the base and
                  you only rescale that budget.
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    Information Gain
                  </span>
                  <MathTex
                    math="\text{IG}(S, A) = H(S) - \sum_{v} \frac{|S_v|}{|S|}\, H(S_v)"
                    block
                  />
                  <p className="text-[12px] text-[#75716B] mt-2">
                    The parent&apos;s entropy minus the size-weighted average of
                    the children&apos;s entropies — the bits of uncertainty the
                    question removes.
                  </p>
                </div>
                <p>
                  Read it as a subtraction. A question that leaves its children
                  as confused as the parent gains nothing; one that separates
                  the classes cleanly gains everything. Because the score is
                  always in bits, ID3 can compare wildly different questions — a
                  height threshold against a diameter threshold — on the same
                  scale.
                </p>
              </div>

              {/* Entropy drain loop */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>ENTROPY DRAINS · INFORMATION GAIN FILLS</span>
                  <span className="font-bold text-[#DE5D35]">
                    7s loop · H 1.00 → 0.00
                  </span>
                </div>
                <Looped
                  label="Looped animation: a mixed parent node drains its entropy meter toward zero as its two children grow pure, while the information gain bar fills the gap that closes"
                  className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px] overflow-x-auto"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 660 400"
                    className="w-full min-w-[520px] select-none"
                  >
                    {/* Parent card */}
                    <rect
                      x="20"
                      y="120"
                      width="200"
                      height="150"
                      rx="4"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                    />
                    <text
                      x="120"
                      y="108"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      parent · 4 PASS + 4 FAIL
                    </text>

                    {/* Mixed dots lose emphasis as the children resolve */}
                    <g className="dt2-mix">
                      {[0, 1, 2, 3].map((i) => (
                        <circle
                          key={`dt2-pa-${i}`}
                          cx={72 + i * 32}
                          cy={162}
                          r="9"
                          fill="#DE5D35"
                        />
                      ))}
                      {[0, 1, 2, 3].map((i) => (
                        <circle
                          key={`dt2-pb-${i}`}
                          cx={72 + i * 32}
                          cy={196}
                          r="9"
                          fill="#1A1816"
                        />
                      ))}
                    </g>

                    {/* Entropy meter drains toward zero */}
                    <rect
                      x="40"
                      y="226"
                      width="160"
                      height="10"
                      rx="1"
                      fill="#EAE7DF"
                      stroke="#1A1816"
                      strokeOpacity="0.15"
                    />
                    <rect
                      x="40"
                      y="226"
                      width="160"
                      height="10"
                      rx="1"
                      fill="#DE5D35"
                      className="dt2-drain"
                    />
                    <text
                      x="120"
                      y="258"
                      fontSize="12"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontWeight="bold"
                      className="dt2-on"
                    >
                      H = 1.00
                    </text>
                    <text
                      x="120"
                      y="258"
                      fontSize="12"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontWeight="bold"
                      className="dt2-off"
                    >
                      H = 0.00
                    </text>

                    {/* Split edges */}
                    <path
                      d="M 220 180 L 400 130"
                      stroke="#75716B"
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray="4 3"
                    />
                    <path
                      d="M 220 210 L 400 300"
                      stroke="#75716B"
                      strokeWidth="1.5"
                      fill="none"
                      strokeDasharray="4 3"
                    />
                    <text
                      x="305"
                      y="146"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      yes
                    </text>
                    <text
                      x="305"
                      y="262"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      no
                    </text>

                    {/* Child A becomes pure */}
                    <rect
                      x="400"
                      y="70"
                      width="230"
                      height="120"
                      rx="4"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1.5"
                    />
                    <text
                      x="515"
                      y="58"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      child A · 4 PASS
                    </text>
                    <g className="dt2-pop">
                      {[0, 1, 2, 3].map((i) => (
                        <circle
                          key={`dt2-ca-${i}`}
                          cx={467 + i * 32}
                          cy={112}
                          r="9"
                          fill="#DE5D35"
                        />
                      ))}
                    </g>
                    <rect
                      x="430"
                      y="140"
                      width="170"
                      height="10"
                      rx="1"
                      fill="#EAE7DF"
                      stroke="#1A1816"
                      strokeOpacity="0.15"
                    />
                    <rect
                      x="430"
                      y="140"
                      width="170"
                      height="10"
                      rx="1"
                      fill="#DE5D35"
                      className="dt2-pure"
                    />
                    <text
                      x="515"
                      y="175"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#DE5D35"
                      fontWeight="bold"
                    >
                      pure · P(PASS) = 1.00
                    </text>

                    {/* Child B becomes pure */}
                    <rect
                      x="400"
                      y="240"
                      width="230"
                      height="120"
                      rx="4"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="1.5"
                    />
                    <text
                      x="515"
                      y="228"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      child B · 4 FAIL
                    </text>
                    <g className="dt2-pop">
                      {[0, 1, 2, 3].map((i) => (
                        <circle
                          key={`dt2-cb-${i}`}
                          cx={467 + i * 32}
                          cy={282}
                          r="9"
                          fill="#1A1816"
                        />
                      ))}
                    </g>
                    <rect
                      x="430"
                      y="310"
                      width="170"
                      height="10"
                      rx="1"
                      fill="#EAE7DF"
                      stroke="#1A1816"
                      strokeOpacity="0.15"
                    />
                    <rect
                      x="430"
                      y="310"
                      width="170"
                      height="10"
                      rx="1"
                      fill="#1A1816"
                      className="dt2-pure"
                    />
                    <text
                      x="515"
                      y="345"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#1A1816"
                      fontWeight="bold"
                    >
                      pure · P(FAIL) = 1.00
                    </text>

                    {/* Information gain fills the gap that closes */}
                    <text
                      x="20"
                      y="378"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="#75716B"
                    >
                      information gain · H(parent) − weighted H(children)
                    </text>
                    <text
                      x="640"
                      y="378"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#75716B"
                      fontWeight="bold"
                      className="dt2-on"
                    >
                      0.00 bits
                    </text>
                    <text
                      x="640"
                      y="378"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="end"
                      fill="#DE5D35"
                      fontWeight="bold"
                      className="dt2-off"
                    >
                      1.00 bit
                    </text>
                    <rect
                      x="20"
                      y="384"
                      width="610"
                      height="12"
                      rx="1"
                      fill="#EAE7DF"
                      stroke="#1A1816"
                      strokeOpacity="0.15"
                    />
                    <rect
                      x="20"
                      y="384"
                      width="610"
                      height="12"
                      rx="1"
                      fill="#DE5D35"
                      className="dt2-gain"
                    />
                  </svg>
                </Looped>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  The meter empties · the gain bar fills · then the split resets
                </p>
              </div>
            </div>

            {/* Entropy anchors */}
            <div className="mt-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                Entropy anchors
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <div className="text-[26px] font-black font-mono text-[#DE5D35] leading-none">
                    0
                  </div>
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#75716B] mt-2">
                    Pure node
                  </span>
                  <p className="text-[12px] text-[#75716B] mt-1">
                    One class holds everything. No surprise left to remove, so
                    the tree stops here.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <div className="text-[26px] font-black font-mono text-[#1A1816] leading-none">
                    1
                  </div>
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#75716B] mt-2">
                    50 / 50 binary
                  </span>
                  <p className="text-[12px] text-[#75716B] mt-1">
                    One full bit of uncertainty — the most a two-class node can
                    ever carry.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <div className="text-[26px] font-black font-mono text-[#1A1816] leading-none">
                    1.585
                  </div>
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#75716B] mt-2">
                    Three uniform classes
                  </span>
                  <p className="text-[12px] text-[#75716B] mt-1">
                    <MathTex math="\log_2 3" /> — the ceiling for K equally
                    likely classes is <MathTex math="\log_2 K" />.
                  </p>
                </div>
              </div>
            </div>

            {/* ID3 recipe */}
            <div className="mt-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                ID3 · the recursive recipe
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    1 · Score every question
                  </span>
                  <p className="text-[13px]">
                    Take the entropy of the node, then try every feature and
                    every cutoff, computing the information gain of each
                    candidate partition.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    2 · Keep the best split
                  </span>
                  <p className="text-[13px]">
                    Choose the partition with the maximum information gain and
                    freeze it into a decision node on that feature and value.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    3 · Recurse
                  </span>
                  <p className="text-[13px]">
                    Send each subset down its own branch and repeat the whole
                    procedure there — the same greedy question, one level
                    deeper.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    4 · Stop and label
                  </span>
                  <p className="text-[13px]">
                    Halt when a node is pure, features run out, or a depth or
                    leaf-size limit is hit — then stamp the leaf with the
                    majority class.
                  </p>
                </div>
              </div>
            </div>

            {/* Information measures compared */}
            <div className="mt-8 p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
              <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-3">
                A note on information measures
              </span>
              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#1A1816]/10 pb-2">
                  <span className="inline-flex items-baseline gap-2 font-mono text-[12px] font-bold">
                    <span>GINI</span>
                    <MathTex math="1-\sum_k p_k^2" />
                  </span>
                  <span className="text-[13px] text-[#75716B]">
                    Cheapest — no logarithm. The pragmatic default.
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#1A1816]/10 pb-2">
                  <span className="inline-flex items-baseline gap-2 font-mono text-[12px] font-bold">
                    <span>ENTROPY</span>
                    <MathTex math="-\sum_k p_k \log_2 p_k" />
                  </span>
                  <span className="text-[13px] text-[#75716B]">
                    Theoretically motivated, measured in bits. Gentler on
                    imbalanced data.
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="inline-flex items-baseline gap-2 font-mono text-[12px] font-bold">
                    <span>MISCLASSIFICATION</span>
                    <MathTex math="1-\max_k p_k" />
                  </span>
                  <span className="text-[13px] text-[#75716B]">
                    Crudest — blind to how the remaining mass is distributed.
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-[#4A4742] leading-[1.7] mt-3">
                All three answer the same question — how mixed is this node —
                and in practice they usually crown the same winning split. When
                they disagree the gap is small; the real differences are cost to
                compute and how they behave at the extremes.
              </p>
            </div>
          </section>

          {/* Section 04: Overfitting & depth control */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / When Memory Replaces Learning
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Overfitting, Depth &amp; Pruning
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Left unchecked, a tree keeps splitting until every leaf
                  contains one training point — a perfect scoreboard on the data
                  it memorized, and a disaster on anything new. A deep tree has
                  learned <strong>noise</strong>, not signal.
                </p>
                <p>The counter-moves are all limits on growth:</p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 text-[13px] space-y-2">
                  <div className="flex justify-between font-mono text-[12px]">
                    <span className="text-[#75716B]">max_depth</span>
                    <span className="font-bold">fewer questions total</span>
                  </div>
                  <div className="flex justify-between font-mono text-[12px]">
                    <span className="text-[#75716B]">min_samples_split</span>
                    <span className="font-bold">no splitting tiny groups</span>
                  </div>
                  <div className="flex justify-between font-mono text-[12px]">
                    <span className="text-[#75716B]">min_samples_leaf</span>
                    <span className="font-bold">every leaf needs evidence</span>
                  </div>
                  <div className="flex justify-between font-mono text-[12px]">
                    <span className="text-[#75716B]">ccp_alpha</span>
                    <span className="font-bold">prune back after growing</span>
                  </div>
                </div>
                <p>
                  In the animation, the{" "}
                  <span className="text-[#DE5D35] font-bold">
                    orange train error
                  </span>{" "}
                  only ever falls as depth grows — but the{" "}
                  <span className="font-bold">ink test error</span> turns around
                  and climbs. The sweet spot is the bottom of that U, and Topic
                  05&apos;s cross-validation is how we find it.
                </p>
              </div>

              {/* Depth / generalization loop */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-[11px] font-mono text-[#75716B]">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DE5D35]" />
                      <span>train error</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1A1816]" />
                      <span>test error</span>
                    </span>
                  </div>
                  <span className="font-semibold text-[#DE5D35]">
                    looping sweep over tree depth
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 640 300"
                    className="w-full select-none"
                    role="img"
                    aria-label="Animated train and test error curves over tree depth"
                  >
                    {/* Axes */}
                    <line
                      x1="50"
                      y1="260"
                      x2="600"
                      y2="260"
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <line
                      x1="50"
                      y1="30"
                      x2="50"
                      y2="260"
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <text
                      x="325"
                      y="285"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      tree depth (complexity) →
                    </text>
                    <text
                      x="24"
                      y="145"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                      transform="rotate(-90 24 145)"
                    >
                      error →
                    </text>

                    {/* Train error: monotone decreasing */}
                    <path
                      d="M 60 90 Q 200 170 590 215"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="2.5"
                    />
                    {/* Test error: U shape */}
                    <path
                      d="M 60 120 Q 220 205 280 195 Q 420 175 590 60"
                      fill="none"
                      stroke="#1A1816"
                      strokeWidth="2.5"
                    />

                    {/* Sweet spot marker */}
                    <line
                      x1="280"
                      y1="60"
                      x2="280"
                      y2="260"
                      stroke="#75716B"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />
                    <text
                      x="280"
                      y="50"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="#75716B"
                      textAnchor="middle"
                    >
                      sweet spot
                    </text>

                    {/* Overfit zone label */}
                    <text
                      x="480"
                      y="45"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="#EF4444"
                      textAnchor="middle"
                    >
                      memorization zone
                    </text>

                    {/* Traveling markers synced over depth */}
                    <circle
                      r="6"
                      fill="#DE5D35"
                      stroke="#FAF9F5"
                      strokeWidth="1.5"
                    >
                      <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        calcMode="linear"
                        path="M 60 90 Q 200 170 590 215"
                      />
                    </circle>
                    <circle
                      r="6"
                      fill="#1A1816"
                      stroke="#FAF9F5"
                      strokeWidth="1.5"
                    >
                      <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        calcMode="linear"
                        path="M 60 120 Q 220 205 280 195 Q 420 175 590 60"
                      />
                    </circle>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  Depth 1 = underfit · depth 20 = memorized the noise
                </p>
              </div>
            </div>

            {/* Depth mode toggle — mini interactive */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-mono text-[#75716B] uppercase tracking-widest">
                Try it:
              </span>
              {(["shallow", "deep"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={depthMode === m}
                  onClick={() => setDepthMode(m)}
                  className={`px-4 py-2 rounded-[2px] font-mono text-[12px] font-bold tracking-wider uppercase border transition-colors duration-200 ${
                    depthMode === m
                      ? "bg-[#1A1816] border-[#1A1816] text-[#FAF9F5]"
                      : "bg-[#FAF9F5] border-[#1A1816]/25 text-[#4A4742] hover:border-[#1A1816]"
                  }`}
                >
                  {m === "shallow"
                    ? "Shallow Tree (depth 2)"
                    : "Deep Tree (depth 12)"}
                </button>
              ))}
              <span className="text-[13px] text-[#4A4742]">
                {depthMode === "shallow"
                  ? "→ 90% train / 87% test. Honest, slightly underfit."
                  : "→ 100% train / 61% test. A perfect memory, useless in production."}
              </span>
            </div>
          </section>

          {/* Section 04: Random Forests */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / Wisdom of the Crowd
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Random Forests: Bagging + Voting
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Forest voting loop */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>ONE QUERY · THREE TREES · MAJORITY WINS</span>
                  <span className="font-semibold text-[#DE5D35]">looping</span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px] overflow-x-auto">
                  <svg
                    viewBox="0 0 640 340"
                    className="w-full min-w-[520px] select-none"
                    role="img"
                    aria-label="Animated query ball dropping through three random forest trees with a majority vote tally"
                  >
                    {/* Query ball entry */}
                    <text
                      x="320"
                      y="24"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      new student →
                    </text>

                    {/* Three mini trees */}
                    {[110, 320, 530].map((cx, t) => (
                      <g key={t}>
                        {/* root */}
                        <circle
                          cx={cx}
                          cy={90}
                          r="13"
                          fill="#FAF9F5"
                          stroke="#1A1816"
                          strokeWidth="1.5"
                        />
                        {/* edges */}
                        <path
                          d={`M ${cx} 103 L ${cx - 45} 150`}
                          stroke="#1A1816"
                          strokeOpacity="0.3"
                          strokeWidth="1.5"
                        />
                        <path
                          d={`M ${cx} 103 L ${cx + 45} 150`}
                          stroke="#1A1816"
                          strokeOpacity="0.3"
                          strokeWidth="1.5"
                        />
                        {/* leaves */}
                        <circle
                          cx={cx - 45}
                          cy={160}
                          r="10"
                          fill="#EAE7DF"
                          stroke="#1A1816"
                          strokeOpacity="0.4"
                        />
                        <circle
                          cx={cx + 45}
                          cy={160}
                          r="10"
                          fill="#EAE7DF"
                          stroke="#1A1816"
                          strokeOpacity="0.4"
                        />
                        <text
                          x={cx - 45}
                          y={192}
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill={t === 1 ? "#1A1816" : "#DE5D35"}
                          fontWeight="bold"
                        >
                          {t === 1 ? "FAIL" : "PASS"}
                        </text>
                        <text
                          x={cx + 45}
                          y={192}
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill={t === 1 ? "#DE5D35" : "#1A1816"}
                          fontWeight="bold"
                        >
                          {t === 1 ? "PASS" : "FAIL"}
                        </text>
                      </g>
                    ))}

                    {/* Ball motion routes into each tree (tree 0 & 2 → PASS leaf; tree 1 → FAIL leaf) */}
                    <path
                      id="dt-f-0"
                      d="M 320 40 L 320 60 L 110 60 L 110 77 L 65 160"
                      fill="none"
                    />
                    <path
                      id="dt-f-1"
                      d="M 320 40 L 320 77 L 365 160"
                      fill="none"
                    />
                    <path
                      id="dt-f-2"
                      d="M 320 40 L 320 60 L 530 60 L 530 77 L 575 160"
                      fill="none"
                    />

                    <circle
                      r="8"
                      fill="#DE5D35"
                      stroke="#FAF9F5"
                      strokeWidth="1.5"
                    >
                      <animateMotion
                        dur="3.2s"
                        repeatCount="indefinite"
                        calcMode="linear"
                      >
                        <mpath href="#dt-f-0" />
                      </animateMotion>
                    </circle>
                    <circle
                      r="8"
                      fill="#DE5D35"
                      stroke="#FAF9F5"
                      strokeWidth="1.5"
                    >
                      <animateMotion
                        dur="3.2s"
                        repeatCount="indefinite"
                        calcMode="linear"
                      >
                        <mpath href="#dt-f-1" />
                      </animateMotion>
                    </circle>
                    <circle
                      r="8"
                      fill="#DE5D35"
                      stroke="#FAF9F5"
                      strokeWidth="1.5"
                    >
                      <animateMotion
                        dur="3.2s"
                        repeatCount="indefinite"
                        calcMode="linear"
                      >
                        <mpath href="#dt-f-2" />
                      </animateMotion>
                    </circle>

                    {/* Vote tally */}
                    <text
                      x="320"
                      y="245"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#75716B"
                    >
                      votes:
                    </text>
                    {[0, 1, 2].map((i) => (
                      <circle
                        key={`v-${i}`}
                        className="dt-vote"
                        style={{ animationDelay: `${1.6 + i * 0.3}s` }}
                        cx={275 + i * 45}
                        cy={240}
                        r="13"
                        fill={i === 1 ? "#1A1816" : "#DE5D35"}
                      />
                    ))}

                    {/* Majority verdict */}
                    <rect
                      x="200"
                      y="275"
                      width="240"
                      height="40"
                      rx="3"
                      fill="#DE5D35"
                      className="dt-vote"
                      style={{ animationDelay: "2.6s" }}
                    />
                    <text
                      x="320"
                      y="300"
                      fontSize="13"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fill="#FAF9F5"
                      fontWeight="bold"
                      className="dt-vote"
                      style={{ animationDelay: "2.6s" }}
                    >
                      MAJORITY → PASS (2 vs 1)
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  Each tree sees a bootstrap sample &amp; a random feature
                  subset
                </p>
              </div>

              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4 order-1 lg:order-2">
                <p>
                  One deep tree is a nervous genius; a forest of slightly wrong
                  trees is a calm committee. A <strong>random forest</strong>{" "}
                  trains hundreds of trees on <em>deliberately corrupted</em>{" "}
                  views of the data so their mistakes don&apos;t correlate:
                </p>
                <div className="space-y-3">
                  <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                      1 · Bootstrap (Bagging)
                    </span>
                    <p className="text-[13px]">
                      Each tree trains on a random{" "}
                      <em>sample with replacement</em> — about 63% unique rows,
                      the rest are duplicates. Every tree sees a slightly
                      different dataset.
                    </p>
                  </div>
                  <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                      2 · Feature Randomness
                    </span>
                    <p className="text-[13px]">
                      At every split, only <MathTex math="\sqrt{p}" /> random
                      features may compete. This stops one dominant feature from
                      making all trees identical.
                    </p>
                  </div>
                  <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                    <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                      3 · Aggregate
                    </span>
                    <p className="text-[13px]">
                      Classification = majority vote; regression = average of
                      predictions. Variance shrinks roughly with{" "}
                      <MathTex math="1/\sqrt{B}" /> for <MathTex math="B" />{" "}
                      trees — while bias stays low.
                    </p>
                  </div>
                </div>
                <p>
                  Bonus: the ~37% of rows each tree never saw (
                  <strong>out-of-bag</strong>) form a free validation set —
                  cross-validation built into the training loop.
                </p>
              </div>
            </div>
          </section>

          {/* Section 05: Field guide */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                06 / Field Guide
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                When to Reach for Trees
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  SUPERPOWERS
                </span>
                <ul className="text-[13px] text-[#4A4742] leading-[1.8] list-none space-y-1">
                  <li>· No scaling or normalization needed</li>
                  <li>· Handles mixed &amp; missing data gracefully</li>
                  <li>· Captures non-linear interactions automatically</li>
                  <li>· Fully interpretable (single tree)</li>
                  <li>· Feature importance for free</li>
                </ul>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#EF4444] font-bold mb-2">
                  KRYPTONITE
                </span>
                <ul className="text-[13px] text-[#4A4742] leading-[1.8] list-none space-y-1">
                  <li>· Single trees overfit easily</li>
                  <li>
                    · Axis-aligned splits struggle on smooth diagonal boundaries
                  </li>
                  <li>· Forests lose the interpretability</li>
                  <li>· Can&apos;t extrapolate beyond training range</li>
                  <li>· Larger memory than linear models</li>
                </ul>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                  KNOBS THAT MATTER
                </span>
                <ul className="text-[13px] text-[#4A4742] leading-[1.8] list-none space-y-1">
                  <li>· n_estimators — more is safer, slower</li>
                  <li>· max_depth — the overfit dial</li>
                  <li>· max_features — decorrelation dial</li>
                  <li>· min_samples_leaf — smoothing dial</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-[#1A1816] text-[#FAF9F5]">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                THE ROAD AHEAD
              </span>
              <p className="text-[13px] leading-[1.7] max-w-3xl text-[#FAF9F5]/85">
                Gradient boosting (XGBoost, LightGBM) grows trees{" "}
                <em>sequentially</em>, each one correcting the previous
                ensemble&apos;s residuals — it is the same ball-drop machinery
                aimed at what the committee still gets wrong. And when features
                become images or sequences instead of a tidy table, trees
                struggle and the neural networks of Topics 07–09 take over.
              </p>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/resources/cross-validation"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
            >
              <span>← Topic 05: K-Fold Cross-Validation</span>
            </Link>
            <Link
              href="/resources/neural-networks"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
            >
              <span>Topic 07: Neural Networks →</span>
            </Link>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
