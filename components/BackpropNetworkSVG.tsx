"use client";

import { useMemo } from "react";
import type { NetworkStepTrace } from "@/lib/neural-network-engine";

interface BackpropNetworkSVGProps {
  shape: number[];
  weights: number[][][];
  biases: number[][];
  stepTrace: NetworkStepTrace | null;
  animationPhase: "idle" | "forward" | "loss" | "backward" | "update";
  activeLayerIdx: number;
  isPlaying?: boolean;
  width?: number;
  height?: number;
  onHoverInfo?: (info: string | null) => void;
}

export default function BackpropNetworkSVG({
  shape,
  weights,
  biases: _biases,
  stepTrace,
  animationPhase,
  activeLayerIdx,
  isPlaying = false,
  width = 860,
  height = 550,
  onHoverInfo,
}: BackpropNetworkSVGProps) {
  // Layout node coordinates
  const nodeLayout = useMemo(() => {
    const squareSize = 34;
    const paddingX = 60;
    const paddingY = 42;
    const availableWidth = width - paddingX * 2 - 100; // leave space for loss node
    const availableHeight = height - paddingY * 2;

    const layersCount = shape.length;
    const layerStepX = availableWidth / (layersCount - 1);

    const layers: {
      x: number;
      y: number;
      layerIdx: number;
      nodeIdx: number;
    }[][] = [];

    // Spacing between nodes in a layer
    const maxNodes = Math.max(...shape);
    const nodeGapY = Math.min(
      62,
      availableHeight / (maxNodes > 1 ? maxNodes - 1 : 1),
    );

    for (let l = 0; l < layersCount; l++) {
      const nodeCount = shape[l];
      const layerNodes: {
        x: number;
        y: number;
        layerIdx: number;
        nodeIdx: number;
      }[] = [];
      const x = paddingX + l * layerStepX;

      // Center nodes vertically
      const totalNodeHeight = (nodeCount - 1) * nodeGapY;
      const startY = height / 2 - totalNodeHeight / 2;

      for (let n = 0; n < nodeCount; n++) {
        const y = nodeCount === 1 ? height / 2 : startY + n * nodeGapY;
        layerNodes.push({ x, y, layerIdx: l, nodeIdx: n });
      }
      layers.push(layerNodes);
    }

    return { layers, squareSize };
  }, [shape, width, height]);

  // Interpolate weight color: Negative = Terracotta/Crimson (#D62839), Zero = #CBD5E1, Positive = Steel Teal (#2B6CB0)
  const getWeightColor = (weight: number) => {
    const clamped = Math.max(-2, Math.min(2, weight)) / 2; // -1 to 1
    if (clamped < 0) {
      // Interpolate from neutral (#CBD5E1) to crimson (#D62839)
      const t = -clamped;
      const r = Math.round(203 + t * (214 - 203));
      const g = Math.round(213 + t * (40 - 213));
      const b = Math.round(225 + t * (57 - 225));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Interpolate from neutral (#CBD5E1) to steel teal (#2B6CB0)
      const t = clamped;
      const r = Math.round(203 + t * (43 - 203));
      const g = Math.round(213 + t * (108 - 213));
      const b = Math.round(225 + t * (176 - 225));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Node activation fill color: from #FAF9F5 (0 activation) to #1A1816 (high activation)
  const getNodeFill = (layerIdx: number, nodeIdx: number) => {
    if (layerIdx === 0) {
      // Input neuron: neutral warm slate
      return "#8C827A";
    }
    if (layerIdx === shape.length - 1) {
      // Linear output neuron: editorial slate blue
      return "#316B83";
    }

    // Hidden ReLU neuron: map activation to darkness
    let activation = 0;
    if (stepTrace?.activations[layerIdx]) {
      activation = stepTrace.activations[layerIdx][nodeIdx] || 0;
    }

    // Normalize activation ~ 0 to 3
    const norm = Math.min(1, Math.max(0, activation / 2.5));
    const r = Math.round(250 - norm * (250 - 26));
    const g = Math.round(249 - norm * (249 - 24));
    const b = Math.round(245 - norm * (245 - 22));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const outputNode = nodeLayout.layers[shape.length - 1]?.[0];
  const lossNodeX = outputNode ? outputNode.x + 72 : width - 45;
  const lossNodeY = outputNode ? outputNode.y + 55 : height / 2 + 55;

  return (
    <div className="relative select-none w-full">
      <svg
        role="img"
        aria-label="Neural network diagram showing weights, activations and gradients"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-h-[560px] overflow-visible"
      >
        <defs>
          {/* Arrow markers for gradient directions */}
          <marker
            id="arrowUp"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 5 1 L 9 9 L 1 9 Z" fill="#1E7E56" />
          </marker>
          <marker
            id="arrowDown"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 5 9 L 9 1 L 1 1 Z" fill="#DE5D35" />
          </marker>

          {/* Glowing pulse filter for active training phase */}
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Active Training HUD Indicator ────────────────────────── */}
        {isPlaying && (
          <g transform="translate(60, 24)">
            <circle
              cx="0"
              cy="0"
              r="4"
              fill="#DE5D35"
              className="animate-ping opacity-75"
            />
            <circle cx="0" cy="0" r="3.5" fill="#DE5D35" />
            <text
              x="12"
              y="4"
              fontSize="11"
              fontFamily="var(--font-mono, monospace)"
              fontWeight="700"
              fill="#DE5D35"
              letterSpacing="0.05em"
            >
              LIVE NEURAL SYNAPSE ENERGY FLOW · ADAM (LR: 0.001)
            </text>
          </g>
        )}

        {/* ── 1. Synaptic Links (Bezier Splines) ────────────────────── */}
        <g id="synaptic-links">
          {weights.map((layerWeights, lIdx) => {
            const fromNodes = nodeLayout.layers[lIdx];
            const toNodes = nodeLayout.layers[lIdx + 1];
            if (!fromNodes || !toNodes) return null;

            const isLayerActiveForward =
              isPlaying ||
              (animationPhase === "forward" &&
                (activeLayerIdx === lIdx || activeLayerIdx === lIdx + 1));
            const isLayerActiveBackward =
              animationPhase === "backward" &&
              (activeLayerIdx === lIdx || activeLayerIdx === lIdx + 1);

            return layerWeights.flatMap((toWeights, toIdx) => {
              const toNode = toNodes[toIdx];
              if (!toNode) return [];

              return toWeights.map((w, fromIdx) => {
                const fromNode = fromNodes[fromIdx];
                if (!fromNode) return null;

                const linkKey = `link-${lIdx}-${fromIdx}-${toIdx}`;
                const strokeColor = getWeightColor(w);
                const strokeWidth = Math.max(
                  0.85,
                  Math.min(3.8, 0.75 + Math.abs(w) * 1.3),
                );

                // Cubic horizontal bezier curve
                const midX = (fromNode.x + toNode.x) / 2;
                const pathD = `M ${fromNode.x} ${fromNode.y} C ${midX} ${fromNode.y}, ${midX} ${toNode.y}, ${toNode.x} ${toNode.y}`;

                let strokeDash = "none";
                let strokeClass = "";

                if (isLayerActiveForward) {
                  strokeDash = "6 4";
                  strokeClass = "animate-dash-forward";
                } else if (isLayerActiveBackward) {
                  strokeDash = "6 4";
                  strokeClass = "animate-dash-backward";
                }

                return (
                  // biome-ignore lint/a11y/noStaticElementInteractions: hover-only readout on diagram marks; making every mark a tab stop would swamp keyboard users
                  <path
                    key={linkKey}
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    className={`transition-all duration-300 ${strokeClass}`}
                    opacity={isPlaying ? 0.95 : 0.85}
                    onMouseEnter={() => {
                      const grad =
                        stepTrace?.weightGradients?.[lIdx]?.[toIdx]?.[fromIdx];
                      const gradStr =
                        grad !== undefined
                          ? `, ∂L/∂w = ${grad.toFixed(4)}`
                          : "";
                      const msg = `Weight [L${lIdx}→L${lIdx + 1}] N${fromIdx}→N${toIdx}: w = ${w.toFixed(3)}${gradStr}`;
                      onHoverInfo?.(msg);
                    }}
                    onMouseLeave={() => {
                      onHoverInfo?.(null);
                    }}
                  />
                );
              });
            });
          })}
        </g>

        {/* ── 2. Loss Node Connections ─────────────────────────────── */}
        {outputNode && (
          <g id="loss-connections">
            {/* Output to Loss spline */}
            <path
              d={`M ${outputNode.x} ${outputNode.y} C ${outputNode.x + 30} ${outputNode.y}, ${lossNodeX - 25} ${lossNodeY}, ${lossNodeX} ${lossNodeY}`}
              fill="none"
              stroke={
                isPlaying || animationPhase === "loss" ? "#DE5D35" : "#1A1816"
              }
              strokeWidth={
                isPlaying || animationPhase === "loss" ? "2.2" : "1.2"
              }
              strokeDasharray={
                isPlaying || animationPhase === "loss" ? "4 4" : "none"
              }
              className={
                isPlaying || animationPhase === "loss"
                  ? "animate-dash-forward"
                  : ""
              }
            />

            {/* Loss Box */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: hover-only readout on diagram marks; making every mark a tab stop would swamp keyboard users */}
            <g
              transform={`translate(${lossNodeX - 22}, ${lossNodeY - 18})`}
              className="cursor-pointer"
              onMouseEnter={() => {
                const lossVal = stepTrace ? stepTrace.loss.toFixed(4) : "—";
                const msg = `Loss Node: MSE = 1/2(ŷ - y)², current sample error = ${lossVal}`;
                onHoverInfo?.(msg);
              }}
              onMouseLeave={() => {
                onHoverInfo?.(null);
              }}
            >
              <rect
                width="44"
                height="36"
                rx="2"
                fill={
                  isPlaying || animationPhase === "loss" ? "#FAF0E8" : "#FAF9F5"
                }
                stroke={
                  isPlaying || animationPhase === "loss" ? "#DE5D35" : "#1A1816"
                }
                strokeWidth={
                  isPlaying || animationPhase === "loss" ? "2.5" : "1.6"
                }
                className="transition-colors duration-200"
              />
              <text
                x="22"
                y="23"
                textAnchor="middle"
                fontSize="13"
                fontFamily="var(--font-mono, monospace)"
                fontWeight="700"
                fill={
                  isPlaying || animationPhase === "loss" ? "#DE5D35" : "#1A1816"
                }
              >
                loss
              </text>
            </g>
          </g>
        )}

        {/* ── 3. Neurons (Rectangles with crisp Swiss borders) ───────── */}
        <g id="neuron-nodes">
          {nodeLayout.layers.map((layerNodes, lIdx) => {
            const isInput = lIdx === 0;
            const isOutput = lIdx === shape.length - 1;
            const isCurrentActive =
              (animationPhase === "forward" || animationPhase === "backward") &&
              activeLayerIdx === lIdx;

            return layerNodes.map((node) => {
              const nodeKey = `node-${lIdx}-${node.nodeIdx}`;
              const fill = getNodeFill(lIdx, node.nodeIdx);
              const halfSize = nodeLayout.squareSize / 2;

              // Direction arrow for this node if in trace
              const dir =
                stepTrace?.nodeDirections?.[lIdx]?.[node.nodeIdx] || 0;

              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: hover-only readout on diagram marks; making every mark a tab stop would swamp keyboard users
                <g
                  key={nodeKey}
                  transform={`translate(${node.x - halfSize}, ${node.y - halfSize})`}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    let text = "";
                    if (isInput) {
                      text = `Input Neuron: x = ${stepTrace?.input.toFixed(3) ?? "—"}`;
                    } else if (isOutput) {
                      text = `Linear Output Neuron: ŷ = ${stepTrace?.output.toFixed(3) ?? "—"}, target y = ${stepTrace?.target.toFixed(3) ?? "—"}`;
                    } else {
                      const act =
                        stepTrace?.activations[lIdx]?.[node.nodeIdx]?.toFixed(
                          3,
                        ) ?? "—";
                      const pre =
                        stepTrace?.preActivations[lIdx]?.[
                          node.nodeIdx
                        ]?.toFixed(3) ?? "—";
                      const d =
                        stepTrace?.deltas[lIdx]?.[node.nodeIdx]?.toFixed(4) ??
                        "—";
                      text = `Hidden Layer ${lIdx}, Node ${node.nodeIdx}: ReLU(z) = ${act} (pre-activation z = ${pre}), delta = ${d}`;
                    }
                    onHoverInfo?.(text);
                  }}
                  onMouseLeave={() => {
                    onHoverInfo?.(null);
                  }}
                >
                  {/* Neuron Square */}
                  <rect
                    width={nodeLayout.squareSize}
                    height={nodeLayout.squareSize}
                    rx="2"
                    fill={fill}
                    stroke={
                      isCurrentActive
                        ? "#DE5D35"
                        : isPlaying
                          ? isOutput
                            ? "#316B83"
                            : isInput
                              ? "#8C827A"
                              : "#DE5D35"
                          : "#1A1816"
                    }
                    strokeWidth={
                      isCurrentActive ? "2.6" : isPlaying ? "2.0" : "1.6"
                    }
                    className="transition-all duration-200"
                    filter={
                      isCurrentActive || isPlaying
                        ? "url(#subtleGlow)"
                        : undefined
                    }
                  />

                  {/* Node label inside (for input/output) */}
                  {isInput && (
                    <text
                      x={halfSize}
                      y={halfSize + 4.5}
                      textAnchor="middle"
                      fontSize="13"
                      fontFamily="var(--font-mono, monospace)"
                      fontWeight="700"
                      fill="#FAF9F5"
                    >
                      x
                    </text>
                  )}

                  {isOutput && (
                    <text
                      x={halfSize}
                      y={halfSize + 4.5}
                      textAnchor="middle"
                      fontSize="13"
                      fontFamily="var(--font-mono, monospace)"
                      fontWeight="700"
                      fill="#FAF9F5"
                    >
                      ŷ
                    </text>
                  )}

                  {/* Gradient Direction Indicator Arrow on node during backward/loss phase */}
                  {(animationPhase === "backward" ||
                    animationPhase === "loss" ||
                    animationPhase === "update") &&
                    dir !== 0 && (
                      <g
                        transform={`translate(${halfSize}, ${dir === 1 ? -10 : nodeLayout.squareSize + 10})`}
                      >
                        {dir === 1 ? (
                          // Increase arrow (Green Up)
                          <g>
                            <line
                              x1="0"
                              y1="6"
                              x2="0"
                              y2="-6"
                              stroke="#1E7E56"
                              strokeWidth="2.5"
                            />
                            <polygon points="-4,-2 0,-8 4,-2" fill="#1E7E56" />
                          </g>
                        ) : (
                          // Decrease arrow (Terracotta Down)
                          <g>
                            <line
                              x1="0"
                              y1="-6"
                              x2="0"
                              y2="6"
                              stroke="#DE5D35"
                              strokeWidth="2.5"
                            />
                            <polygon points="-4,2 0,8 4,2" fill="#DE5D35" />
                          </g>
                        )}
                      </g>
                    )}
                </g>
              );
            });
          })}
        </g>
      </svg>

      {/* CSS Keyframe animations for flowing dashes */}
      <style>{`
        @keyframes dashForward {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes dashBackward {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: 24;
          }
        }
        .animate-dash-forward {
          animation: dashForward 0.65s linear infinite !important;
        }
        .animate-dash-backward {
          animation: dashBackward 0.65s linear infinite !important;
        }
      `}</style>
    </div>
  );
}
