"use client";

import Link from "next/link";
import FoldLayout from "@/components/FoldLayout";
import { Looped, LoopedStyles } from "@/components/looped";
import MathTex from "@/components/MathTex";

export default function RecurrentNetworksArticlePage() {
  const tokens = ["The", "cat", "sat", "down"];
  const SLOT = 1.5; // seconds per time-step in the loop
  const CYCLE = tokens.length * SLOT;

  const css = `
    @keyframes rnnTokenSlot {
      0%       { background: #FAF9F5; color: #4A4742; border-color: rgba(26,24,22,0.25); }
      4%, 20%  { background: #DE5D35; color: #FAF9F5; border-color: #DE5D35; }
      30%, 100%{ background: #FAF9F5; color: #4A4742; border-color: rgba(26,24,22,0.25); }
    }
    @keyframes rnnCellSlot {
      0%       { border-color: rgba(26,24,22,0.15); box-shadow: none; }
      4%, 20%  { border-color: #DE5D35; box-shadow: none; }
      30%, 100%{ border-color: rgba(26,24,22,0.15); box-shadow: none; }
    }
    @keyframes rnnArrowSlot {
      0%       { color: #C9C4BA; }
      4%, 20%  { color: #DE5D35; }
      30%, 100%{ color: #C9C4BA; }
    }
    @keyframes rnnOutSlot {
      0%       { opacity: 0.15; }
      4%, 20%  { opacity: 1; }
      30%, 100%{ opacity: 0.15; }
    }
    @keyframes rnnGradTravel {
      0%   { offset-distance: 100%; opacity: 0.9; }
      85%  { offset-distance: 0%; opacity: 0.25; }
      100% { offset-distance: 0%; opacity: 0; }
    }
    @keyframes rnnGateFlash {
      0%       { opacity: 0.35; }
      6%, 26%  { opacity: 1; }
      34%, 100%{ opacity: 0.35; }
    }
    .rnn-token { animation: rnnTokenSlot ${CYCLE}s linear infinite; }
    .rnn-cell  { animation: rnnCellSlot ${CYCLE}s linear infinite; }
    .rnn-arrow { animation: rnnArrowSlot ${CYCLE}s linear infinite; }
    .rnn-out   { animation: rnnOutSlot ${CYCLE}s linear infinite; }
    .rnn-gate  { animation: rnnGateFlash ${CYCLE}s linear infinite; }
    .rnn-grad  { offset-rotate: 0deg; animation: rnnGradTravel ${CYCLE}s cubic-bezier(0.3, 0, 0.7, 1) infinite; }
    @media (prefers-reduced-motion: reduce) {
      .rnn-token, .rnn-cell, .rnn-arrow, .rnn-out, .rnn-gate, .rnn-grad { animation: none; }
    }
  `;

  // ─────────────────────────────────────────────────────────────────────────────
  // Section 05: BPTT gradient-magnitude bars — vanilla decay vs gated steady
  // ─────────────────────────────────────────────────────────────────────────────
  const GRAD = [1, 0.62, 0.36, 0.2, 0.1]; // magnitude at t=T → t=1 (right → left)
  const vBarFrames = GRAD.map((_, i) => {
    const a = 4 + i * 7; // percent; rightmost bar fires first
    return `@keyframes rnn2V${i} { 0%, ${a}% { transform: scaleY(0); opacity: 0.25; } ${a + 4}% { transform: scaleY(1); opacity: 1; } 100% { transform: scaleY(1); opacity: 1; } }`;
  }).join("\n    ");
  const gBarFrames = GRAD.map((_, i) => {
    const a = 52 + i * 6; // second half; gated row holds full height
    return `@keyframes rnn2G${i} { 0%, ${a}% { transform: scaleY(0); opacity: 0.25; } ${a + 4}% { transform: scaleY(1); opacity: 1; } 100% { transform: scaleY(1); opacity: 1; } }`;
  }).join("\n    ");

  const rnnCss = `
    ${vBarFrames}
    ${gBarFrames}
    @keyframes rnn2TravelV {
      0%        { transform: translateX(0); opacity: 0; }
      3%        { opacity: 1; }
      34%       { transform: translateX(-432px); opacity: 1; }
      42%, 100% { transform: translateX(-432px); opacity: 0; }
    }
    @keyframes rnn2TravelG {
      0%, 50%   { transform: translateX(0); opacity: 0; }
      53%       { opacity: 1; }
      84%       { transform: translateX(-432px); opacity: 1; }
      92%, 100% { transform: translateX(-432px); opacity: 0; }
    }
    .rnn2-vbar, .rnn2-gbar { transform-box: fill-box; transform-origin: 50% 100%; }
    ${GRAD.map((_, i) => `.rnn2-v${i} { animation: rnn2V${i} 9s linear infinite; }`).join("\n    ")}
    ${GRAD.map((_, i) => `.rnn2-g${i} { animation: rnn2G${i} 9s linear infinite; }`).join("\n    ")}
    .rnn2-travel-v { animation: rnn2TravelV 9s linear infinite; }
    .rnn2-travel-g { animation: rnn2TravelG 9s linear infinite; }
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
                Deep Learning · Recurrent Networks
              </span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-14 border-b border-[#1A1816]/15 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5D35]" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
                Interactive Diagnostic Essay · Topic 09
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[56px] font-black tracking-[-0.035em] leading-[1.02] uppercase font-display text-[#1A1816] mb-5">
              Recurrent Networks: Memory in Motion
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#75716B] max-w-2xl leading-[1.6]">
              CNNs see everything at once — sentences, audio and stock prices
              unfold. Watch a network read word by word while carrying a running
              summary of everything it has read, and meet the LSTM that learns
              what to remember and what to forget.
            </p>
          </header>

          {/* Section 01: Unrolled RNN loop */}
          <section className="mb-16">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / One Cell, Many Timesteps
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                The Network That Reads in a Loop
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  A dense layer would need fixed-length input and zero memory
                  between words. An RNN instead processes{" "}
                  <strong>one token at a time</strong>, keeping a hidden state{" "}
                  <MathTex math="h_t" /> — a compressed summary of the story so
                  far:
                </p>
                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[13px]">
                  <MathTex
                    math="h_t = \tanh(W_{xh}\, x_t + W_{hh}\, h_{t-1} + b)"
                    block
                  />
                  <MathTex math="y_t = W_{hy}\, h_t" block />
                </div>
                <p>
                  The secret is <strong>weight sharing across time</strong>: the{" "}
                  <em>same</em> <MathTex math="W_{xh}, W_{hh}, W_{hy}" />{" "}
                  process every word. Unrolled, the single cell becomes a chain
                  — watch the sentence &ldquo;The cat sat down&rdquo; flow
                  through it in the animation, one glowing timestep at a time.
                </p>
                <p>
                  After the last word, <MathTex math="h_4" /> holds the
                  sentence&apos;s meaning — ready for sentiment, translation, or
                  the next-word prediction behind every language model.
                </p>
              </div>

              {/* Unrolled sequence animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-4 text-[11px] font-mono text-[#75716B]">
                  <span>
                    UNROLLED RNN · SENTENCE = &ldquo;THE CAT SAT DOWN&rdquo;
                  </span>
                  <span className="font-semibold text-[#DE5D35]">looping</span>
                </div>

                <div className="flex items-start justify-between gap-1">
                  {tokens.map((tok, t) => (
                    <div key={t} className="flex flex-col items-center flex-1">
                      {/* Input token */}
                      <div
                        className="rnn-token w-full max-w-[86px] text-center px-2 py-2 border rounded-[2px] font-mono text-[12px] font-bold"
                        style={{ animationDelay: `${t * SLOT}s` }}
                      >
                        {tok}
                      </div>
                      {/* Down arrow */}
                      <div
                        className="rnn-arrow font-mono text-[14px] my-1"
                        style={{ animationDelay: `${t * SLOT}s` }}
                      >
                        ↓
                      </div>
                      {/* Hidden cell */}
                      <div
                        className="rnn-cell w-full max-w-[86px] text-center px-2 py-3 bg-white border-2 rounded-[2px] font-mono text-[12px] text-[#1A1816]"
                        style={{ animationDelay: `${t * SLOT}s` }}
                      >
                        h{t + 1}
                      </div>
                      {/* Output bar */}
                      <div
                        className="rnn-out mt-2 w-full max-w-[86px]"
                        style={{ animationDelay: `${t * SLOT}s` }}
                      >
                        <div
                          className="h-1.5 bg-[#DE5D35] rounded-[1px]"
                          style={{ width: `${45 + t * 15}%`, margin: "0 auto" }}
                        />
                        <div className="text-[9px] font-mono text-[#75716B] text-center mt-1">
                          y{t + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recurrence arrows between cells */}
                <div className="flex justify-between mt-2 px-[4%]">
                  {[0, 1, 2].map((t) => (
                    <div
                      key={t}
                      className="rnn-arrow font-mono text-[12px]"
                      style={{
                        animationDelay: `${(t + 1) * SLOT}s`,
                        transform: "translateX(50%)",
                      }}
                    >
                      h{t + 1} ⟶
                    </div>
                  ))}
                </div>

                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  same weights at every step · the arrow between cells is the
                  memory
                </p>
              </div>
            </div>
          </section>

          {/* Section 02: BPTT & vanishing gradients */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                02 / Training Through Time
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Backpropagation Through Time — and the Vanishing Gradient
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Vanishing gradient animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>ERROR SIGNAL FLOWING BACKWARD</span>
                  <span className="font-semibold text-[#EF4444]">
                    fading as it travels
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <svg
                    viewBox="0 0 640 180"
                    className="w-full select-none"
                    role="img"
                    aria-label="Animation of the error gradient fading as it flows backward through an unrolled network"
                  >
                    {/* Backward path from right to left */}
                    <path
                      id="rnn-grad-path"
                      d="M 600 90 L 460 90 L 320 90 L 180 90 L 60 90"
                      fill="none"
                      stroke="none"
                    />
                    {/* Chain of cells */}
                    {[
                      { x: 60, l: "h₁" },
                      { x: 180, l: "h₂" },
                      { x: 320, l: "h₃" },
                      { x: 460, l: "h₄" },
                      { x: 600, l: "loss" },
                    ].map((n, i) => (
                      <g key={i}>
                        <rect
                          x={n.x - 38}
                          y={i === 4 ? 70 : 62}
                          width="76"
                          height="40"
                          rx="3"
                          fill={i === 4 ? "#1A1816" : "#FAF9F5"}
                          stroke={i === 4 ? "#1A1816" : "rgba(26,24,22,0.35)"}
                          strokeWidth="1.5"
                        />
                        <text
                          x={n.x}
                          y={i === 4 ? 95 : 87}
                          fontSize="13"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill={i === 4 ? "#FAF9F5" : "#1A1816"}
                          fontWeight={i === 4 ? "bold" : "normal"}
                        >
                          {n.l}
                        </text>
                      </g>
                    ))}

                    {/* Fading gradient trail */}
                    <text
                      x="330"
                      y="40"
                      fontSize="11"
                      fontFamily="monospace"
                      fill="#75716B"
                      textAnchor="middle"
                    >
                      ∂loss/∂h₄ → ∂loss/∂h₃ → ∂loss/∂h₂ → ∂loss/∂h₁
                    </text>
                    <text
                      x="330"
                      y="150"
                      fontSize="11"
                      fontFamily="monospace"
                      fill="#EF4444"
                      textAnchor="middle"
                    >
                      each hop multiplies by W·diag(σ′) — below 1 it decays,
                      above 1 it explodes
                    </text>

                    {/* Traveling fading dot */}
                    <circle r="7" fill="#EF4444" className="rnn-grad">
                      <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        calcMode="linear"
                        path="M 600 90 L 60 90"
                      />
                      <animate
                        attributeName="opacity"
                        values="1;0.7;0.45;0.25;0.12"
                        keyTimes="0;0.25;0.5;0.75;1"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  by h₁ the signal is nearly gone — early words barely learn
                </p>
              </div>

              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4 order-1 lg:order-2">
                <p>
                  To train the shared weights, we unroll the loop into the chain
                  above and backpropagate through every timestep at once —{" "}
                  <strong>BPTT</strong>. But each backward hop multiplies the
                  gradient by <MathTex math="W_{hh}" /> and the tanh derivative
                  (≤ 1):
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    The Product That Breaks RNNs
                  </span>
                  <MathTex
                    math="\frac{\partial L}{\partial h_1} = \frac{\partial L}{\partial h_T} \prod_{t=2}^{T} W_{hh}^T \, \text{diag}(\tanh' (h_t))"
                    block
                  />
                </div>
                <ul className="space-y-2 text-[13px]">
                  <li>
                    <strong className="text-[#EF4444]">Vanishing:</strong>{" "}
                    factors &lt; 1 compound — the signal decays to nothing and
                    early timesteps never learn long-range patterns.
                  </li>
                  <li>
                    <strong className="text-[#EF4444]">Exploding:</strong>{" "}
                    factors &gt; 1 compound — the signal blows up to NaN. The
                    cheap fix is <em>gradient clipping</em>: cap the norm before
                    the update.
                  </li>
                </ul>
                <p>
                  Vanishing can&apos;t be fixed by clipping — it needs an
                  architecture that lets information <em>bypass</em> the
                  multiplications. Enter the LSTM.
                </p>
              </div>
            </div>
          </section>

          {/* Section 03: LSTM gates */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                03 / Gated Memory
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                LSTM: Learn to Remember, Learn to Forget
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  The Long Short-Term Memory cell adds a{" "}
                  <strong>cell state</strong> — a conveyor belt running along
                  the whole sequence — guarded by three learned gates (each a
                  tiny sigmoid layer outputting values in{" "}
                  <MathTex math="[0, 1]" />, i.e. &ldquo;how much to let
                  through&rdquo;):
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15 text-[13px] space-y-2.5">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#DE5D35] font-bold">
                      1 · FORGET GATE
                    </span>
                    <MathTex
                      math="f_t = \sigma(W_f [h_{t-1}, x_t] + b_f)"
                      block
                    />
                    <span className="text-[12px]">
                      How much of the old memory to keep — &ldquo;the subject
                      changed, drop the old gender.&rdquo;
                    </span>
                  </div>
                  <div className="border-t border-[#1A1816]/10 pt-2.5">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#DE5D35] font-bold">
                      2 · INPUT GATE
                    </span>
                    <MathTex
                      math="i_t = \sigma(W_i [h_{t-1}, x_t] + b_i)"
                      block
                    />
                    <span className="text-[12px]">
                      How much of the new candidate{" "}
                      <MathTex math="\tilde{C}_t" /> to write into memory.
                    </span>
                  </div>
                  <div className="border-t border-[#1A1816]/10 pt-2.5">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#DE5D35] font-bold">
                      3 · OUTPUT GATE
                    </span>
                    <MathTex
                      math="o_t = \sigma(W_o [h_{t-1}, x_t] + b_o)"
                      block
                    />
                    <span className="text-[12px]">
                      How much memory to reveal as this step&apos;s{" "}
                      <MathTex math="h_t" />.
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-[#FAF9F5] border border-[#1A1816]/15 font-mono text-[12px]">
                  <span className="text-[#75716B]">CELL STATE UPDATE:</span>
                  <MathTex
                    math="C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t"
                    block
                  />
                </div>
                <p>
                  The addition in <MathTex math="C_t" /> is the magic: the
                  gradient can flow <em>additively</em> along the cell state for
                  hundreds of steps without being repeatedly multiplied — the
                  vanishing problem simply doesn&apos;t apply to the belt.
                </p>
              </div>

              {/* LSTM gate animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>LSTM CELL · GATES FIRE IN SEQUENCE</span>
                  <span className="font-semibold text-[#DE5D35]">looping</span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px] overflow-x-auto">
                  <svg
                    viewBox="0 0 640 320"
                    className="w-full min-w-[520px] select-none"
                    role="img"
                    aria-label="LSTM cell animation with forget, input and output gates firing in sequence"
                  >
                    {/* Cell state conveyor belt (top) */}
                    <line
                      x1="60"
                      y1="60"
                      x2="580"
                      y2="60"
                      stroke="#DE5D35"
                      strokeWidth="3"
                    />
                    <text
                      x="60"
                      y="42"
                      fontSize="11"
                      fontFamily="monospace"
                      fill="#DE5D35"
                    >
                      cell state Cₜ₋₁ (the memory belt) →
                    </text>
                    {/* Belt pulse */}
                    <circle r="6" fill="#DE5D35">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M 60 60 L 580 60"
                      />
                    </circle>

                    {/* Hidden state bottom belt */}
                    <line
                      x1="60"
                      y1="270"
                      x2="580"
                      y2="270"
                      stroke="#1A1816"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <text
                      x="60"
                      y="292"
                      fontSize="11"
                      fontFamily="monospace"
                      fill="#1A1816"
                    >
                      hidden state hₜ₋₁ →
                    </text>

                    {/* Gates */}
                    {[
                      {
                        x: 170,
                        label: "FORGET fₜ",
                        sub: "× keep/drop old memory",
                      },
                      { x: 330, label: "INPUT iₜ", sub: "+ write new memory" },
                      { x: 490, label: "OUTPUT oₜ", sub: "→ reveal as hₜ" },
                    ].map((g, i) => (
                      <g key={i}>
                        <rect
                          x={g.x - 62}
                          y={130}
                          width="124"
                          height="52"
                          rx="4"
                          fill="#FAF9F5"
                          stroke="#DE5D35"
                          strokeWidth="2"
                          className="rnn-gate"
                          style={{ animationDelay: `${i * SLOT}s` }}
                        />
                        <text
                          x={g.x}
                          y={152}
                          fontSize="12"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill="#1A1816"
                          fontWeight="bold"
                          className="rnn-gate"
                          style={{ animationDelay: `${i * SLOT}s` }}
                        >
                          {g.label}
                        </text>
                        <text
                          x={g.x}
                          y={170}
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill="#75716B"
                          className="rnn-gate"
                          style={{ animationDelay: `${i * SLOT}s` }}
                        >
                          {g.sub}
                        </text>
                        {/* Connectors to belts */}
                        <line
                          x1={g.x}
                          y1={g.x === 330 || g.x === 170 ? 88 : 60}
                          x2={g.x}
                          y2={130}
                          stroke="#C9C4BA"
                          strokeWidth="1.5"
                        />
                        <line
                          x1={g.x}
                          y1={182}
                          x2={g.x}
                          y2={270}
                          stroke="#C9C4BA"
                          strokeWidth="1.5"
                        />
                      </g>
                    ))}

                    {/* Input token entering */}
                    <text
                      x="60"
                      y="152"
                      fontSize="11"
                      fontFamily="monospace"
                      fill="#75716B"
                    >
                      xₜ →
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  forget → input → output · three tiny sigmoid decisions per
                  timestep
                </p>
              </div>
            </div>
          </section>

          {/* Section 04: Variants & applications */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                04 / The Family Tree
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                GRU, Bi-RNNs &amp; Where Sequences Live Today
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  name: "Vanilla RNN",
                  desc: "One matrix of weights, no gates. Cheap, fast — but forgets within ~10 steps. Fine for tiny sequences.",
                },
                {
                  name: "GRU",
                  desc: "LSTM's leaner sibling: merges forget+input into one update gate. Nearly as good, 25% fewer parameters.",
                },
                {
                  name: "Bi-RNN",
                  desc: "Two RNNs read the sequence in both directions and concatenate — 'bark' means different things after 'dog' or after 'tree'.",
                },
                {
                  name: "Seq2Seq",
                  desc: "Encoder RNN compresses the input into a vector; decoder RNN generates the output — the blueprint of machine translation.",
                },
              ].map((v) => (
                <div
                  key={v.name}
                  className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15"
                >
                  <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                    {v.name}
                  </span>
                  <p className="text-[12px] text-[#4A4742] leading-[1.6]">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#DE5D35] font-bold mb-2">
                  WHERE RNNS STILL WORK
                </span>
                <ul className="text-[13px] text-[#4A4742] leading-[1.8] list-none space-y-1">
                  <li>· Time-series forecasting (energy, demand, sensors)</li>
                  <li>· Streaming / online inference on devices</li>
                  <li>· Small-data regimes where transformers overfit</li>
                  <li>· Speech frontend features</li>
                </ul>
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                <span className="block text-[11px] font-mono uppercase tracking-widest text-[#1A1816] font-bold mb-2">
                  THE SEQUENTIAL BOTTLENECK
                </span>
                <p className="text-[13px] text-[#4A4742] leading-[1.7]">
                  RNNs must process token <MathTex math="t" /> before token{" "}
                  <MathTex math="t+1" /> — no parallelism across time, and
                  long-range memory still fades. The Transformer (2017) threw
                  away recurrence for self-attention: everything in parallel,
                  every token directly connected to every other. That is the
                  architecture behind GPT — but its attention scores are exactly
                  the weighted sums, sigmoids and softmaxes you have met across
                  Topics 02–09.
                </p>
              </div>
            </div>
          </section>

          {/* Section 05: BPTT mechanics & gradient magnitude */}
          <section className="mb-16 border-t border-[#1A1816]/15 pt-12">
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                05 / Training Mechanics
              </span>
              <h2 className="text-[22px] font-bold text-[#1A1816] mt-0.5">
                Backprop Through Time: One Weight, Many Gradients
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 text-[14px] text-[#4A4742] leading-[1.7] space-y-4">
                <p>
                  Section 02 named the algorithm; here is the mechanism. BPTT is
                  nothing more exotic than{" "}
                  <strong>unrolling the recurrence into a chain</strong> —{" "}
                  <MathTex math="h_1, h_2, \dots, h_T" /> — treating each
                  timestep as an ordinary node, and running the plain
                  backpropagation from Topic 07 on that unrolled graph.
                </p>
                <p>
                  The crucial part is that the copies are not separate
                  parameters. Every cell in the chain is the <em>same</em>{" "}
                  <MathTex math="W_{hh}" />, so its gradient is the{" "}
                  <strong>sum of the contributions from every timestep</strong>:
                </p>
                <div className="p-4 bg-[#FAF9F5] border border-[#1A1816]/15">
                  <span className="block text-[11px] font-mono uppercase text-[#75716B] mb-2">
                    The Shared Weight Accumulates
                  </span>
                  <MathTex
                    math="\frac{\partial L}{\partial W_{hh}} = \sum_{t=1}^{T} \frac{\partial L_t}{\partial W_{hh}}, \quad L = \sum_{t=1}^{T} L_t"
                    block
                  />
                </div>
                <p>
                  Each term is itself a product of local Jacobians travelling
                  back from <MathTex math="t" /> to the end. Multiply long
                  enough and the magnitude of that product decides everything:
                  slightly below 1 and it collapses toward zero (vanishing),
                  slightly above 1 and it blows past the representable range
                  (exploding).
                </p>
                <ul className="space-y-2 text-[13px]">
                  <li>
                    <strong className="text-[#DE5D35]">Exploding</strong> →{" "}
                    <em>gradient clipping</em>: rescale the gradient whenever
                    its norm exceeds a threshold, before the update.
                  </li>
                  <li>
                    <strong className="text-[#DE5D35]">Vanishing</strong> →{" "}
                    <em>gating</em>: an additive cell-state path (LSTM, Topic
                    03) that carries the signal across many steps without
                    repeated multiplication.
                  </li>
                </ul>
              </div>

              {/* Decay vs gated animation */}
              <div className="lg:col-span-7 border border-[#1A1816]/15 bg-[#FAF9F5] p-5">
                <LoopedStyles
                  css={rnnCss}
                  reduceMotionTargets={[
                    ".rnn2-vbar",
                    ".rnn2-gbar",
                    ".rnn2-travel-v",
                    ".rnn2-travel-g",
                  ]}
                />
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#75716B]">
                  <span>GRADIENT MAGNITUDE AT EACH TIMESTEP</span>
                  <span className="font-semibold text-[#DE5D35]">
                    9s loop · vanilla → gated
                  </span>
                </div>
                <div className="bg-[#F4F1EA] border border-[#1A1816]/10 p-3 rounded-[2px]">
                  <Looped
                    label="Animation of the error gradient decaying step by step as it travels backward through an unrolled vanilla RNN, then a gated variant where the bar height stays steady"
                    className="w-full"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 560 300"
                      className="w-full select-none"
                    >
                      <text
                        x="52"
                        y="22"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        VANILLA RNN · product of W_hh and tanh′ &lt; 1
                      </text>
                      <line
                        x1="40"
                        y1="140"
                        x2="540"
                        y2="140"
                        stroke="rgba(26,24,22,0.25)"
                        strokeWidth="1"
                      />
                      {Array.from({ length: 5 }, (_, j) => {
                        const i = 4 - j;
                        const h = GRAD[i] * 95;
                        return (
                          <rect
                            key={`v-${j}`}
                            className={`rnn2-vbar rnn2-v${i}`}
                            x={52 + j * 108}
                            y={140 - h}
                            width="44"
                            height={h}
                            fill="#EF4444"
                          />
                        );
                      })}
                      {Array.from({ length: 5 }, (_, j) => (
                        <text
                          key={`vt-${j}`}
                          x={74 + j * 108}
                          y="158"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill="#75716B"
                        >
                          t={j + 1}
                        </text>
                      ))}
                      <circle
                        className="rnn2-travel-v"
                        cx="506"
                        cy="112"
                        r="6"
                        fill="#EF4444"
                      />

                      <text
                        x="52"
                        y="185"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill="#1A1816"
                      >
                        LSTM / GATED · additive cell state holds the signal
                      </text>
                      <line
                        x1="40"
                        y1="265"
                        x2="540"
                        y2="265"
                        stroke="rgba(26,24,22,0.25)"
                        strokeWidth="1"
                      />
                      {Array.from({ length: 5 }, (_, j) => {
                        const i = 4 - j;
                        return (
                          <rect
                            key={`g-${j}`}
                            className={`rnn2-gbar rnn2-g${i}`}
                            x={52 + j * 108}
                            y={265 - 72}
                            width="44"
                            height="72"
                            fill="#DE5D35"
                          />
                        );
                      })}
                      {Array.from({ length: 5 }, (_, j) => (
                        <text
                          key={`gt-${j}`}
                          x={74 + j * 108}
                          y="283"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill="#75716B"
                        >
                          t={j + 1}
                        </text>
                      ))}
                      <circle
                        className="rnn2-travel-g"
                        cx="506"
                        cy="232"
                        r="6"
                        fill="#DE5D35"
                      />
                    </svg>
                  </Looped>
                </div>
                <p className="text-[11px] font-mono text-[#75716B] text-center mt-3 uppercase tracking-wider">
                  vanilla bars shrink toward t=1 · gated bars stay level ·
                  signal sweeps right to left
                </p>
              </div>
            </div>
          </section>

          {/* Navigation Footer */}
          <div className="border-t border-[#1A1816]/15 pt-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/resources/convolutional-networks"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#75716B] hover:text-[#1A1816] transition-colors"
            >
              <span>← Topic 08: Convolutional Networks</span>
            </Link>
            <Link
              href="/resources/random-forest"
              className="inline-flex items-center gap-2 text-[12px] font-mono text-[#DE5D35] font-bold hover:underline"
            >
              <span>Topic 10: Random Forests →</span>
            </Link>
          </div>
        </div>
      </main>
    </FoldLayout>
  );
}
