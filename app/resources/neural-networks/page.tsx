"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles } from "@/components/looped";
import MathTex from "@/components/MathTex";

const BackpropSimulator = dynamic(
  () => import("@/components/BackpropSimulator"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] p-12 flex flex-col items-center justify-center min-h-[580px] text-[#75716B] font-mono text-sm">
        <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#DE5D35] rounded-full animate-spin mb-4" />
        <p className="tracking-widest uppercase text-[12px] font-bold text-[#1A1816]">
          INITIALIZING BACKPROPAGATION ENGINE
        </p>
      </div>
    ),
  },
);

export default function NeuralNetworksArticlePage() {
  // ─────────────────────────────────────────────────────────────────────────────
  // Section 8: Forward/backward sweep diagram (looped · 9s · CSS keyframes only)
  // ─────────────────────────────────────────────────────────────────────────────
  const nnInputs = [
    { x: 60, y: 80 },
    { x: 60, y: 180 },
  ];
  const nnHidden = [
    { x: 250, y: 50 },
    { x: 250, y: 130 },
    { x: 250, y: 210 },
  ];
  const nnOutput = { x: 400, y: 130 };
  const nnLoss = { x: 487, y: 130 };

  const nnCss = `
    @keyframes nn2Fwd {
      0%        { stroke-dashoffset: 70; opacity: 0; }
      3%        { opacity: 1; }
      20%       { stroke-dashoffset: 0; opacity: 1; }
      32%       { opacity: 0; }
      100%      { stroke-dashoffset: 0; opacity: 0; }
    }
    @keyframes nn2Back {
      0%, 50%   { stroke-dashoffset: 0; opacity: 0; }
      54%       { opacity: 1; }
      72%       { stroke-dashoffset: 70; opacity: 1; }
      80%       { stroke-dashoffset: 70; opacity: 0; }
      100%      { stroke-dashoffset: 70; opacity: 0; }
    }
    @keyframes nn2NodePulse {
      0%, 44%   { stroke: #1A1816; }
      50%, 58%  { stroke: #DE5D35; }
      64%, 100% { stroke: #1A1816; }
    }
    .nn2-fwd  { stroke-dasharray: 10 60; animation: nn2Fwd 9s linear infinite; }
    .nn2-back { stroke-dasharray: 10 60; animation: nn2Back 9s linear infinite; }
    .nn2-node { animation: nn2NodePulse 9s linear infinite; }
  `;

  // ─────────────────────────────────────────────────────────────────────────────
  // Section 2: Weights Sliders (Modulation)
  // ─────────────────────────────────────────────────────────────────────────────
  const [weightW1, setWeightW1] = useState<number>(1.4);
  const [weightW2, setWeightW2] = useState<number>(-0.8);
  const x1Const = 2.0;
  const x2Const = 1.5;
  const weightedSum = useMemo(() => {
    return x1Const * weightW1 + x2Const * weightW2;
  }, [weightW1, weightW2]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Section 3: Activation Functions & Decision Boundary / Slope Simulator
  // (Directly matches MLU-Explain screenshots: Linear, Sigmoid, ReLU, Step, Deep)
  // ─────────────────────────────────────────────────────────────────────────────
  type ActMode = "linear" | "sigmoid" | "relu" | "step" | "deep";
  const [actMode, setActMode] = useState<ActMode>("sigmoid");

  // Interactive sliders for decision boundary / slope
  const [boundaryAngle, setBoundaryAngle] = useState<number>(35); // in degrees
  const [boundaryOffset, setBoundaryOffset] = useState<number>(0); // bias offset
  const [linearSlope, setLinearSlope] = useState<number>(1.1); // for linear regression
  const [linearIntercept, setLinearIntercept] = useState<number>(20);

  // Synthetic 2D dataset points (Two clusters: pink class vs blue class)
  const classificationDots = useMemo(() => {
    return [
      // Pink cluster (upper / left crescent)
      { x: 30, y: 140, cluster: "pink" },
      { x: 45, y: 120, cluster: "pink" },
      { x: 55, y: 100, cluster: "pink" },
      { x: 70, y: 85, cluster: "pink" },
      { x: 90, y: 75, cluster: "pink" },
      { x: 110, y: 70, cluster: "pink" },
      { x: 130, y: 75, cluster: "pink" },
      { x: 145, y: 90, cluster: "pink" },
      { x: 155, y: 115, cluster: "pink" },
      { x: 160, y: 135, cluster: "pink" },
      { x: 75, y: 125, cluster: "pink" },
      { x: 95, y: 110, cluster: "pink" },
      { x: 115, y: 105, cluster: "pink" },

      // Blue cluster (lower / right crescent)
      { x: 80, y: 165, cluster: "blue" },
      { x: 100, y: 175, cluster: "blue" },
      { x: 120, y: 180, cluster: "blue" },
      { x: 140, y: 170, cluster: "blue" },
      { x: 155, y: 155, cluster: "blue" },
      { x: 170, y: 140, cluster: "blue" },
      { x: 180, y: 110, cluster: "blue" },
      { x: 185, y: 80, cluster: "blue" },
      { x: 105, y: 145, cluster: "blue" },
      { x: 125, y: 150, cluster: "blue" },
      { x: 145, y: 140, cluster: "blue" },
      { x: 165, y: 125, cluster: "blue" },
    ];
  }, []);

  // Synthetic Linear Scatter Points
  const scatterDots = useMemo(() => {
    return [
      { x: 20, y: 155 },
      { x: 35, y: 145 },
      { x: 45, y: 135 },
      { x: 60, y: 125 },
      { x: 75, y: 115 },
      { x: 90, y: 100 },
      { x: 105, y: 95 },
      { x: 120, y: 85 },
      { x: 135, y: 70 },
      { x: 150, y: 60 },
      { x: 165, y: 45 },
      { x: 180, y: 35 },
      { x: 50, y: 115 },
      { x: 80, y: 130 },
      { x: 115, y: 110 },
      { x: 145, y: 85 },
      { x: 175, y: 55 },
    ];
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Section 5: Forward pass interactive sliders
  // ─────────────────────────────────────────────────────────────────────────────
  const [inputX1, setInputX1] = useState<number>(0.8);
  const [inputX2, setInputX2] = useState<number>(-0.4);
  const forwardResult = useMemo(() => {
    const w1 = [1.2, -0.6, 0.9];
    const w2 = [-0.8, 1.4, 0.5];
    const h1 = Math.max(0, inputX1 * w1[0] + inputX2 * w2[0]);
    const h2 = Math.max(0, inputX1 * w1[1] + inputX2 * w2[1]);
    const h3 = Math.max(0, inputX1 * w1[2] + inputX2 * w2[2]);
    const out = 1 / (1 + Math.exp(-(h1 * 0.9 + h2 * -1.1 + h3 * 0.7)));
    return { h1, h2, h3, out };
  }, [inputX1, inputX2]);

  // Copy code feedback
  const [copied, setCopied] = useState<boolean>(false);
  const handleCopyCode = () => {
    const code = `import torch
import torch.nn as nn
import torch.optim as optim

class FeedForwardNetwork(nn.Module):
    def __init__(self, input_dim=2, hidden_dim=3, output_dim=1):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        z1 = self.fc1(x)
        a1 = self.relu(z1)
        z2 = self.fc2(a1)
        return self.sigmoid(z2)`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <FoldLayout>
      <div className="min-h-screen bg-[#EFECE6] text-[#1A1816] pt-24 sm:pt-32 pb-32">
        {/* Editorial Article Header */}
        <header className="shell max-w-[860px] mx-auto pt-6 pb-10">
          <div className="mb-8">
            <Link
              href="/resources"
              aria-label="Return to Published Articles Archive"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[2px] bg-[#FAF9F5] border border-[#1A1816] text-[#1A1816] font-mono text-[12px] font-bold tracking-wider uppercase transition-all duration-200 hover:bg-[#1A1816] hover:text-[#FAF9F5] shadow-none focus-visible:outline-2 focus-visible:outline-[#DE5D35] group"
            >
              <span className="text-[#DE5D35] group-hover:text-[#FAF9F5] transition-transform duration-200 group-hover:-translate-x-1 font-bold">
                ←
              </span>
              <span>Back to 03 / Published Articles</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
            <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#75716B]">
              06 / DEEP LEARNING ARCHIVE · BENNETT UNIVERSITY
            </span>
          </div>

          <h1 className="text-[40px] sm:text-[64px] font-black tracking-[-0.035em] text-[#1A1816] uppercase leading-[0.98] mb-4 font-display">
            Neural Networks
          </h1>

          <p className="text-[13px] font-mono text-[#75716B]">
            Jared Wilber & AIS Research Cohort · May 2024 · 12 min read
          </p>
        </header>

        {/* Introductory Paragraphs */}
        <section className="shell max-w-[860px] mx-auto pb-14 space-y-8">
          <div>
            <h2 className="text-[12px] font-mono font-bold tracking-[0.2em] uppercase text-[#1A1816] border-b border-[#1A1816]/15 pb-2 mb-3">
              A VISUAL INTRODUCTION
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.8]">
              Neural networks have revolutionized artificial intelligence and
              are the backbone of popular algorithms today, such as ChatGPT,
              Stable-Diffusion, and many others. In this visual introduction,
              we&apos;ll journey through the fundamentals of feed-forward neural
              networks, starting from their essential components, understanding
              their learning mechanisms, and even getting hands-on experience by
              interacting with one ourselves.
            </p>
          </div>

          <div>
            <h2 className="text-[12px] font-mono font-bold tracking-[0.2em] uppercase text-[#1A1816] border-b border-[#1A1816]/15 pb-2 mb-3">
              WHAT IS A NETWORK?
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.8]">
              Neural networks are networks - that much is clear.{" "}
              <em className="font-serif italic text-[#1A1816]">
                But what is a &ldquo;network&rdquo;?
              </em>{" "}
              A network is a structure consisting of interconnected
              computational nodes, or &apos;neurons&apos;, arranged in layers.
              These nodes perform mathematical operations on input data,
              learning some underlying patterns in the data, before producing
              some output based on those patterns.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ALTERNATING SIDE-BY-SIDE SECTIONS: PARAGRAPHS & GRAPHS                    */}
        {/* ========================================================================= */}
        <div className="shell max-w-[1240px] mx-auto space-y-20 sm:space-y-24">
          {/* SECTION 1: COMPUTATIONAL GRAPHS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-[#1A1816]/15">
            {/* Visual Canvas (Left) */}
            <div className="lg:col-span-7">
              <div
                className="relative rounded-[2px] border border-[#1A1816] p-6 bg-[#FAF9F5]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(26,24,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,22,0.05) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] mb-4 pb-2 border-b border-[#1A1816]/15">
                  <span className="font-bold text-[#1A1816]">
                    FIGURE 01 · COMPUTATIONAL GRAPH
                  </span>
                  <span className="flex items-center gap-1.5 text-[#DE5D35] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35] animate-ping" />
                    FEED-FORWARD TOPOLOGY
                  </span>
                </div>

                <div className="w-full flex items-center justify-center py-6">
                  <svg
                    role="img"
                    aria-label="Feed-forward network topology"
                    viewBox="0 0 460 220"
                    className="w-full h-auto select-none max-w-[420px]"
                  >
                    {/* Flowing Synaptic Wires */}
                    <path
                      d="M 120 60 C 160 60, 170 110, 210 110"
                      fill="none"
                      stroke="#2B6CB0"
                      strokeWidth="2.4"
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />
                    <path
                      d="M 120 160 C 160 160, 170 110, 210 110"
                      fill="none"
                      stroke="#2B6CB0"
                      strokeWidth="2.4"
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />
                    <path
                      d="M 270 110 L 330 110"
                      fill="none"
                      stroke="#316B83"
                      strokeWidth="2.4"
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />

                    <circle cx="195" cy="110" r="4.5" fill="#1A1816" />
                    <circle cx="310" cy="110" r="4.5" fill="#1A1816" />

                    {/* input1 */}
                    <g transform="translate(50, 40)">
                      <rect
                        width="70"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="1.8"
                      />
                      <text
                        x="35"
                        y="25"
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="700"
                        fill="#1A1816"
                      >
                        input₁
                      </text>
                    </g>

                    {/* input2 */}
                    <g transform="translate(50, 140)">
                      <rect
                        width="70"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="1.8"
                      />
                      <text
                        x="35"
                        y="25"
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="700"
                        fill="#1A1816"
                      >
                        input₂
                      </text>
                    </g>

                    {/* function */}
                    <g transform="translate(200, 90)">
                      <rect
                        width="70"
                        height="40"
                        rx="2"
                        fill="#1A1816"
                        stroke="#1A1816"
                        strokeWidth="1.8"
                      />
                      <text
                        x="35"
                        y="25"
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="700"
                        fill="#FAF9F5"
                      >
                        f(x)
                      </text>
                    </g>

                    {/* output */}
                    <g transform="translate(330, 90)">
                      <rect
                        width="70"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#316B83"
                        strokeWidth="2"
                      />
                      <text
                        x="35"
                        y="25"
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="700"
                        fill="#316B83"
                      >
                        output
                      </text>
                    </g>
                  </svg>
                </div>

                <div className="text-[11px] font-mono text-[#75716B] pt-2 border-t border-[#1A1816]/15 flex items-center justify-between">
                  <span>
                    *Input signals propagate forward through the mathematical
                    kernel
                  </span>
                  <span className="text-[#2B6CB0] font-bold">
                    FORWARD GRAPH
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation Paragraphs (Right) */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[#DE5D35] block">
                01 / FOUNDATIONS
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-black uppercase tracking-tight text-[#1A1816] font-display">
                Building Blocks: Computational Graphs
              </h3>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                A computational graph has an input node where data is fed into
                the graph, a function node where the input data is processed,
                and an output node where the result of the computation is
                produced.
              </p>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                As we can see, data flows in one direction, from inputs to
                output, through the graph. These simple directional flows form
                the foundational algebra of every deep learning network.
              </p>
            </div>
          </section>

          {/* SECTION 2: WEIGHTS WITH INTERACTIVE SLIDERS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-[#1A1816]/15">
            {/* Explanation (Left) */}
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[#DE5D35] block">
                02 / PARAMETERS & SLIDERS
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-black uppercase tracking-tight text-[#1A1816] font-display">
                Weights: Scaling Input Signals
              </h3>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                To give the network capacity to learn and adapt, each incoming
                connection wire is parameterized by a real-valued weight (
                <MathTex math="w" />
                ). The function node calculates a weighted sum of inputs:
              </p>
              <div className="bg-[#FAF9F5] border border-[#1A1816]/20 p-2.5 rounded-[2px] font-mono text-[13px] text-center">
                <MathTex math="z = w_1 x_1 + w_2 x_2" />
              </div>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                Weights act like precision volume knobs: positive weights (Steel
                Teal) amplify aligned features, while negative weights
                (Terracotta) dampen contradictory inputs before they reach the
                nucleus.
              </p>
            </div>

            {/* Visual Canvas with SLIDERS (Right) */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div
                className="relative rounded-[2px] border border-[#1A1816] p-6 bg-[#FAF9F5]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(26,24,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,22,0.05) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] mb-4 pb-2 border-b border-[#1A1816]/15">
                  <span className="font-bold text-[#1A1816]">
                    FIGURE 02 · WEIGHT MODULATION
                  </span>
                  <span className="text-[#DE5D35] font-bold font-mono">
                    z = {weightedSum.toFixed(2)}
                  </span>
                </div>

                <div className="w-full flex items-center justify-center py-4">
                  <svg
                    role="img"
                    aria-label="Weighted connections scaling input signals"
                    viewBox="0 0 460 220"
                    className="w-full h-auto select-none max-w-[420px]"
                  >
                    {/* W1 wire colored by sign with flowing dashes */}
                    <path
                      d="M 120 60 C 160 60, 170 110, 210 110"
                      fill="none"
                      stroke={weightW1 >= 0 ? "#2B6CB0" : "#D62839"}
                      strokeWidth={Math.max(
                        1.5,
                        Math.min(3.8, 1.2 + Math.abs(weightW1) * 1.0),
                      )}
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />
                    {/* W2 wire colored by sign with flowing dashes */}
                    <path
                      d="M 120 160 C 160 160, 170 110, 210 110"
                      fill="none"
                      stroke={weightW2 >= 0 ? "#2B6CB0" : "#D62839"}
                      strokeWidth={Math.max(
                        1.5,
                        Math.min(3.8, 1.2 + Math.abs(weightW2) * 1.0),
                      )}
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />
                    <path
                      d="M 270 110 L 330 110"
                      fill="none"
                      stroke="#316B83"
                      strokeWidth="2.4"
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />

                    {/* Weight Badges on Wires */}
                    <rect
                      x="142"
                      y="64"
                      width="58"
                      height="22"
                      rx="2"
                      fill={weightW1 >= 0 ? "#2B6CB0" : "#D62839"}
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <text
                      x="171"
                      y="79"
                      fill="#FAF9F5"
                      fontSize="10"
                      fontFamily="var(--font-mono, monospace)"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      w₁={weightW1.toFixed(1)}
                    </text>

                    <rect
                      x="142"
                      y="134"
                      width="58"
                      height="22"
                      rx="2"
                      fill={weightW2 >= 0 ? "#2B6CB0" : "#D62839"}
                      stroke="#1A1816"
                      strokeWidth="1"
                    />
                    <text
                      x="171"
                      y="149"
                      fill="#FAF9F5"
                      fontSize="10"
                      fontFamily="var(--font-mono, monospace)"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      w₂={weightW2.toFixed(1)}
                    </text>

                    {/* Inputs */}
                    <g transform="translate(50, 40)">
                      <rect
                        width="70"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="1.8"
                      />
                      <text
                        x="35"
                        y="25"
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        x₁ = {x1Const.toFixed(1)}
                      </text>
                    </g>

                    <g transform="translate(50, 140)">
                      <rect
                        width="70"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="1.8"
                      />
                      <text
                        x="35"
                        y="25"
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        x₂ = {x2Const.toFixed(1)}
                      </text>
                    </g>

                    {/* Summation Node */}
                    <g transform="translate(200, 90)">
                      <rect
                        width="70"
                        height="40"
                        rx="2"
                        fill="#1A1816"
                        stroke="#1A1816"
                        strokeWidth="1.8"
                      />
                      <text
                        x="35"
                        y="25"
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="bold"
                        fill="#FAF9F5"
                      >
                        ∑(w·x)
                      </text>
                    </g>

                    {/* Output */}
                    <g transform="translate(330, 90)">
                      <rect
                        width="70"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#316B83"
                        strokeWidth="2"
                      />
                      <text
                        x="35"
                        y="25"
                        textAnchor="middle"
                        fontSize="11"
                        fontFamily="var(--font-mono, monospace)"
                        fontWeight="bold"
                        fill="#316B83"
                      >
                        z={weightedSum.toFixed(2)}
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Sliders for w1 and w2 */}
                <div className="bg-[#FAF9F5] p-4 rounded-[2px] border border-[#1A1816]/15 grid grid-cols-2 gap-4 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Weight w₁:</span>
                      <span
                        className={`font-bold ${weightW1 >= 0 ? "text-[#2B6CB0]" : "text-[#D62839]"}`}
                      >
                        {weightW1.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="3.0"
                      step="0.1"
                      value={weightW1}
                      onChange={(e) => setWeightW1(parseFloat(e.target.value))}
                      className="w-full accent-[#1A1816] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Weight w₂:</span>
                      <span
                        className={`font-bold ${weightW2 >= 0 ? "text-[#2B6CB0]" : "text-[#D62839]"}`}
                      >
                        {weightW2.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="3.0"
                      step="0.1"
                      value={weightW2}
                      onChange={(e) => setWeightW2(parseFloat(e.target.value))}
                      className="w-full accent-[#1A1816] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: ACTIVATION FUNCTIONS & HOW THEY SHAPE DECISION BOUNDARIES      */}
          {/* (Exact match to User's Uploaded Screenshots 1, 2, 3, 4!)                  */}
          {/* ========================================================================= */}
          <section className="pt-10 border-t border-[#1A1816]/15">
            {/* User Requested Header Narrative */}
            <div className="max-w-[860px] mx-auto mb-10 space-y-4">
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[#DE5D35] block">
                03 / LAYERS OF COMPUTATION
              </span>
              <h3 className="text-[28px] sm:text-[36px] font-black uppercase tracking-tight text-[#1A1816] font-display">
                Activation Functions
              </h3>
              <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.8]">
                As you can see, neural networks are not so complicated! They are
                just computational graphs, channeling inputs through successive
                layers of computation to generate outputs. This process of
                inference, whereby inputs are fed through the network to produce
                output predictions, is called the{" "}
                <strong className="text-[#1A1816] font-bold">
                  forward pass
                </strong>
                . Let&apos;s talk more about those layers of computation, the
                activation functions.
              </p>
              <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.8]">
                Activation functions are at the heart of artificial neurons in a
                neural network. These crucial components introduce non-linearity
                into the model, transforming the weighted inputs to generate an
                output. Simply put, an activation function decides how much
                signal to pass onto the next layer based on the input it
                receives. This idea of chaining many weighted signals together
                is what allows neural networks to learn very complex
                relationships.
              </p>
              <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.8]">
                The non-linear nature of these functions is essential for neural
                networks to learn from complex data. If we only used linear
                activation functions, no matter how many layers we stacked, the
                network would behave just like a single-layer perceptron because
                the composition of linear functions is still a linear function.
                Non-linear activation functions enable the network to learn
                complex patterns and solve intricate problems by adding layers
                of abstraction.
              </p>
            </div>

            {/* MASTER INTERACTIVE DECISION BOUNDARY & REGRESSION SIMULATOR (Screenshots 1-4) */}
            <div className="rounded-[2px] border border-[#1A1816] p-6 sm:p-8 bg-[#FAF9F5] mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A1816]/10 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#DE5D35] uppercase block">
                    LIVE COMPUTATIONAL GRAPH & FEATURE SPACE SIMULATOR
                  </span>
                  <h4 className="text-[20px] font-bold text-[#1A1816] mt-0.5">
                    Select Activation Function & Watch The Output Feature Space
                    Change
                  </h4>
                </div>

                {/* Mode Selector Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "sigmoid", label: "Sigmoid" },
                      { id: "linear", label: "Linear" },
                      { id: "step", label: "Step Function" },
                      { id: "relu", label: "ReLU" },
                      { id: "deep", label: "Deep MLP (No Limits)" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActMode(m.id)}
                      className={`px-3 py-1.5 rounded-[2px] text-[11px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                        actMode === m.id
                          ? "bg-[#1A1816] text-[#FAF9F5]"
                          : "bg-transparent text-[#75716B] border border-[#1A1816]/15 hover:text-[#1A1816]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Visual Diagram Area (Blueprint Grid with Nodes & Output Feature Space Box) */}
              <div
                className="relative rounded-[2px] border border-[#1A1816] p-6 bg-[#FAF9F5] overflow-hidden"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(26,24,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,22,0.05) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                {/* Figure Title and Status Indicator */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] mb-3 pb-2 border-b border-[#1A1816]/15">
                  <span className="font-bold text-[#1A1816]">
                    FIGURE 03 · ACTIVATION FUNCTION SPACES
                  </span>
                  <span className="flex items-center gap-1.5 text-[#DE5D35] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#DE5D35] animate-ping" />
                    MODE: {actMode.toUpperCase()}
                  </span>
                </div>

                {/* Header Labels (input layer / hidden layers / output layer) */}
                <div className="flex items-center text-[10px] font-mono font-bold tracking-widest uppercase mb-4 pb-2 border-b border-[#1A1816]/10">
                  <span className="w-1/4 text-[#75716B]">INPUT SENSORS</span>
                  <span className="w-1/2 text-center text-[#DE5D35]">
                    {actMode === "deep"
                      ? "HIDDEN LAYERS (DEEP MLP)"
                      : actMode === "step"
                        ? "HIDDEN STAGES (MULTI-STEP)"
                        : "COMPUTATION OPERATOR"}
                  </span>
                  <span className="w-1/4 text-right text-[#2B6CB0]">
                    OUTPUT SPACE (ŷ)
                  </span>
                </div>

                {/* SVG Graph + 2D Decision Feature Space Output */}
                <div className="w-full flex items-center justify-center py-2">
                  <svg
                    role="img"
                    aria-label="Network from input sensors to a 2D decision output"
                    viewBox="0 0 540 260"
                    className="w-full h-auto select-none max-w-[560px]"
                  >
                    {/* INPUT NODES X1 and X2 (All modes) */}
                    <g transform="translate(20, 60)">
                      <rect
                        width="65"
                        height="42"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="2"
                      />
                      <text
                        x="32"
                        y="26"
                        textAnchor="middle"
                        fontSize="13"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        X₁
                      </text>
                    </g>
                    <g transform="translate(20, 160)">
                      <rect
                        width="65"
                        height="42"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="2"
                      />
                      <text
                        x="32"
                        y="26"
                        textAnchor="middle"
                        fontSize="13"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        X₂
                      </text>
                    </g>

                    {/* Joint dots on input exits */}
                    <circle cx="95" cy="81" r="4.5" fill="#1A1816" />
                    <circle cx="95" cy="181" r="4.5" fill="#1A1816" />

                    {/* ======================================================= */}
                    {/* MODE 1: SIGMOID                                         */}
                    {/* ======================================================= */}
                    {actMode === "sigmoid" && (
                      <g className="transition-all duration-300">
                        {/* Wires */}
                        <path
                          d="M 95 81 L 180 130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                        <path
                          d="M 95 181 L 180 130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                        <g transform="translate(130, 92)">
                          <rect
                            width="16"
                            height="14"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="8"
                            y="10"
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fill="#1A1816"
                            fontWeight="bold"
                          >
                            w
                          </text>
                        </g>
                        <g transform="translate(130, 155)">
                          <rect
                            width="16"
                            height="14"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="8"
                            y="10"
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fill="#1A1816"
                            fontWeight="bold"
                          >
                            w
                          </text>
                        </g>

                        <line
                          x1="250"
                          y1="130"
                          x2="330"
                          y2="130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />

                        {/* Sigmoid Node with S-curve inside */}
                        <g transform="translate(180, 105)">
                          <rect
                            width="70"
                            height="50"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <path
                            d="M 12 36 Q 28 36, 35 25 Q 42 14, 58 14"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <text
                            x="35"
                            y="45"
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            SIGMOID
                          </text>
                        </g>

                        {/* Output Box y: 2D DECISION BOUNDARY */}
                        <g transform="translate(330, 45)">
                          <rect
                            width="180"
                            height="170"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <rect
                            width="180"
                            height="170"
                            fill="rgba(43, 108, 176, 0.12)"
                          />

                          {/* Smooth Decision Boundary dividing terracotta vs teal */}
                          {(() => {
                            const rad = (boundaryAngle * Math.PI) / 180;
                            const yMid = 85 + boundaryOffset;
                            const dy = 90 * Math.sin(rad);
                            const p1x = 0;
                            const p1y = Math.max(0, Math.min(170, yMid - dy));
                            const p2x = 180;
                            const p2y = Math.max(0, Math.min(170, yMid + dy));
                            return (
                              <>
                                <path
                                  d={`M 0 170 L ${p1x} ${p1y} C 60 ${p1y - 15}, 120 ${p2y + 15}, ${p2x} ${p2y} L 180 170 Z`}
                                  fill="rgba(222, 93, 53, 0.18)"
                                />
                                <path
                                  d={`M ${p1x} ${p1y} C 60 ${p1y - 15}, 120 ${p2y + 15}, ${p2x} ${p2y}`}
                                  fill="none"
                                  stroke="#DE5D35"
                                  strokeWidth="2"
                                  strokeDasharray="4 2"
                                />
                              </>
                            );
                          })()}

                          {/* Data points */}
                          {classificationDots.map((pt, i) => (
                            <circle
                              key={i}
                              cx={(pt.x / 200) * 180}
                              cy={(pt.y / 200) * 170}
                              r="4.5"
                              fill={
                                pt.cluster === "pink" ? "#DE5D35" : "#2B6CB0"
                              }
                              stroke="#FAF9F5"
                              strokeWidth="1.5"
                            />
                          ))}
                          <rect
                            x="75"
                            y="152"
                            width="30"
                            height="15"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="90"
                            y="163"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            y
                          </text>
                        </g>
                      </g>
                    )}

                    {/* ======================================================= */}
                    {/* MODE 2: LINEAR                                          */}
                    {/* ======================================================= */}
                    {actMode === "linear" && (
                      <g className="transition-all duration-300">
                        <path
                          d="M 95 81 L 180 130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                        <path
                          d="M 95 181 L 180 130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                        <g transform="translate(130, 92)">
                          <rect
                            width="16"
                            height="14"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="8"
                            y="10"
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fill="#1A1816"
                            fontWeight="bold"
                          >
                            w
                          </text>
                        </g>
                        <g transform="translate(130, 155)">
                          <rect
                            width="16"
                            height="14"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="8"
                            y="10"
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fill="#1A1816"
                            fontWeight="bold"
                          >
                            w
                          </text>
                        </g>

                        <circle cx="260" cy="130" r="4.5" fill="#1A1816" />
                        <line
                          x1="260"
                          y1="130"
                          x2="330"
                          y2="130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />

                        {/* Linear Node with straight diagonal line inside */}
                        <g transform="translate(180, 105)">
                          <rect
                            width="70"
                            height="50"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <line
                            x1="12"
                            y1="38"
                            x2="58"
                            y2="12"
                            stroke="#DE5D35"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <text
                            x="35"
                            y="45"
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            LINEAR
                          </text>
                        </g>

                        {/* Output Box y: SCATTER PLOT & REGRESSION LINE */}
                        <g transform="translate(330, 45)">
                          <rect
                            width="180"
                            height="170"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />

                          {/* Grid references */}
                          <line
                            x1="0"
                            y1="85"
                            x2="180"
                            y2="85"
                            stroke="#1A1816"
                            strokeWidth="0.5"
                            strokeDasharray="3 3"
                            opacity="0.2"
                          />
                          <line
                            x1="90"
                            y1="0"
                            x2="90"
                            y2="170"
                            stroke="#1A1816"
                            strokeWidth="0.5"
                            strokeDasharray="3 3"
                            opacity="0.2"
                          />

                          {/* Scatter Dots */}
                          {scatterDots.map((pt, i) => (
                            <circle
                              key={i}
                              cx={(pt.x / 200) * 180}
                              cy={(pt.y / 200) * 170}
                              r="4"
                              fill="#2B6CB0"
                              stroke="#FAF9F5"
                              strokeWidth="1.5"
                            />
                          ))}

                          {/* Linear Fit Line */}
                          {(() => {
                            const yStart = 170 - (linearIntercept / 100) * 170;
                            const yEnd =
                              170 -
                              ((linearSlope * 150 + linearIntercept) / 100) *
                                170;
                            return (
                              <line
                                x1="0"
                                y1={yStart}
                                x2="180"
                                y2={yEnd}
                                stroke="#DE5D35"
                                strokeWidth="2.5"
                                strokeLinecap="square"
                              />
                            );
                          })()}
                          <rect
                            x="75"
                            y="152"
                            width="30"
                            height="15"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="90"
                            y="163"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            y
                          </text>
                        </g>
                      </g>
                    )}

                    {/* ======================================================= */}
                    {/* MODE 3: STEP FUNCTION                                   */}
                    {/* ======================================================= */}
                    {actMode === "step" && (
                      <g className="transition-all duration-300">
                        <path
                          d="M 95 81 L 140 130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                        <path
                          d="M 95 181 L 140 130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                        <g transform="translate(110, 95)">
                          <rect
                            width="14"
                            height="12"
                            rx="1"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="0.8"
                          />
                          <text
                            x="7"
                            y="9"
                            textAnchor="middle"
                            fontSize="8"
                            fontFamily="monospace"
                            fill="#1A1816"
                            fontWeight="bold"
                          >
                            w
                          </text>
                        </g>
                        <g transform="translate(110, 155)">
                          <rect
                            width="14"
                            height="12"
                            rx="1"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="0.8"
                          />
                          <text
                            x="7"
                            y="9"
                            textAnchor="middle"
                            fontSize="8"
                            fontFamily="monospace"
                            fill="#1A1816"
                            fontWeight="bold"
                          >
                            w
                          </text>
                        </g>

                        {/* Step Node 1 */}
                        <g transform="translate(140, 105)">
                          <rect
                            width="50"
                            height="48"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <path
                            d="M 8 36 L 25 36 L 25 12 L 42 12"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2"
                          />
                          <text
                            x="25"
                            y="44"
                            textAnchor="middle"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            STEP
                          </text>
                        </g>

                        <line
                          x1="190"
                          y1="130"
                          x2="225"
                          y2="130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />

                        {/* Step Node 2 */}
                        <g transform="translate(225, 105)">
                          <rect
                            width="50"
                            height="48"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <path
                            d="M 8 36 L 25 36 L 25 12 L 42 12"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2"
                          />
                          <text
                            x="25"
                            y="44"
                            textAnchor="middle"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            STEP
                          </text>
                        </g>

                        <circle cx="290" cy="130" r="4.5" fill="#1A1816" />
                        <line
                          x1="290"
                          y1="130"
                          x2="330"
                          y2="130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />

                        {/* Output Box y: RIGHT-ANGLED STEP DECISION BOUNDARY */}
                        <g transform="translate(330, 45)">
                          <rect
                            width="180"
                            height="170"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <rect
                            width="180"
                            height="170"
                            fill="rgba(222, 93, 53, 0.18)"
                          />
                          <rect
                            x={70 + boundaryOffset * 0.5}
                            y={70 + boundaryOffset * 0.5}
                            width="110"
                            height="100"
                            fill="rgba(43, 108, 176, 0.14)"
                            stroke="#DE5D35"
                            strokeWidth="1.5"
                          />

                          {classificationDots.map((pt, i) => (
                            <circle
                              key={i}
                              cx={(pt.x / 200) * 180}
                              cy={(pt.y / 200) * 170}
                              r="4.5"
                              fill={
                                pt.cluster === "pink" ? "#DE5D35" : "#2B6CB0"
                              }
                              stroke="#FAF9F5"
                              strokeWidth="1.5"
                            />
                          ))}
                          <rect
                            x="75"
                            y="152"
                            width="30"
                            height="15"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="90"
                            y="163"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            y
                          </text>
                        </g>
                      </g>
                    )}

                    {/* ======================================================= */}
                    {/* MODE 4: RELU                                            */}
                    {/* ======================================================= */}
                    {actMode === "relu" && (
                      <g className="transition-all duration-300">
                        <path
                          d="M 95 81 L 180 130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                        <path
                          d="M 95 181 L 180 130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                        <circle cx="260" cy="130" r="4.5" fill="#1A1816" />
                        <line
                          x1="260"
                          y1="130"
                          x2="330"
                          y2="130"
                          stroke="#2B6CB0"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />

                        {/* ReLU Node with hinge curve inside */}
                        <g transform="translate(180, 105)">
                          <rect
                            width="70"
                            height="50"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <path
                            d="M 12 36 L 35 36 L 58 12"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <text
                            x="35"
                            y="45"
                            textAnchor="middle"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            RELU
                          </text>
                        </g>

                        {/* Output Box y: HINGE / BENT LINE BOUNDARY */}
                        <g transform="translate(330, 45)">
                          <rect
                            width="180"
                            height="170"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <rect
                            width="180"
                            height="170"
                            fill="rgba(43, 108, 176, 0.12)"
                          />
                          <path
                            d={`M 0 170 L 0 ${110 + boundaryOffset * 0.4} L ${90 + boundaryOffset * 0.3} 95 L 180 ${130 - boundaryAngle * 0.5} L 180 170 Z`}
                            fill="rgba(222, 93, 53, 0.18)"
                          />
                          <path
                            d={`M 0 ${110 + boundaryOffset * 0.4} L ${90 + boundaryOffset * 0.3} 95 L 180 ${130 - boundaryAngle * 0.5}`}
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2"
                          />

                          {classificationDots.map((pt, i) => (
                            <circle
                              key={i}
                              cx={(pt.x / 200) * 180}
                              cy={(pt.y / 200) * 170}
                              r="4.5"
                              fill={
                                pt.cluster === "pink" ? "#DE5D35" : "#2B6CB0"
                              }
                              stroke="#FAF9F5"
                              strokeWidth="1.5"
                            />
                          ))}
                          <rect
                            x="75"
                            y="152"
                            width="30"
                            height="15"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="90"
                            y="163"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            y
                          </text>
                        </g>
                      </g>
                    )}

                    {/* ======================================================= */}
                    {/* MODE 5: DEEP MLP                                        */}
                    {/* ======================================================= */}
                    {actMode === "deep" && (
                      <g className="transition-all duration-300">
                        {/* Synapses X -> Hidden Layer 1 (3 nodes) */}
                        {[81, 181].map((yIn, iIdx) =>
                          [55, 120, 185].map((yH, hIdx) => (
                            <line
                              key={`s1-${iIdx}-${hIdx}`}
                              x1="95"
                              y1={yIn}
                              x2="140"
                              y2={yH}
                              stroke="#2B6CB0"
                              strokeWidth="1.5"
                              strokeDasharray="5 3"
                              className="animate-dash-forward"
                            />
                          )),
                        )}

                        {/* Hidden Layer 1: 3 ReLU nodes */}
                        {[55, 120, 185].map((yH, idx) => (
                          <g key={idx} transform={`translate(140, ${yH - 22})`}>
                            <rect
                              width="45"
                              height="40"
                              rx="2"
                              fill="#FAF9F5"
                              stroke="#1A1816"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M 8 28 L 22 28 L 38 10"
                              fill="none"
                              stroke="#DE5D35"
                              strokeWidth="1.8"
                            />
                            <text
                              x="22"
                              y="36"
                              textAnchor="middle"
                              fontSize="7.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                              fill="#1A1816"
                            >
                              RELU
                            </text>
                          </g>
                        ))}

                        {/* Synapses Hidden Layer 1 -> Hidden Layer 2 (2 nodes) */}
                        {[55, 120, 185].map((yH1, h1Idx) =>
                          [85, 160].map((yH2, h2Idx) => (
                            <line
                              key={`s2-${h1Idx}-${h2Idx}`}
                              x1="185"
                              y1={yH1}
                              x2="235"
                              y2={yH2}
                              stroke="#2B6CB0"
                              strokeWidth="1.5"
                              strokeDasharray="5 3"
                              className="animate-dash-forward"
                            />
                          )),
                        )}

                        {/* Joints between layers */}
                        <circle cx="210" cy="70" r="3.5" fill="#1A1816" />
                        <circle cx="210" cy="120" r="3.5" fill="#1A1816" />
                        <circle cx="210" cy="170" r="3.5" fill="#1A1816" />

                        {/* Hidden Layer 2: 2 Sigmoid nodes */}
                        {[85, 160].map((yH, idx) => (
                          <g key={idx} transform={`translate(235, ${yH - 22})`}>
                            <rect
                              width="46"
                              height="40"
                              rx="2"
                              fill="#FAF9F5"
                              stroke="#1A1816"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M 8 28 Q 18 28, 23 20 Q 28 12, 38 12"
                              fill="none"
                              stroke="#DE5D35"
                              strokeWidth="1.8"
                            />
                            <text
                              x="23"
                              y="36"
                              textAnchor="middle"
                              fontSize="7.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                              fill="#1A1816"
                            >
                              SIGMOID
                            </text>
                          </g>
                        ))}

                        {/* Synapses to Output Box */}
                        <circle cx="300" cy="120" r="4.5" fill="#1A1816" />
                        <line
                          x1="281"
                          y1="85"
                          x2="330"
                          y2="105"
                          stroke="#316B83"
                          strokeWidth="1.8"
                          strokeDasharray="5 3"
                          className="animate-dash-forward"
                        />
                        <line
                          x1="281"
                          y1="160"
                          x2="330"
                          y2="145"
                          stroke="#316B83"
                          strokeWidth="1.8"
                          strokeDasharray="5 3"
                          className="animate-dash-forward"
                        />

                        {/* Output Box y: COMPLEX CURVED NON-LINEAR MOONS */}
                        <g transform="translate(330, 45)">
                          <rect
                            width="180"
                            height="170"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="2"
                          />
                          <rect
                            width="180"
                            height="170"
                            fill="rgba(43, 108, 176, 0.12)"
                          />

                          {/* Intricate Multi-Layer Contour Boundary */}
                          <path
                            d={`M 0 0 L 180 0 L 180 120 C 130 110, 120 70, 70 85 C 40 95, 20 130, 0 140 Z`}
                            fill="rgba(222, 93, 53, 0.18)"
                          />
                          <path
                            d={`M 180 120 C 130 110, 120 70, 70 85 C 40 95, 20 130, 0 140`}
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2"
                          />

                          {classificationDots.map((pt, i) => (
                            <circle
                              key={i}
                              cx={(pt.x / 200) * 180}
                              cy={(pt.y / 200) * 170}
                              r="4.5"
                              fill={
                                pt.cluster === "pink" ? "#DE5D35" : "#2B6CB0"
                              }
                              stroke="#FAF9F5"
                              strokeWidth="1.5"
                            />
                          ))}
                          <rect
                            x="75"
                            y="152"
                            width="30"
                            height="15"
                            rx="2"
                            fill="#FAF9F5"
                            stroke="#1A1816"
                            strokeWidth="1"
                          />
                          <text
                            x="90"
                            y="163"
                            textAnchor="middle"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1816"
                          >
                            y
                          </text>
                        </g>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Interactive Sliders modifying Decision Boundary / Slope */}
                <div className="mt-4 pt-4 border-t border-[#1A1816]/15 bg-[#FAF9F5] p-4 rounded-[2px] border border-[#1A1816]/15">
                  <span className="text-[11px] font-mono font-bold text-[#1A1816] block mb-2">
                    Adjust Boundary Parameters in Feature Space:
                  </span>

                  {actMode === "linear" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-mono">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Regression Slope (m):</span>
                          <span className="font-bold text-[#DE5D35]">
                            {linearSlope.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="2.2"
                          step="0.05"
                          value={linearSlope}
                          onChange={(e) =>
                            setLinearSlope(parseFloat(e.target.value))
                          }
                          className="w-full accent-[#1A1816] cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Y-Intercept (b):</span>
                          <span className="font-bold text-[#DE5D35]">
                            {linearIntercept.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-20"
                          max="60"
                          step="1"
                          value={linearIntercept}
                          onChange={(e) =>
                            setLinearIntercept(parseFloat(e.target.value))
                          }
                          className="w-full accent-[#1A1816] cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-mono">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Decision Boundary Angle / Tilt:</span>
                          <span className="font-bold text-[#DE5D35]">
                            {boundaryAngle}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="80"
                          step="2"
                          value={boundaryAngle}
                          onChange={(e) =>
                            setBoundaryAngle(parseFloat(e.target.value))
                          }
                          className="w-full accent-[#1A1816] cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Decision Threshold / Bias Offset:</span>
                          <span className="font-bold text-[#DE5D35]">
                            {boundaryOffset}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-45"
                          max="45"
                          step="2"
                          value={boundaryOffset}
                          onChange={(e) =>
                            setBoundaryOffset(parseFloat(e.target.value))
                          }
                          className="w-full accent-[#1A1816] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* ACTIVATION FUNCTIONS COMPARISON TABLE (Rendered with KaTeX!)              */}
            {/* ========================================================================= */}
            <div className="max-w-[860px] mx-auto mt-12 space-y-6">
              <h4 className="text-[18px] font-mono font-bold uppercase tracking-wider text-[#1A1816] border-b border-[#1A1816]/15 pb-2">
                Four Popular Activation Functions
              </h4>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                There&apos;s a diverse range of activation functions utilized in
                neural networks, each with its unique benefits and applications.
                Here are four foundational activation functions:
              </p>

              {/* Table */}
              <div className="border border-[#1A1816]/20 rounded-[2px] overflow-x-auto bg-[#FAF9F5]">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#1A1816]/20 bg-[#F4F1EA] text-[11px] font-mono uppercase text-[#1A1816]">
                      <th className="p-3.5 font-bold">Name</th>
                      <th className="p-3.5 font-bold">Plot</th>
                      <th className="p-3.5 font-bold">Mathematical Function</th>
                      <th className="p-3.5 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1816]/10 font-mono">
                    {/* Sigmoid */}
                    <tr className="hover:bg-white/50 transition-colors">
                      <td className="p-3.5 font-bold text-[#1A1816]">
                        Sigmoid (logistic)
                      </td>
                      <td className="p-3.5">
                        <svg
                          aria-hidden="true"
                          width="60"
                          height="32"
                          viewBox="0 0 60 32"
                          className="stroke-[#1A1816]"
                        >
                          <line
                            x1="5"
                            y1="28"
                            x2="55"
                            y2="28"
                            stroke="#D9D6CF"
                            strokeWidth="1"
                          />
                          <path
                            d="M 8 26 Q 25 26, 30 16 Q 35 6, 52 6"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2.2"
                          />
                        </svg>
                      </td>
                      <td className="p-3.5">
                        <MathTex math="f(x) = \frac{1}{1 + e^{-x}}" />
                      </td>
                      <td className="p-3.5 text-[#475569] font-sans text-[12px]">
                        Squashes input into calibrated range{" "}
                        <MathTex math="(0, 1)" />.
                      </td>
                    </tr>

                    {/* Tanh */}
                    <tr className="hover:bg-white/50 transition-colors">
                      <td className="p-3.5 font-bold text-[#1A1816]">
                        Hyperbolic Tangent (tanh)
                      </td>
                      <td className="p-3.5">
                        <svg
                          aria-hidden="true"
                          width="60"
                          height="32"
                          viewBox="0 0 60 32"
                          className="stroke-[#1A1816]"
                        >
                          <line
                            x1="5"
                            y1="16"
                            x2="55"
                            y2="16"
                            stroke="#D9D6CF"
                            strokeWidth="1"
                          />
                          <path
                            d="M 8 28 Q 24 28, 30 16 Q 36 4, 52 4"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2.2"
                          />
                        </svg>
                      </td>
                      <td className="p-3.5">
                        <MathTex math="f(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}" />
                      </td>
                      <td className="p-3.5 text-[#475569] font-sans text-[12px]">
                        Zero-centered output squashed into{" "}
                        <MathTex math="(-1, 1)" />.
                      </td>
                    </tr>

                    {/* ReLU */}
                    <tr className="hover:bg-white/50 transition-colors">
                      <td className="p-3.5 font-bold text-[#1A1816]">
                        Rectified Linear Unit (ReLU)
                      </td>
                      <td className="p-3.5">
                        <svg
                          aria-hidden="true"
                          width="60"
                          height="32"
                          viewBox="0 0 60 32"
                          className="stroke-[#1A1816]"
                        >
                          <line
                            x1="5"
                            y1="26"
                            x2="55"
                            y2="26"
                            stroke="#D9D6CF"
                            strokeWidth="1"
                          />
                          <path
                            d="M 8 26 L 30 26 L 52 6"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2.2"
                          />
                        </svg>
                      </td>
                      <td className="p-3.5">
                        <MathTex math="f(x) = \begin{cases} 0 & \text{if } x < 0 \\ x & \text{if } x \ge 0 \end{cases}" />
                      </td>
                      <td className="p-3.5 text-[#475569] font-sans text-[12px]">
                        Only keeps positive values; fast and prevents
                        saturation.
                      </td>
                    </tr>

                    {/* Step Function */}
                    <tr className="hover:bg-white/50 transition-colors">
                      <td className="p-3.5 font-bold text-[#1A1816]">
                        Step Function (Perceptron)
                      </td>
                      <td className="p-3.5">
                        <svg
                          aria-hidden="true"
                          width="60"
                          height="32"
                          viewBox="0 0 60 32"
                          className="stroke-[#1A1816]"
                        >
                          <line
                            x1="5"
                            y1="16"
                            x2="55"
                            y2="16"
                            stroke="#D9D6CF"
                            strokeWidth="1"
                          />
                          <path
                            d="M 8 26 L 30 26 L 30 6 L 52 6"
                            fill="none"
                            stroke="#DE5D35"
                            strokeWidth="2.2"
                          />
                        </svg>
                      </td>
                      <td className="p-3.5">
                        <MathTex math="f(x) = \begin{cases} +1 & \text{if } x \ge 0 \\ -1 & \text{if } x < 0 \end{cases}" />
                      </td>
                      <td className="p-3.5 text-[#475569] font-sans text-[12px]">
                        Binary step: neuron fires (<MathTex math="+1" />) or
                        remains silent (<MathTex math="-1" />
                        ).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Detailed Narrative Insights */}
              <div className="space-y-4 text-[15px] sm:text-[16px] text-[#475569] leading-[1.8] pt-4">
                <p>
                  The{" "}
                  <strong className="text-[#1A1816]">
                    sigmoid (or logistic)
                  </strong>{" "}
                  function, which ranges from 0 to 1, is particularly useful in
                  the output layer of binary classification models, representing
                  the probability of a binary event. However, it can suffer from
                  the vanishing gradients problem during backpropagation.
                </p>
                <p>
                  The{" "}
                  <strong className="text-[#1A1816]">
                    hyperbolic tangent (tanh)
                  </strong>{" "}
                  function, which ranges from -1 to 1, provides a zero-centered
                  output designed to make learning for the next layer easier.
                  Yet, like sigmoid, it also faces vanishing gradients at
                  extreme values.
                </p>
                <p>
                  The{" "}
                  <strong className="text-[#1A1816]">
                    Rectified Linear Unit (ReLU)
                  </strong>{" "}
                  function is the ubiquitous choice in hidden layers due to
                  computational efficiency and gradient propagation. It
                  activates a node linearly if its input is positive; otherwise,
                  it outputs zero.
                </p>
                <p>
                  Despite their simplicity, chaining these functions together in
                  a neural network yields powerful geometric representations.
                  The best choice depends on data distributions, computational
                  constraints, and network depth.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: MULTI-LAYER PERCEPTRON IN A CONTINUOUS LOOP */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-[#1A1816]/15">
            {/* Explanation (Left) */}
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[#DE5D35] block">
                04 / TOPOLOGY & LOOPING SIGNALS
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-black uppercase tracking-tight text-[#1A1816] font-display">
                Multi-Layer Perceptron (MLP)
              </h3>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                We expand the network by stacking intermediate
                &apos;hidden&apos; layers between input sensors and output
                classifiers. Each hidden neuron becomes a specialized feature
                detector.
              </p>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                Notice the continuous transmission wave running in an infinite
                loop on the canvas: signals propagate rhythmically across the
                bipartite synaptic mesh, progressively assembling low-level
                edges into high-level concepts.
              </p>
            </div>

            {/* Visual Canvas with LOOPING ANIMATION (Right) */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div
                className="relative rounded-[2px] border border-[#1A1816] p-6 bg-[#FAF9F5]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(26,24,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,22,0.05) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] mb-4 pb-2 border-b border-[#1A1816]/15">
                  <span className="font-bold text-[#1A1816]">
                    FIGURE 04 · BIPARTITE SYNAPSE MESH
                  </span>
                  <span className="flex items-center gap-1.5 text-[#DE5D35] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#DE5D35] animate-ping" />
                    LIVE SIGNAL LOOP
                  </span>
                </div>

                <div className="w-full flex items-center justify-center py-4">
                  <svg
                    role="img"
                    aria-label="Multi-layer perceptron with signals flowing through its layers"
                    viewBox="0 0 460 260"
                    className="w-full h-auto select-none max-w-[440px]"
                  >
                    {[65, 175].map((yIn, iIdx) =>
                      [45, 120, 195].map((yH, hIdx) => (
                        <line
                          key={`syn-${iIdx}-${hIdx}`}
                          x1="83"
                          y1={yIn}
                          x2="215"
                          y2={yH}
                          stroke="#2B6CB0"
                          strokeWidth="1.8"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                      )),
                    )}

                    {[45, 120, 195].map((yH, hIdx) => (
                      <line
                        key={`syn-out-${hIdx}`}
                        x1="255"
                        y1={yH}
                        x2="363"
                        y2={120}
                        stroke="#DE5D35"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="animate-dash-forward"
                      />
                    ))}

                    <circle
                      cx="65"
                      cy="65"
                      r="18"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="65"
                      y="69"
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1A1816"
                    >
                      x₁
                    </text>

                    <circle
                      cx="65"
                      cy="175"
                      r="18"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="65"
                      y="179"
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1A1816"
                    >
                      x₂
                    </text>

                    {[45, 120, 195].map((yH, idx) => (
                      <g key={idx}>
                        <circle
                          cx="235"
                          cy={yH}
                          r="20"
                          fill="#FAF9F5"
                          stroke="#1A1816"
                          strokeWidth="2"
                        />
                        <text
                          x="235"
                          y={yH + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill="#1A1816"
                        >
                          h{idx + 1}
                        </text>
                      </g>
                    ))}

                    <circle
                      cx="385"
                      cy="120"
                      r="22"
                      fill="#1A1816"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="385"
                      y="124"
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#FAF9F5"
                    >
                      ŷ
                    </text>

                    <text
                      x="65"
                      y="240"
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#75716B"
                      fontWeight="bold"
                    >
                      INPUT
                    </text>
                    <text
                      x="235"
                      y="240"
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#75716B"
                      fontWeight="bold"
                    >
                      HIDDEN LAYER
                    </text>
                    <text
                      x="385"
                      y="240"
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="#75716B"
                      fontWeight="bold"
                    >
                      OUTPUT
                    </text>
                  </svg>
                </div>

                <div className="text-[11px] font-mono text-[#75716B] pt-2 border-t border-[#1A1816]/15">
                  *Loop animation actively simulates rhythmic activation voltage
                  propagation.
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: LIVE FORWARD PASS WITH INTERACTIVE SENSOR SLIDERS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-[#1A1816]/15">
            {/* Visual Canvas (Left) */}
            <div className="lg:col-span-7">
              <div
                className="relative rounded-[2px] border border-[#1A1816] p-6 bg-[#FAF9F5]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(26,24,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,22,0.05) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] mb-4 pb-2 border-b border-[#1A1816]/15">
                  <span className="font-bold text-[#1A1816]">
                    FIGURE 05 · LIVE NUMERICAL COMPUTE
                  </span>
                  <span className="text-[#DE5D35] font-bold font-mono">
                    Prediction ŷ = {forwardResult.out.toFixed(3)}
                  </span>
                </div>

                <div className="w-full flex items-center justify-center py-4">
                  <svg
                    role="img"
                    aria-label="Live forward pass through the network for the current slider inputs"
                    viewBox="0 0 460 250"
                    className="w-full h-auto select-none max-w-[440px]"
                  >
                    {[65, 175].map((yIn, iIdx) =>
                      [45, 120, 195].map((yH, hIdx) => (
                        <line
                          key={`fwd-${iIdx}-${hIdx}`}
                          x1="85"
                          y1={yIn}
                          x2="214"
                          y2={yH}
                          stroke="#2B6CB0"
                          strokeWidth="1.8"
                          strokeDasharray="6 4"
                          className="animate-dash-forward"
                        />
                      )),
                    )}

                    {[45, 120, 195].map((yH, hIdx) => (
                      <line
                        key={`fwd-out-${hIdx}`}
                        x1="256"
                        y1={yH}
                        x2="362"
                        y2={120}
                        stroke="#DE5D35"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="animate-dash-forward"
                      />
                    ))}

                    {/* Inputs with real values */}
                    <circle
                      cx="65"
                      cy="65"
                      r="20"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="65"
                      y="69"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1A1816"
                    >
                      {inputX1.toFixed(1)}
                    </text>

                    <circle
                      cx="65"
                      cy="175"
                      r="20"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="65"
                      y="179"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1A1816"
                    >
                      {inputX2.toFixed(1)}
                    </text>

                    {/* Hidden Activations */}
                    <circle
                      cx="235"
                      cy="45"
                      r="21"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="235"
                      y="49"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1A1816"
                    >
                      {forwardResult.h1.toFixed(2)}
                    </text>

                    <circle
                      cx="235"
                      cy="120"
                      r="21"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="235"
                      y="124"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1A1816"
                    >
                      {forwardResult.h2.toFixed(2)}
                    </text>

                    <circle
                      cx="235"
                      cy="195"
                      r="21"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="235"
                      y="199"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1A1816"
                    >
                      {forwardResult.h3.toFixed(2)}
                    </text>

                    {/* Output */}
                    <circle
                      cx="385"
                      cy="120"
                      r="23"
                      fill="#1A1816"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="385"
                      y="124"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#FAF9F5"
                    >
                      {forwardResult.out.toFixed(3)}
                    </text>
                  </svg>
                </div>

                {/* Sliders */}
                <div className="bg-[#FAF9F5] p-4 rounded-[2px] border border-[#1A1816]/15 grid grid-cols-2 gap-4 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Input Sensor x₁:</span>
                      <span className="font-bold text-[#DE5D35]">
                        {inputX1.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-1.5"
                      max="2.5"
                      step="0.1"
                      value={inputX1}
                      onChange={(e) => setInputX1(parseFloat(e.target.value))}
                      className="w-full accent-[#1A1816] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Input Sensor x₂:</span>
                      <span className="font-bold text-[#DE5D35]">
                        {inputX2.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-1.5"
                      max="2.5"
                      step="0.1"
                      value={inputX2}
                      onChange={(e) => setInputX2(parseFloat(e.target.value))}
                      className="w-full accent-[#1A1816] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation (Right) */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[#DE5D35] block">
                05 / FORWARD PASS
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-black uppercase tracking-tight text-[#1A1816] font-display">
                The Forward Pass: Live Calculations
              </h3>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                During the forward pass, numerical vectors enter at the left
                sensors. Each hidden neuron takes the linear combination of all
                inputs, applies the activation function, and exposes its
                internal activation.
              </p>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                Adjust the sensor sliders on the left: watch the internal
                activations inside h₁, h₂, and h₃ recalculate immediately,
                culminating in the terminal prediction{" "}
                <MathTex math="\hat{y}" />.
              </p>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 6: BACKPROPAGATION & GRADIENT FEEDBACK LOOP                       */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-[#1A1816]/15">
            {/* Explanation (Left) */}
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[#DE5D35] block">
                06 / HOW NETWORKS LEARN
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-black uppercase tracking-tight text-[#1A1816] font-display">
                Backpropagation: How Networks Learn
              </h3>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                Now that we&apos;ve grasped the concept of activation functions
                and their role in neural networks, it&apos;s time to understand
                how these networks learn. The magic behind this learning process
                is a technique known as{" "}
                <strong className="text-[#1A1816] font-bold">
                  backpropagation
                </strong>
                .
              </p>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                Backpropagation is an algorithm used during the training of
                neural networks. The goal of backpropagation is to update the
                weights so that the Neural Network makes better predictions.
                Specifically, backpropagation will calculate the gradient of the
                loss function with respect to the weights of the network,
                updating the weights layer-by-layer to minimize the
                network&apos;s prediction error.
              </p>
              <p className="text-[15px] text-[#475569] leading-[1.75]">
                Notice the reverse loop on the right: the error signal travels
                backward from the Loss node, flowing through the multivariable
                chain rule to update every weight parameter in the graph.
              </p>
            </div>

            {/* Visual Canvas with BACKWARD ERROR FEEDBACK LOOP (Right) */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div
                className="relative rounded-[2px] border border-[#1A1816] p-6 bg-[#FAF9F5]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(26,24,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,22,0.05) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] mb-4 pb-2 border-b border-[#1A1816]/15">
                  <span className="font-bold text-[#1A1816]">
                    FIGURE 06 · BACKWARD FEEDBACK LOOP
                  </span>
                  <span className="text-[#DE5D35] font-bold font-mono">
                    ∂L/∂w GRADIENT ARCS
                  </span>
                </div>

                <div className="w-full flex items-center justify-center py-4">
                  <svg
                    role="img"
                    aria-label="Backpropagation gradient arcs flowing backward through the network"
                    viewBox="0 0 460 240"
                    className="w-full h-auto select-none max-w-[440px]"
                  >
                    {/* Feedforward paths with forward animated dashes */}
                    <path
                      d="M 68 120 L 160 120"
                      stroke="#2B6CB0"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />
                    <path
                      d="M 220 120 L 285 120"
                      stroke="#2B6CB0"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />
                    <path
                      d="M 345 120 L 375 120"
                      stroke="#316B83"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      className="animate-dash-forward"
                    />

                    {/* THE BACKWARD ERROR FEEDBACK LOOP */}
                    <path
                      d="M 395 95 C 395 15, 190 15, 190 88"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="animate-dash-backward"
                    />
                    <polygon points="190,96 184,84 196,84" fill="#DE5D35" />

                    <rect
                      x="235"
                      y="10"
                      width="130"
                      height="22"
                      rx="2"
                      fill="#FAF9F5"
                      stroke="#DE5D35"
                      strokeWidth="1.5"
                    />
                    <text
                      x="300"
                      y="25"
                      fill="#DE5D35"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      ← ∂L/∂w BACKWARD
                    </text>

                    {/* Secondary Loop from Hidden to Input */}
                    <path
                      d="M 190 145 C 190 200, 50 200, 50 142"
                      fill="none"
                      stroke="#DE5D35"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                      className="animate-dash-backward"
                    />
                    <polygon points="50,136 44,148 56,148" fill="#DE5D35" />
                    <g transform="translate(60, 182)">
                      <rect
                        width="130"
                        height="20"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="1"
                      />
                      <text
                        x="65"
                        y="14"
                        fill="#1A1816"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ← ∂L/∂x INPUT GRADIENT
                      </text>
                    </g>

                    {/* Nodes */}
                    <circle
                      cx="50"
                      cy="120"
                      r="18"
                      fill="#FAF9F5"
                      stroke="#1A1816"
                      strokeWidth="2"
                    />
                    <text
                      x="50"
                      y="124"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#1A1816"
                    >
                      x_in
                    </text>

                    <g transform="translate(160, 100)">
                      <rect
                        width="60"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="2"
                      />
                      <text
                        x="30"
                        y="25"
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        Hidden
                      </text>
                    </g>

                    <g transform="translate(285, 100)">
                      <rect
                        width="60"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="2"
                      />
                      <text
                        x="30"
                        y="25"
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        Output ŷ
                      </text>
                    </g>

                    {/* Loss Node */}
                    <g transform="translate(375, 100)">
                      <rect
                        width="68"
                        height="40"
                        rx="2"
                        fill="#FAF9F5"
                        stroke="#DE5D35"
                        strokeWidth="2"
                      />
                      <text
                        x="34"
                        y="25"
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#DE5D35"
                      >
                        Loss(ŷ, y)
                      </text>
                    </g>
                  </svg>
                </div>
                <div className="text-[11px] font-mono text-[#75716B] pt-2 border-t border-[#1A1816]/15">
                  *Curved feedback loops convey continuous chain-rule error
                  signals flowing backward to update weights.
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 7: FULL INTERACTIVE BACKPROPAGATION SIMULATOR                     */}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 7: FULL INTERACTIVE BACKPROPAGATION SIMULATOR                     */}
        {/* VISxAI Backprop Explainer Architecture · Swiss Minimalist Aesthetic       */}
        {/* ========================================================================= */}
        <section className="shell max-w-[1560px] mx-auto mt-20 pt-12 border-t border-[#1A1816]/15 space-y-8 px-4 sm:px-6">
          <div className="max-w-[920px] mx-auto space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[#DE5D35] block">
                07 / BACKPROPAGATION TRAINING LOOP SIMULATOR
              </span>
            </div>

            <h3 className="text-[28px] sm:text-[40px] font-black uppercase tracking-tight text-[#1A1816] font-display leading-[1.05]">
              The Full Training Loop in Motion
            </h3>

            <p className="text-[15px] sm:text-[17px] text-[#475569] leading-[1.8]">
              Every epoch in deep learning executes an unbroken circular dance:{" "}
              <strong className="text-[#1A1816] font-bold">Forward Pass</strong>{" "}
              sends data through synaptic weights and activations,{" "}
              <strong className="text-[#1A1816] font-bold">
                Loss Evaluation
              </strong>{" "}
              compares output predictions against target ground truth, and{" "}
              <strong className="text-[#1A1816] font-bold">
                Backpropagation
              </strong>{" "}
              streams multivariable chain rule gradients in reverse to update
              every synapse before repeating the next training iteration.
            </p>

            <p className="text-[14px] text-[#75716B] leading-[1.7]">
              Interact with the real-time simulation below: press{" "}
              <strong className="text-[#1A1816]">Play</strong> to witness
              continuous gradient descent fitting the regression curve, or click{" "}
              <strong className="text-[#1A1816]">Animate Epoch</strong> to
              trigger a step-by-step 4-phase walkthrough of gradient
              propagation.
            </p>
          </div>

          {/* State-of-the-art Backpropagation Simulator */}
          <div className="w-full">
            <BackpropSimulator />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* MATHEMATICAL DERIVATIONS & CODE WITH SYNTAX HIGHLIGHTING                  */}
        {/* ========================================================================= */}
        <section className="shell max-w-[860px] mx-auto mt-24 pt-12 border-t border-[#1A1816]/15 space-y-12">
          {/* Mathematical Formulations in KaTeX */}
          <div>
            <h2 className="text-[12px] font-mono font-bold tracking-[0.2em] uppercase text-[#1A1816] border-b border-[#1A1816]/15 pb-2 mb-4">
              MATHEMATICAL FORMULATION: MULTIVARIABLE CHAIN RULE
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.8] mb-4">
              To evaluate weight updates across successive layers, the chain
              rule decomposes the total derivative of the loss with respect to
              any arbitrary connection weight <MathTex math="w_{ij}^{(l)}" />:
            </p>

            <div className="bg-[#FAF9F5] border border-[#1A1816] p-5 rounded-[2px] text-center my-4 overflow-x-auto">
              <MathTex
                math="\frac{\partial \mathcal{L}}{\partial w_{ij}^{(l)}} = \frac{\partial \mathcal{L}}{\partial a^{(L)}} \cdot \frac{\partial a^{(L)}}{\partial z^{(L)}} \cdot \prod_{k=l+1}^{L-1} \frac{\partial z^{(k)}}{\partial z^{(k-1)}} \cdot \frac{\partial z^{(l)}}{\partial w_{ij}^{(l)}}"
                block={true}
              />
            </div>

            <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.8]">
              Once these error derivatives are compiled across all training
              instances, the weights are updated via Stochastic Gradient Descent
              (SGD) parameterized by learning rate <MathTex math="\eta" />:
            </p>

            <div className="bg-[#1A1816] text-[#FAF9F5] p-4 rounded-[2px] text-center max-w-[340px] mx-auto mt-4">
              <MathTex
                math="w_{\text{new}} = w_{\text{old}} - \eta \cdot \nabla_w \mathcal{L}(w)"
                block={true}
              />
            </div>
          </div>

          {/* PyTorch Reference with Clean Syntax Highlighting */}
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1816]/15 pb-2 mb-4">
              <h2 className="text-[12px] font-mono font-bold tracking-[0.2em] uppercase text-[#1A1816]">
                PYTORCH REFERENCE IMPLEMENTATION
              </h2>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 text-[11px] font-mono rounded-[2px] bg-[#FAF9F5] border border-[#1A1816]/20 hover:bg-[#1A1816] hover:text-[#FAF9F5] transition-colors cursor-pointer"
              >
                {copied ? "✓ Copied" : "Copy Code"}
              </button>
            </div>

            <p className="text-[15px] text-[#475569] mb-3">
              Here is how this feedforward computational graph and activation
              pipeline is declared in modern PyTorch:
            </p>

            {/* Syntax Highlighted Code Container */}
            <div className="bg-[#161513] text-[#FAF9F5] p-5 rounded-[2px] font-mono text-[12px] sm:text-[13px] overflow-x-auto leading-[1.7] border border-[#1A1816]">
              <pre>
                <code>
                  <span className="text-[#F43F5E]">import</span>{" "}
                  <span className="text-[#FAF9F5]">torch</span>
                  {"\n"}
                  <span className="text-[#F43F5E]">import</span>{" "}
                  <span className="text-[#FAF9F5]">torch.nn</span>{" "}
                  <span className="text-[#F43F5E]">as</span>{" "}
                  <span className="text-[#FAF9F5]">nn</span>
                  {"\n"}
                  <span className="text-[#F43F5E]">import</span>{" "}
                  <span className="text-[#FAF9F5]">torch.optim</span>{" "}
                  <span className="text-[#F43F5E]">as</span>{" "}
                  <span className="text-[#FAF9F5]">optim</span>
                  {"\n\n"}
                  <span className="text-[#75716B]">
                    # ── Define FeedForward Computational Graph ─────────────
                  </span>
                  {"\n"}
                  <span className="text-[#F43F5E]">class</span>{" "}
                  <span className="text-[#38BDF8]">FeedForwardNetwork</span>
                  <span className="text-[#FAF9F5]">(nn.Module):</span>
                  {"\n"}
                  {"    "}
                  <span className="text-[#F43F5E]">def</span>{" "}
                  <span className="text-[#60A5FA]">__init__</span>
                  <span className="text-[#FAF9F5]">(self, input_dim=</span>
                  <span className="text-[#F59E0B]">2</span>
                  <span className="text-[#FAF9F5]">, hidden_dim=</span>
                  <span className="text-[#F59E0B]">3</span>
                  <span className="text-[#FAF9F5]">, output_dim=</span>
                  <span className="text-[#F59E0B]">1</span>
                  <span className="text-[#FAF9F5]">):</span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">super().</span>
                  <span className="text-[#60A5FA]">__init__</span>
                  <span className="text-[#FAF9F5]">()</span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#75716B]">
                    # Layer 1: Input to Hidden
                  </span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">self.fc1 = nn.</span>
                  <span className="text-[#38BDF8]">Linear</span>
                  <span className="text-[#FAF9F5]">
                    (input_dim, hidden_dim)
                  </span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">self.relu = nn.</span>
                  <span className="text-[#38BDF8]">ReLU</span>
                  <span className="text-[#FAF9F5]">()</span>
                  {"\n\n"}
                  {"        "}
                  <span className="text-[#75716B]">
                    # Layer 2: Hidden to Output
                  </span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">self.fc2 = nn.</span>
                  <span className="text-[#38BDF8]">Linear</span>
                  <span className="text-[#FAF9F5]">
                    (hidden_dim, output_dim)
                  </span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">self.sigmoid = nn.</span>
                  <span className="text-[#38BDF8]">Sigmoid</span>
                  <span className="text-[#FAF9F5]">()</span>
                  {"\n\n"}
                  {"    "}
                  <span className="text-[#F43F5E]">def</span>{" "}
                  <span className="text-[#60A5FA]">forward</span>
                  <span className="text-[#FAF9F5]">(self, x):</span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#75716B]">
                    # Affine combination + non-linear activation
                  </span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">z1 = self.</span>
                  <span className="text-[#60A5FA]">fc1</span>
                  <span className="text-[#FAF9F5]">(x)</span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">a1 = self.</span>
                  <span className="text-[#60A5FA]">relu</span>
                  <span className="text-[#FAF9F5]">(z1)</span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">z2 = self.</span>
                  <span className="text-[#60A5FA]">fc2</span>
                  <span className="text-[#FAF9F5]">(a1)</span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#FAF9F5]">y_hat = self.</span>
                  <span className="text-[#60A5FA]">sigmoid</span>
                  <span className="text-[#FAF9F5]">(z2)</span>
                  {"\n"}
                  {"        "}
                  <span className="text-[#F43F5E]">return</span>{" "}
                  <span className="text-[#FAF9F5]">y_hat</span>
                  {"\n\n"}
                  <span className="text-[#75716B]">
                    # ── Train with Binary Cross-Entropy Loss & SGD ─────────
                  </span>
                  {"\n"}
                  <span className="text-[#FAF9F5]">model = </span>
                  <span className="text-[#38BDF8]">FeedForwardNetwork</span>
                  <span className="text-[#FAF9F5]">()</span>
                  {"\n"}
                  <span className="text-[#FAF9F5]">criterion = nn.</span>
                  <span className="text-[#38BDF8]">BCELoss</span>
                  <span className="text-[#FAF9F5]">()</span>
                  {"\n"}
                  <span className="text-[#FAF9F5]">optimizer = optim.</span>
                  <span className="text-[#38BDF8]">SGD</span>
                  <span className="text-[#FAF9F5]">
                    (model.parameters(), lr=
                  </span>
                  <span className="text-[#F59E0B]">0.1</span>
                  <span className="text-[#FAF9F5]">)</span>
                </code>
              </pre>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* SECTION 8: FORWARD PASS / BACKWARD PASS WALKTHROUGH             */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="pt-8 border-t border-[#1A1816]/15 space-y-6">
            <LoopedStyles
              css={nnCss}
              reduceMotionTargets={[".nn2-fwd", ".nn2-back", ".nn2-node"]}
            />

            <div>
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase text-[#DE5D35] block">
                08 / THE TWO PASSES
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-black uppercase tracking-tight text-[#1A1816] font-display mt-1">
                Forward, Then Backward: The Pass-by-Pass Walkthrough
              </h3>
            </div>

            <div className="text-[15px] text-[#475569] leading-[1.75] space-y-4">
              <p>
                Training is two sweeps over the same graph, run in opposite
                directions. On the{" "}
                <strong className="text-[#1A1816] font-bold">
                  forward pass
                </strong>{" "}
                each layer performs one affine step followed by one nonlinear
                step: <MathTex math="z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}" />,
                then <MathTex math="a^{(l)} = f(z^{(l)})" />. The input{" "}
                <MathTex math="a^{(0)} = x" /> starts the chain and the last
                activation produces the prediction <MathTex math="\hat{y}" />.
              </p>
              <p>
                A scalar loss — say binary cross-entropy — folds that whole
                prediction down to one number, <MathTex math="L(\hat{y}, y)" />.
                That single number is what training minimises; every parameter
                is judged only by how much it moves it.
              </p>
              <p>
                The{" "}
                <strong className="text-[#1A1816] font-bold">
                  backward pass
                </strong>{" "}
                is the chain rule applied right-to-left. Starting from{" "}
                <MathTex math="\partial L / \partial \hat{y}" />, each layer
                takes the gradient arriving from the layer above (the{" "}
                <em>incoming</em> gradient) and multiplies it by its own{" "}
                <em>local</em> derivative: the activation slope{" "}
                <MathTex math="f'(z)" /> for the neuron, and the layer&apos;s
                input <MathTex math="a^{(l-1)}" /> for the weights. Nothing is
                recomputed — the forward activations are cached and reused,
                which is why the forward pass must run first.
              </p>
              <p>
                Every sample in a batch is pushed through with the <em>same</em>{" "}
                weights. Forward, each sample contributes its own output;
                backward, each contributes its own gradient, and those
                per-sample gradients are summed into one update. That is why a
                batch behaves like one shared model learning from many examples
                at once rather than many models — the weights are literally the
                same object on every forward and backward trip.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-[11px] sm:text-[12px] font-mono border border-[#1A1816]/15 bg-[#FAF9F5]">
                <thead>
                  <tr className="bg-[#1A1816] text-[#FAF9F5] text-left">
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">
                      Forward pass
                    </th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">
                      Backward pass (local × incoming)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#4A4742]">
                  <tr className="border-t border-[#1A1816]/15">
                    <td className="px-3 py-2 font-bold text-[#1A1816]">
                      Input L0
                    </td>
                    <td className="px-3 py-2">a⁰ = x (2×1)</td>
                    <td className="px-3 py-2">∂L/∂x = (W¹)ᵀ δ¹</td>
                  </tr>
                  <tr className="border-t border-[#1A1816]/15">
                    <td className="px-3 py-2 font-bold text-[#1A1816]">
                      Hidden L1
                    </td>
                    <td className="px-3 py-2">
                      z¹ = W¹a⁰ + b¹ → a¹ = ReLU(z¹) (3×1)
                    </td>
                    <td className="px-3 py-2">
                      δ¹ = (W²)ᵀδ² ⊙ f′(z¹); ∂L/∂W¹ = δ¹(a⁰)ᵀ
                    </td>
                  </tr>
                  <tr className="border-t border-[#1A1816]/15">
                    <td className="px-3 py-2 font-bold text-[#1A1816]">
                      Output L2
                    </td>
                    <td className="px-3 py-2">
                      z² = W²a¹ + b² → ŷ = σ(z²) (1×1)
                    </td>
                    <td className="px-3 py-2">
                      δ² = (∂L/∂ŷ) ⊙ σ′(z²); ∂L/∂W² = δ²(a¹)ᵀ
                    </td>
                  </tr>
                  <tr className="border-t border-[#1A1816]/15">
                    <td className="px-3 py-2 font-bold text-[#1A1816]">Loss</td>
                    <td className="px-3 py-2">L(ŷ, y) (scalar)</td>
                    <td className="px-3 py-2">seed: ∂L/∂ŷ from the loss</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className="relative rounded-[2px] border border-[#1A1816] p-6 bg-[#FAF9F5]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(26,24,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,22,0.05) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] mb-4 pb-2 border-b border-[#1A1816]/15">
                <span className="font-bold text-[#1A1816]">
                  FIGURE 08 · FORWARD &amp; BACKWARD SWEEP
                </span>
                <span className="text-[#DE5D35] font-bold font-mono">
                  9s LOOP
                </span>
              </div>

              <div className="w-full flex items-center justify-center py-4">
                <Looped
                  label="Animation of a forward activation wave travelling left to right through a small layered network, followed by a backward gradient wave travelling right to left"
                  className="w-full max-w-[520px]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 520 260"
                    className="w-full h-auto select-none"
                  >
                    {/* Base wiring */}
                    {nnInputs.map((a, i) =>
                      nnHidden.map((b, j) => (
                        <line
                          key={`base-ih-${i}-${j}`}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke="rgba(26,24,22,0.14)"
                          strokeWidth="1.5"
                        />
                      )),
                    )}
                    {nnHidden.map((a, j) => (
                      <line
                        key={`base-ho-${j}`}
                        x1={a.x}
                        y1={a.y}
                        x2={nnOutput.x}
                        y2={nnOutput.y}
                        stroke="rgba(26,24,22,0.14)"
                        strokeWidth="1.5"
                      />
                    ))}
                    <line
                      x1={nnOutput.x}
                      y1={nnOutput.y}
                      x2={nnLoss.x}
                      y2={nnLoss.y}
                      stroke="rgba(26,24,22,0.14)"
                      strokeWidth="1.5"
                    />

                    {/* Forward wave (ink), staggered layer by layer */}
                    {nnInputs.map((a, i) =>
                      nnHidden.map((b, j) => (
                        <line
                          key={`fwd-ih-${i}-${j}`}
                          className="nn2-fwd"
                          style={{ animationDelay: "0s" }}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke="#1A1816"
                          strokeWidth="2.5"
                        />
                      )),
                    )}
                    {nnHidden.map((a, j) => (
                      <line
                        key={`fwd-ho-${j}`}
                        className="nn2-fwd"
                        style={{ animationDelay: "1.3s" }}
                        x1={a.x}
                        y1={a.y}
                        x2={nnOutput.x}
                        y2={nnOutput.y}
                        stroke="#1A1816"
                        strokeWidth="2.5"
                      />
                    ))}
                    <line
                      className="nn2-fwd"
                      style={{ animationDelay: "2.6s" }}
                      x1={nnOutput.x}
                      y1={nnOutput.y}
                      x2={nnLoss.x}
                      y2={nnLoss.y}
                      stroke="#1A1816"
                      strokeWidth="2.5"
                    />

                    {/* Backward wave (accent), right to left */}
                    <line
                      className="nn2-back"
                      style={{ animationDelay: "0s" }}
                      x1={nnLoss.x}
                      y1={nnLoss.y}
                      x2={nnOutput.x}
                      y2={nnOutput.y}
                      stroke="#DE5D35"
                      strokeWidth="2.5"
                    />
                    {nnHidden.map((a, j) => (
                      <line
                        key={`back-ho-${j}`}
                        className="nn2-back"
                        style={{ animationDelay: "0.9s" }}
                        x1={nnOutput.x}
                        y1={nnOutput.y}
                        x2={a.x}
                        y2={a.y}
                        stroke="#DE5D35"
                        strokeWidth="2.5"
                      />
                    ))}
                    {nnInputs.map((a, i) =>
                      nnHidden.map((b, j) => (
                        <line
                          key={`back-ih-${i}-${j}`}
                          className="nn2-back"
                          style={{ animationDelay: "1.8s" }}
                          x1={b.x}
                          y1={b.y}
                          x2={a.x}
                          y2={a.y}
                          stroke="#DE5D35"
                          strokeWidth="2.5"
                        />
                      )),
                    )}

                    {/* Nodes */}
                    {nnInputs.map((n, i) => (
                      <g key={`in-${i}`}>
                        <circle
                          className="nn2-node"
                          cx={n.x}
                          cy={n.y}
                          r="20"
                          fill="#FAF9F5"
                          stroke="#1A1816"
                          strokeWidth="2"
                        />
                        <text
                          x={n.x}
                          y={n.y + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill="#1A1816"
                        >
                          x{i === 0 ? "₁" : "₂"}
                        </text>
                      </g>
                    ))}
                    {nnHidden.map((n, i) => (
                      <g key={`hid-${i}`}>
                        <circle
                          className="nn2-node"
                          cx={n.x}
                          cy={n.y}
                          r="20"
                          fill="#FAF9F5"
                          stroke="#1A1816"
                          strokeWidth="2"
                        />
                        <text
                          x={n.x}
                          y={n.y + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill="#1A1816"
                        >
                          a¹{i === 0 ? "" : `·${i + 1}`}
                        </text>
                      </g>
                    ))}
                    <g>
                      <circle
                        className="nn2-node"
                        cx={nnOutput.x}
                        cy={nnOutput.y}
                        r="22"
                        fill="#FAF9F5"
                        stroke="#1A1816"
                        strokeWidth="2"
                      />
                      <text
                        x={nnOutput.x}
                        y={nnOutput.y + 4}
                        textAnchor="middle"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        ŷ
                      </text>
                    </g>
                    <g>
                      <circle
                        className="nn2-node"
                        cx={nnLoss.x}
                        cy={nnLoss.y}
                        r="24"
                        fill="#1A1816"
                        stroke="#1A1816"
                        strokeWidth="2"
                      />
                      <text
                        x={nnLoss.x}
                        y={nnLoss.y + 4}
                        textAnchor="middle"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#DE5D35"
                      >
                        L
                      </text>
                    </g>

                    {/* Legend */}
                    <text
                      x="60"
                      y="245"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="#1A1816"
                    >
                      ▸ FORWARD · z = Wx + b, a = f(z)
                    </text>
                    <text
                      x="300"
                      y="245"
                      fontSize="10"
                      fontFamily="monospace"
                      fill="#DE5D35"
                    >
                      ◂ BACKWARD · ∂L/∂w
                    </text>
                  </svg>
                </Looped>
              </div>

              <div className="text-[11px] font-mono text-[#75716B] pt-2 border-t border-[#1A1816]/15">
                *Ink pulse sweeps left→right as activations are computed; accent
                pulse sweeps right→left as the chain-rule gradient returns.
              </div>
            </div>
          </div>

          {/* Return to Articles Grid */}
          <div className="pt-8 border-t border-[#1A1816]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[12px] font-mono text-[#75716B]">
              Explore additional visual essays in the collection:
            </span>
            <Link
              href="/resources"
              className="px-4 py-2 bg-[#1A1816] text-[#FAF9F5] font-mono text-[11px] font-bold tracking-wider uppercase rounded-[2px] hover:bg-[#DE5D35] transition-colors"
            >
              Explore Published Articles Grid →
            </Link>
          </div>
        </section>
      </div>
    </FoldLayout>
  );
}
