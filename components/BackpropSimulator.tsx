"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type DataPoint,
  type DatasetType,
  generateDataset,
  type NetworkStepTrace,
  NeuralNetworkEngine,
} from "@/lib/neural-network-engine";
import BackpropNetworkSVG from "./BackpropNetworkSVG";
import BackpropPlots from "./BackpropPlots";

export default function BackpropSimulator() {
  // ── Network Hyperparameters & Architecture ─────────────────────────
  const [shape, setShape] = useState<number[]>([1, 8, 8, 8, 1]);
  const [lr, setLr] = useState<number>(0.001);
  const [datasetType, setDatasetType] = useState<DatasetType>("sin");

  // ── Engine Instance Ref (persists across renders) ───────────────────
  const engineRef = useRef<NeuralNetworkEngine>(
    new NeuralNetworkEngine([1, 8, 8, 8, 1], 0.001),
  );

  // ── Training State ──────────────────────────────────────────────────
  const [dataset, setDataset] = useState<DataPoint[]>(() =>
    generateDataset("sin", 48),
  );
  const [epoch, setEpoch] = useState<number>(0);
  const [loss, setLoss] = useState<number>(() =>
    engineRef.current.computeLoss(generateDataset("sin", 48)),
  );
  const [lossHistory, setLossHistory] = useState<number[]>(() => [
    engineRef.current.computeLoss(generateDataset("sin", 48)),
  ]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trainSpeed] = useState<number>(2); // epochs per frame tick

  // Weights & biases state for reactive SVG rendering
  const [weightsState, setWeightsState] = useState<number[][][]>(() =>
    engineRef.current.weights.map((l) => l.map((r) => [...r])),
  );
  const [biasesState, setBiasesState] = useState<number[][]>(() =>
    engineRef.current.biases.map((r) => [...r]),
  );

  // Predictions curve data points for the scatter plot
  const [predictions, setPredictions] = useState<{ x: number; y: number }[]>(
    [],
  );

  // ── Step-by-Step Animation State ("Animate Epoch N") ────────────────
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "forward" | "loss" | "backward" | "update"
  >("idle");
  const [activeLayerIdx, setActiveLayerIdx] = useState<number>(-1);
  const [stepTrace, setStepTrace] = useState<NetworkStepTrace | null>(null);

  // ── Hover Detail Feedback ──────────────────────────────────────────
  const [hoverDetail, setHoverDetail] = useState<string | null>(null);

  // ── Help Dialog State ──────────────────────────────────────────────
  const [activeHelpModal, setActiveHelpModal] = useState<
    "control" | "network" | "customization" | null
  >(null);

  // ── Evaluation & Curve Computation ─────────────────────────────────
  const updatePredictions = useCallback(() => {
    const testPoints: number[] = [];
    const minX = -5.0;
    const maxX = 5.0;
    const resolution = 90;
    const step = (maxX - minX) / (resolution - 1);
    for (let i = 0; i < resolution; i++) {
      testPoints.push(minX + i * step);
    }
    const preds = engineRef.current.predict(testPoints);
    setPredictions(testPoints.map((x, i) => ({ x, y: preds[i] })));
  }, []);

  // Sync state whenever dataset changes
  const handleDatasetChange = (newType: DatasetType) => {
    setDatasetType(newType);
    const newPts = generateDataset(newType, 48);
    setDataset(newPts);
    handleReset(shape, lr, newPts);
  };

  // Reset / Reinitialize Network
  const handleReset = (newShape = shape, newLr = lr, currentData = dataset) => {
    setIsPlaying(false);
    setIsAnimating(false);
    setAnimationPhase("idle");
    setActiveLayerIdx(-1);
    setStepTrace(null);

    engineRef.current = new NeuralNetworkEngine(newShape, newLr);
    setShape([...newShape]);
    setLr(newLr);
    setEpoch(0);

    const initialLoss = engineRef.current.computeLoss(currentData);
    setLoss(initialLoss);
    setLossHistory([initialLoss]);

    setWeightsState(engineRef.current.weights.map((l) => l.map((r) => [...r])));
    setBiasesState(engineRef.current.biases.map((r) => [...r]));
    updatePredictions();
  };

  // Adjust Hidden Layers (+ / -)
  const handleAddLayer = () => {
    if (shape.length >= 6) return; // Max 4 hidden layers
    const newShape = [1, ...new Array(shape.length - 1).fill(8), 1];
    handleReset(newShape, lr, dataset);
  };

  const handleRemoveLayer = () => {
    if (shape.length <= 3) return; // Min 1 hidden layer
    const newShape = [1, ...new Array(shape.length - 3).fill(8), 1];
    handleReset(newShape, lr, dataset);
  };

  // Adjust Learning Rate
  const handleLearningRateChange = (newLr: number) => {
    setLr(newLr);
    engineRef.current.learningRate = newLr;
  };

  // Single Epoch Step
  const handleStepEpoch = useCallback(() => {
    if (isAnimating) return;
    const l = engineRef.current.trainEpoch(dataset, lr);
    setEpoch((prev) => {
      const next = prev + 1;
      setLoss(l);
      setLossHistory((h) =>
        h.length > 200 ? [...h.slice(h.length - 199), l] : [...h, l],
      );
      return next;
    });
    setWeightsState(
      engineRef.current.weights.map((layer) => layer.map((r) => [...r])),
    );
    setBiasesState(engineRef.current.biases.map((r) => [...r]));
    updatePredictions();
  }, [dataset, lr, isAnimating, updatePredictions]);

  // Continuous Training Loop (requestAnimationFrame)
  useEffect(() => {
    if (!isPlaying || isAnimating) return;

    let animFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      // Limit updates to smooth ~30-60fps intervals
      if (currentTime - lastTime >= 35) {
        lastTime = currentTime;
        // Run trainSpeed batch epochs per tick
        for (let i = 0; i < trainSpeed; i++) {
          const l = engineRef.current.trainEpoch(dataset, lr);
          setEpoch((prev) => {
            const next = prev + 1;
            setLoss(l);
            setLossHistory((h) =>
              h.length > 180 ? [...h.slice(h.length - 179), l] : [...h, l],
            );
            return next;
          });
        }
        setWeightsState(
          engineRef.current.weights.map((layer) => layer.map((r) => [...r])),
        );
        setBiasesState(engineRef.current.biases.map((r) => [...r]));
        updatePredictions();
      }
      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, [isPlaying, isAnimating, dataset, lr, trainSpeed, updatePredictions]);

  // Initial mount computation
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial mount setup
  useEffect(() => {
    handleReset(shape, lr, dataset);
  }, []);

  // ── Step-by-Step Backpropagation Walkthrough Animation ──────────────
  const handleAnimateEpoch = async () => {
    if (isAnimating) return;
    setIsPlaying(false);
    setIsAnimating(true);

    // 1. Choose a random sample from the dataset to trace
    const randomIdx = Math.floor(Math.random() * dataset.length);
    const trace = engineRef.current.traceSingleStep(randomIdx, dataset, lr);
    setStepTrace(trace);

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Phase 1: Forward Pass (layer by layer)
    setAnimationPhase("forward");
    for (let l = 0; l < shape.length; l++) {
      setActiveLayerIdx(l);
      await sleep(350);
    }

    // Phase 2: Loss Node calculation & direction evaluation
    setAnimationPhase("loss");
    setActiveLayerIdx(shape.length - 1);
    await sleep(750);

    // Phase 3: Backpropagation (chain rule reverse ripple)
    setAnimationPhase("backward");
    for (let l = shape.length - 1; l >= 0; l--) {
      setActiveLayerIdx(l);
      await sleep(420);
    }
    setActiveLayerIdx(-1);

    // Phase 4: Weight Update & Projected Change
    setAnimationPhase("update");
    await sleep(750);

    // Actually commit the single training step to update parameters
    engineRef.current.trainEpoch([dataset[randomIdx]], lr);
    setEpoch((prev) => prev + 1);
    setLoss(trace.projectedLoss);
    setLossHistory((h) => [...h, trace.projectedLoss]);
    setWeightsState(
      engineRef.current.weights.map((layer) => layer.map((r) => [...r])),
    );
    setBiasesState(engineRef.current.biases.map((r) => [...r]));
    updatePredictions();

    await sleep(600);
    setAnimationPhase("idle");
    setIsAnimating(false);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full bg-[#FAF9F5] border border-[#1A1816]/15 rounded-[2px] p-12 flex flex-col items-center justify-center min-h-[580px] text-[#75716B] font-mono text-sm">
        <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#DE5D35] rounded-full animate-spin mb-4" />
        <p className="tracking-widest uppercase text-[12px] font-bold text-[#1A1816]">
          INITIALIZING BACKPROPAGATION ENGINE
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF9F5] border border-[#1A1816] rounded-[2px] p-4 sm:p-7 relative font-sans">
      {/* ── Top Header & Legend Bar ─────────────────────────────────── */}
      <div className="border-b border-[#1A1816]/15 pb-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#DE5D35]" />
            <h3 className="text-[14px] font-mono font-bold tracking-[0.16em] uppercase text-[#1A1816]">
              INTERACTIVE BACKPROPAGATION SIMULATOR
            </h3>
            <button
              type="button"
              onClick={() => setActiveHelpModal("network")}
              className="w-5 h-5 rounded-full border border-[#1A1816]/40 flex items-center justify-center text-[11px] font-mono text-[#75716B] hover:text-[#1A1816] hover:border-[#1A1816] transition-colors cursor-pointer"
              title="Click for architectural guide"
            >
              ?
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#75716B]">
            VISxAI Architecture · Swiss Minimalist Layout
          </div>
        </div>

        {/* Legend Row matching reference */}
        <div className="mt-4 pt-3 border-t border-[#1A1816]/10 flex flex-wrap items-center gap-y-3 gap-x-6 text-[11px] font-mono text-[#1A1816]">
          {/* Input Neuron */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[1px] bg-[#8C827A] border border-[#1A1816]/30 inline-block" />
            <span className="text-[#75716B]">Input Neuron</span>
          </div>

          {/* ReLU Neuron */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[1px] bg-[#3B3835] border border-[#1A1816] inline-block" />
            <span className="text-[#75716B]">ReLU Neuron</span>
          </div>

          {/* Linear Neuron */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[1px] bg-[#316B83] border border-[#1A1816]/30 inline-block" />
            <span className="text-[#75716B]">Linear Output</span>
          </div>

          {/* Weight Colormap */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#75716B]">Weight:</span>
            <span className="text-[10px] text-[#D62839] font-bold">-</span>
            <div className="w-16 h-2 rounded-[1px] bg-gradient-to-r from-[#D62839] via-[#CBD5E1] to-[#2B6CB0] border border-[#1A1816]/20" />
            <span className="text-[10px] text-[#2B6CB0] font-bold">+</span>
          </div>

          {/* Activation bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#75716B]">Activation:</span>
            <span className="text-[10px] text-[#75716B]">low</span>
            <div className="w-12 h-2 rounded-[1px] bg-gradient-to-r from-[#FAF9F5] to-[#1A1816] border border-[#1A1816]/30" />
            <span className="text-[10px] text-[#75716B]">high</span>
          </div>

          {/* Direction indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[#75716B]">Direction to lower loss:</span>
            <span className="inline-flex items-center gap-0.5 text-[#1E7E56] font-bold text-[12px]">
              ↑ <span className="text-[10px]">+</span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-[#DE5D35] font-bold text-[12px]">
              ↓ <span className="text-[10px]">-</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Simulator Workspace (Grid Layout) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Area: Neural Network SVG Canvas (Col 1-6) */}
        <div className="lg:col-span-6 xl:col-span-6 bg-[#EFECE6] border border-[#1A1816]/15 rounded-[2px] p-4 sm:p-6 relative flex flex-col justify-between min-h-[580px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#75716B]">
                01 / COMPUTATIONAL GRAPH
              </span>
              <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#1A1816]/20 text-[10px] font-mono font-bold text-[#1A1816]">
                {shape.join(" → ")}
              </span>
            </div>

            {/* Animation Phase Tag */}
            {isAnimating && (
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded-[1px] bg-[#DE5D35] text-[#FAF9F5] animate-pulse">
                Phase: {animationPhase}
              </span>
            )}
          </div>

          {/* SVG Canvas */}
          <div className="w-full flex items-center justify-center my-auto overflow-hidden">
            <BackpropNetworkSVG
              shape={shape}
              weights={weightsState}
              biases={biasesState}
              stepTrace={stepTrace}
              animationPhase={animationPhase}
              activeLayerIdx={activeLayerIdx}
              isPlaying={isPlaying}
              width={860}
              height={550}
              onHoverInfo={setHoverDetail}
            />
          </div>

          {/* Live Node / Weight Hover Inspection Status Bar */}
          <div className="mt-4 pt-3 border-t border-[#1A1816]/15 text-[12px] font-mono text-[#75716B] min-h-[26px] flex items-center justify-between">
            <span className="truncate">
              {hoverDetail ? (
                <span className="text-[#1A1816] font-semibold">
                  {hoverDetail}
                </span>
              ) : isAnimating ? (
                <span>
                  {animationPhase === "forward" &&
                    "1/4 Forward pass rippling from input to output ŷ..."}
                  {animationPhase === "loss" &&
                    `2/4 Error evaluated at Loss node: target y=${stepTrace?.target.toFixed(2)}, predicted ŷ=${stepTrace?.output.toFixed(2)}`}
                  {animationPhase === "backward" &&
                    "3/4 Reverse chain rule propagating ∂L/∂z and weight gradients ∂L/∂w..."}
                  {animationPhase === "update" &&
                    "4/4 Modulating weights with gradient descent step..."}
                </span>
              ) : (
                "Hover over any neuron or synaptic connection to inspect mathematical values."
              )}
            </span>
            <span className="text-[11px] font-mono text-[#75716B] hidden sm:inline shrink-0 ml-2">
              SGD Optimizer
            </span>
          </div>
        </div>

        {/* Center / Right: Dual Plots (Col 7-9) */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-5">
          <BackpropPlots
            data={dataset}
            predictions={predictions}
            lossHistory={lossHistory}
            currentEpoch={epoch}
            currentLoss={loss}
            stepTrace={stepTrace}
            animationPhase={animationPhase}
          />
        </div>

        {/* Far Right: Control Center & Customization Cards (Col 10-12) */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-5">
          {/* ── Control Center Card ─────────────────────────────────── */}
          <div className="bg-[#FAF9F5] border border-[#1A1816] p-5 rounded-[2px] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1816]/15 pb-2.5">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B] font-bold">
                CONTROL CENTER
              </span>
              <button
                type="button"
                onClick={() => setActiveHelpModal("control")}
                className="w-5 h-5 rounded-full border border-[#1A1816]/40 flex items-center justify-center text-[10px] font-mono text-[#75716B] hover:text-[#1A1816] cursor-pointer"
              >
                ?
              </button>
            </div>

            {/* Big Status Readouts */}
            <div className="space-y-1">
              <div className="text-[12px] font-mono text-[#75716B] uppercase font-semibold">
                Epoch
              </div>
              <div className="text-[36px] sm:text-[44px] font-black tracking-tight font-mono text-[#1A1816] leading-none">
                {epoch}
              </div>
              <div className="text-[13px] font-mono text-[#75716B] pt-1">
                Loss:{" "}
                <span className="text-[#DE5D35] font-bold font-mono text-[14px]">
                  {loss.toFixed(6)}
                </span>
              </div>
            </div>

            {/* Playback Control Action Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1A1816]/10">
              {/* Reset */}
              <button
                type="button"
                onClick={() => handleReset(shape, lr, dataset)}
                disabled={isAnimating}
                className="w-11 h-11 rounded-[2px] bg-[#EFECE6] border border-[#1A1816] flex items-center justify-center text-[#1A1816] hover:bg-[#1A1816] hover:text-[#FAF9F5] transition-colors cursor-pointer disabled:opacity-50 text-[14px]"
                title="Reset Parameters"
              >
                ↺
              </button>

              {/* Play / Pause */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={isAnimating}
                className={`flex-1 h-11 rounded-[2px] border border-[#1A1816] flex items-center justify-center gap-2 font-mono text-[12px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                  isPlaying
                    ? "bg-[#DE5D35] text-[#FAF9F5]"
                    : "bg-[#1A1816] text-[#FAF9F5] hover:bg-[#DE5D35]"
                }`}
              >
                <span>{isPlaying ? "❚❚ PAUSE" : "▶ PLAY"}</span>
              </button>

              {/* Single Step */}
              <button
                type="button"
                onClick={handleStepEpoch}
                disabled={isPlaying || isAnimating}
                className="w-11 h-11 rounded-[2px] bg-[#EFECE6] border border-[#1A1816] flex items-center justify-center text-[#1A1816] hover:bg-[#1A1816] hover:text-[#FAF9F5] transition-colors cursor-pointer disabled:opacity-50 text-[13px]"
                title="Step 1 Epoch"
              >
                ⏭
              </button>
            </div>

            {/* Primary Action Button: Walkthrough Single Epoch Animation */}
            <button
              type="button"
              onClick={handleAnimateEpoch}
              disabled={isAnimating}
              className={`w-full py-3 px-3 rounded-[2px] border border-[#1A1816] font-mono text-[11px] sm:text-[12px] font-bold tracking-wider uppercase transition-all cursor-pointer text-center ${
                isAnimating
                  ? "bg-[#FAF0E8] text-[#DE5D35] border-[#DE5D35]"
                  : "bg-[#FAF9F5] text-[#1A1816] hover:bg-[#1A1816] hover:text-[#FAF9F5]"
              }`}
            >
              {isAnimating
                ? "ANIMATING STEP..."
                : `CLICK TO ANIMATE EPOCH ${epoch}`}
            </button>
          </div>

          {/* ── Customization Card ──────────────────────────────────── */}
          <div className="bg-[#FAF9F5] border border-[#1A1816] p-5 rounded-[2px] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1816]/15 pb-2.5">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#75716B] font-bold">
                CUSTOMIZATION
              </span>
              <button
                type="button"
                onClick={() => setActiveHelpModal("customization")}
                className="w-5 h-5 rounded-full border border-[#1A1816]/40 flex items-center justify-center text-[10px] font-mono text-[#75716B] hover:text-[#1A1816] cursor-pointer"
              >
                ?
              </button>
            </div>

            {/* Learning Rate Selector */}
            <div>
              <div className="text-[11px] font-mono text-[#75716B] uppercase mb-1.5 font-semibold">
                Learning Rate
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[0.0001, 0.001, 0.003, 0.005].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleLearningRateChange(rate)}
                    className={`py-1.5 px-2 text-[11px] font-mono rounded-[2px] border text-center transition-colors cursor-pointer ${
                      lr === rate
                        ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816] font-bold"
                        : "bg-[#FAF9F5] text-[#75716B] border-[#1A1816]/20 hover:border-[#1A1816] hover:text-[#1A1816]"
                    }`}
                  >
                    {rate}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Dataset Selector */}
            <div>
              <div className="text-[11px] font-mono text-[#75716B] uppercase mb-1.5 font-semibold">
                Target Function
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(["sin", "cos", "tanh"] as DatasetType[]).map((ds) => (
                  <button
                    key={ds}
                    type="button"
                    onClick={() => handleDatasetChange(ds)}
                    className={`py-1.5 text-[11px] font-mono rounded-[2px] border text-center transition-colors cursor-pointer uppercase ${
                      datasetType === ds
                        ? "bg-[#1A1816] text-[#FAF9F5] border-[#1A1816] font-bold"
                        : "bg-[#FAF9F5] text-[#75716B] border-[#1A1816]/20 hover:border-[#1A1816] hover:text-[#1A1816]"
                    }`}
                  >
                    {ds}
                  </button>
                ))}
              </div>
            </div>

            {/* Hidden Layers Adjustment (+ / -) */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#75716B] uppercase mb-1.5 font-semibold">
                <span>Hidden Layers</span>
                <span className="text-[#1A1816] font-bold">
                  {shape.length - 2}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRemoveLayer}
                  disabled={shape.length <= 3}
                  className="flex-1 py-1.5 rounded-[2px] bg-[#EFECE6] border border-[#1A1816]/30 text-[14px] font-mono font-bold text-[#1A1816] hover:bg-[#1A1816] hover:text-[#FAF9F5] transition-colors cursor-pointer disabled:opacity-40"
                  title="Remove Hidden Layer"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={handleAddLayer}
                  disabled={shape.length >= 6}
                  className="flex-1 py-1.5 rounded-[2px] bg-[#EFECE6] border border-[#1A1816]/30 text-[14px] font-mono font-bold text-[#1A1816] hover:bg-[#1A1816] hover:text-[#FAF9F5] transition-colors cursor-pointer disabled:opacity-40"
                  title="Add Hidden Layer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Explanatory Help Modals (Swiss Style) ────────────────────── */}
      {activeHelpModal && (
        <div className="fixed inset-0 bg-[#1A1816]/50 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-[#FAF9F5] border-2 border-[#1A1816] max-w-[500px] w-full p-6 rounded-[2px] shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1816]/15 pb-3">
              <h4 className="text-[13px] font-mono font-bold uppercase tracking-wider text-[#1A1816]">
                {activeHelpModal === "control" && "HOW THE TRAINING LOOP WORKS"}
                {activeHelpModal === "network" &&
                  "NEURAL NETWORK ARCHITECTURE GUIDE"}
                {activeHelpModal === "customization" &&
                  "CUSTOMIZATION & HYPERPARAMETERS"}
              </h4>
              <button
                type="button"
                onClick={() => setActiveHelpModal(null)}
                className="text-[14px] font-mono font-bold text-[#75716B] hover:text-[#1A1816] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-[13px] text-[#475569] leading-relaxed space-y-3 font-sans">
              {activeHelpModal === "control" && (
                <>
                  <p>
                    <strong>Epoch:</strong> One complete pass over all 48
                    training coordinates (x, y).
                  </p>
                  <p>
                    <strong>Loss (MSE):</strong> Measures the mean squared error
                    L = 0.5 &times; (ŷ - y)&sup2;. As gradient descent optimizes
                    the weights, this value drops towards zero.
                  </p>
                  <p>
                    <strong>Click to Animate Epoch:</strong> Freezes the loop to
                    demonstrate how a single training example moves through the
                    4 steps of backpropagation: forward activation, loss
                    evaluation, reverse gradient chain rule, and weight
                    modulation.
                  </p>
                </>
              )}

              {activeHelpModal === "network" && (
                <>
                  <p>
                    <strong>Input Neuron:</strong> Feeds the scalar coordinate x
                    in [-5, 5].
                  </p>
                  <p>
                    <strong>ReLU Neurons:</strong> Compute a = max(0, z). Their
                    brightness reflects activation level (light = zero, dark =
                    high).
                  </p>
                  <p>
                    <strong>Linear Output Neuron:</strong> Produces the
                    continuous prediction ŷ.
                  </p>
                  <p>
                    <strong>Synaptic Weights:</strong> Rendered as cubic bezier
                    splines. Red lines denote negative weights, steel blue
                    denotes positive weights. Thickness corresponds to absolute
                    magnitude.
                  </p>
                  <p>
                    <strong>Direction Arrows:</strong> Green up arrows (&uarr;)
                    indicate the node output needs to increase to decrease
                    overall error; terracotta down arrows (&darr;) indicate it
                    needs to decrease.
                  </p>
                </>
              )}

              {activeHelpModal === "customization" && (
                <>
                  <p>
                    <strong>Learning Rate (&eta;):</strong> Controls the step
                    size during Stochastic Gradient Descent: w &larr; w - &eta;
                    &times; (&part;L / &part;w). Too high can cause
                    oscillations; too low converges slowly.
                  </p>
                  <p>
                    <strong>Target Function:</strong> Choose between sin(x),
                    cos(x), or tanh(x) regression targets to observe how hidden
                    ReLU units assemble piecewise linear segments into smooth
                    nonlinear approximations.
                  </p>
                  <p>
                    <strong>Layers (+ / &minus;):</strong> Add or remove hidden
                    layers to observe how network depth influences
                    representational capacity.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#1A1816]/15 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveHelpModal(null)}
                className="px-4 py-1.5 bg-[#1A1816] text-[#FAF9F5] font-mono text-[11px] font-bold uppercase rounded-[2px] hover:bg-[#DE5D35] transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
