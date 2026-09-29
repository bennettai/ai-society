"use client";

import { useMemo } from "react";
import type { DataPoint, NetworkStepTrace } from "@/lib/neural-network-engine";

interface BackpropPlotsProps {
  data: DataPoint[];
  predictions: { x: number; y: number }[];
  lossHistory: number[];
  currentEpoch: number;
  currentLoss: number;
  stepTrace: NetworkStepTrace | null;
  animationPhase: "idle" | "forward" | "loss" | "backward" | "update";
}

export default function BackpropPlots({
  data,
  predictions,
  lossHistory,
  currentEpoch,
  currentLoss,
  stepTrace,
  animationPhase,
}: BackpropPlotsProps) {
  // ── Plot 1: Scatter Plot & Fitted Curve Layout ──────────────────────
  const scatterConfig = useMemo(() => {
    const width = 380;
    const height = 260;
    const padding = { top: 20, right: 24, bottom: 32, left: 38 };

    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    // Domain [-5, 5] -> Range
    const scaleX = (x: number) => padding.left + ((x + 5) / 10) * innerW;
    const scaleY = (y: number) => padding.top + ((5 - y) / 10) * innerH;

    // Build path for predictions curve
    let curvePath = "";
    if (predictions.length > 0) {
      curvePath = predictions.reduce((acc, pt, idx) => {
        const sx = scaleX(pt.x);
        const sy = scaleY(pt.y);
        return idx === 0
          ? `M ${sx.toFixed(1)} ${sy.toFixed(1)}`
          : `${acc} L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
      }, "");
    }

    return { width, height, padding, scaleX, scaleY, curvePath };
  }, [predictions]);

  // ── Plot 2: Loss History Curve Layout ──────────────────────────────
  const lossConfig = useMemo(() => {
    const width = 380;
    const height = 180;
    const padding = { top: 20, right: 24, bottom: 32, left: 42 };

    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const maxEpoch = Math.max(50, currentEpoch, lossHistory.length);
    // Dynamic max loss calculation
    const maxLossVal = Math.max(1.0, ...lossHistory.slice(0, 10));

    const scaleX = (epoch: number) =>
      padding.left + (epoch / maxEpoch) * innerW;
    const scaleY = (loss: number) =>
      padding.top + (1 - Math.min(1, Math.max(0, loss / maxLossVal))) * innerH;

    let lossPath = "";
    if (lossHistory.length > 0) {
      lossPath = lossHistory.reduce((acc, loss, idx) => {
        const sx = scaleX(idx);
        const sy = scaleY(loss);
        return idx === 0
          ? `M ${sx.toFixed(1)} ${sy.toFixed(1)}`
          : `${acc} L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
      }, "");
    }

    return {
      width,
      height,
      padding,
      scaleX,
      scaleY,
      lossPath,
      maxLossVal,
      maxEpoch,
    };
  }, [lossHistory, currentEpoch]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── 1. Function Fit & Scatter Plot ──────────────────────────── */}
      <div className="bg-[#FAF9F5] border border-[#1A1816]/20 p-3 rounded-[2px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#75716B]">
            01 / FIT FUNCTION · ŷ(x)
          </span>
          <span className="text-[10px] font-mono text-[#1A1816] font-semibold">
            N={data.length} pts
          </span>
        </div>

        <svg
          role="img"
          aria-label="Fitted function ŷ(x) against the training data"
          viewBox={`0 0 ${scatterConfig.width} ${scatterConfig.height}`}
          className="w-full h-auto"
        >
          {/* Background grid */}
          <rect
            x={scatterConfig.padding.left}
            y={scatterConfig.padding.top}
            width={
              scatterConfig.width -
              scatterConfig.padding.left -
              scatterConfig.padding.right
            }
            height={
              scatterConfig.height -
              scatterConfig.padding.top -
              scatterConfig.padding.bottom
            }
            fill="#F4F1EA"
            stroke="rgba(26,24,22,0.12)"
            strokeWidth="1"
          />

          {/* Zero axes */}
          <line
            x1={scatterConfig.scaleX(-5)}
            y1={scatterConfig.scaleY(0)}
            x2={scatterConfig.scaleX(5)}
            y2={scatterConfig.scaleY(0)}
            stroke="rgba(26,24,22,0.25)"
            strokeDasharray="2 2"
          />
          <line
            x1={scatterConfig.scaleX(0)}
            y1={scatterConfig.scaleY(-5)}
            x2={scatterConfig.scaleX(0)}
            y2={scatterConfig.scaleY(5)}
            stroke="rgba(26,24,22,0.25)"
            strokeDasharray="2 2"
          />

          {/* Axis labels */}
          <text
            x={scatterConfig.scaleX(-5)}
            y={scatterConfig.height - 10}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            -5
          </text>
          <text
            x={scatterConfig.scaleX(0) - 3}
            y={scatterConfig.height - 10}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            0
          </text>
          <text
            x={scatterConfig.scaleX(5) - 10}
            y={scatterConfig.height - 10}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            5
          </text>
          <text
            x="8"
            y={scatterConfig.scaleY(5) + 3}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            +5
          </text>
          <text
            x="12"
            y={scatterConfig.scaleY(0) + 3}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            0
          </text>
          <text
            x="10"
            y={scatterConfig.scaleY(-5) + 3}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            -5
          </text>

          {/* Dataset Scatter Points */}
          {data.map((pt, i) => {
            const cx = Number(scatterConfig.scaleX(pt.x).toFixed(2));
            const cy = Number(scatterConfig.scaleY(pt.y).toFixed(2));
            const isTraced = stepTrace && stepTrace.exampleIndex === i;

            return (
              <circle
                // biome-ignore lint/suspicious/noArrayIndexKey: point i is dataset example i (matched against stepTrace.exampleIndex)
                key={`dot-${i}`}
                cx={cx}
                cy={cy}
                r={isTraced ? "5" : "3"}
                fill={isTraced ? "#DE5D35" : "#1A1816"}
                opacity={isTraced ? 1 : 0.7}
                stroke={isTraced ? "#1A1816" : "none"}
                strokeWidth={isTraced ? "1.8" : "0"}
              />
            );
          })}

          {/* Neural Network Continuous Prediction Curve */}
          {scatterConfig.curvePath && (
            <path
              d={scatterConfig.curvePath}
              fill="none"
              stroke="#1A1816"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active sample residual line & prediction point in step animation */}
          {stepTrace &&
            (animationPhase === "loss" ||
              animationPhase === "backward" ||
              animationPhase === "update") && (
              <g>
                {/* Residual line connecting target y to prediction ŷ */}
                <line
                  x1={scatterConfig.scaleX(stepTrace.input)}
                  y1={scatterConfig.scaleY(stepTrace.target)}
                  x2={scatterConfig.scaleX(stepTrace.input)}
                  y2={scatterConfig.scaleY(stepTrace.output)}
                  stroke="#DE5D35"
                  strokeWidth="2.2"
                  strokeDasharray="3 2"
                />
                {/* Prediction dot on the curve */}
                <circle
                  cx={scatterConfig.scaleX(stepTrace.input)}
                  cy={scatterConfig.scaleY(stepTrace.output)}
                  r="4.5"
                  fill="#DE5D35"
                  stroke="#FAF9F5"
                  strokeWidth="2"
                />

                {/* Projected dot if in update phase */}
                {animationPhase === "update" && (
                  <circle
                    cx={scatterConfig.scaleX(stepTrace.input)}
                    cy={scatterConfig.scaleY(stepTrace.projectedOutput)}
                    r="4.5"
                    fill="#1E7E56"
                    stroke="#FAF9F5"
                    strokeWidth="2"
                  />
                )}
              </g>
            )}
        </svg>
      </div>

      {/* ── 2. Loss Curve ───────────────────────────────────────────── */}
      <div className="bg-[#FAF9F5] border border-[#1A1816]/20 p-4 rounded-[2px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B]">
            02 / LOSS HISTORY · MSE
          </span>
          <span
            className="text-[12px] font-mono text-[#DE5D35] font-bold"
            suppressHydrationWarning
          >
            {currentLoss.toFixed(6)}
          </span>
        </div>

        <svg
          role="img"
          aria-label="Loss history (MSE) over training"
          viewBox={`0 0 ${lossConfig.width} ${lossConfig.height}`}
          className="w-full h-auto"
        >
          {/* Background */}
          <rect
            x={lossConfig.padding.left}
            y={lossConfig.padding.top}
            width={
              lossConfig.width -
              lossConfig.padding.left -
              lossConfig.padding.right
            }
            height={
              lossConfig.height -
              lossConfig.padding.top -
              lossConfig.padding.bottom
            }
            fill="#F4F1EA"
            stroke="rgba(26,24,22,0.12)"
            strokeWidth="1"
          />

          {/* Grid rules */}
          <line
            x1={lossConfig.padding.left}
            y1={lossConfig.scaleY(lossConfig.maxLossVal * 0.5)}
            x2={lossConfig.width - lossConfig.padding.right}
            y2={lossConfig.scaleY(lossConfig.maxLossVal * 0.5)}
            stroke="rgba(26,24,22,0.15)"
            strokeDasharray="2 2"
          />

          {/* Axis Labels */}
          <text
            x={lossConfig.padding.left}
            y={lossConfig.height - 10}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            0
          </text>
          <text
            x={lossConfig.scaleX(lossConfig.maxEpoch * 0.5) - 8}
            y={lossConfig.height - 10}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            {Math.round(lossConfig.maxEpoch * 0.5)}
          </text>
          <text
            x={lossConfig.width - lossConfig.padding.right - 14}
            y={lossConfig.height - 10}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            {lossConfig.maxEpoch}
          </text>
          <text
            x="6"
            y={lossConfig.scaleY(lossConfig.maxLossVal) + 4}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            {lossConfig.maxLossVal.toFixed(1)}
          </text>
          <text
            x="14"
            y={lossConfig.scaleY(0) + 3}
            fontSize="10"
            fontFamily="monospace"
            fill="#75716B"
          >
            0
          </text>

          {/* Loss Line Path */}
          {lossConfig.lossPath && (
            <path
              d={lossConfig.lossPath}
              fill="none"
              stroke="#1A1816"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          )}

          {/* Latest Loss Indicator Pulse */}
          {lossHistory.length > 0 && (
            <circle
              cx={lossConfig.scaleX(lossHistory.length - 1)}
              cy={lossConfig.scaleY(lossHistory[lossHistory.length - 1])}
              r="4.5"
              fill="#DE5D35"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
