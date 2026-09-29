/**
 * Neural Network Engine for Backpropagation Simulation
 * Pure TypeScript, zero-dependency, high-performance feed-forward multi-layer perceptron.
 * Implements analytical backpropagation using multivariable chain rule.
 */

export type DatasetType = "sin" | "cos" | "tanh";

export interface DataPoint {
  x: number;
  y: number;
}

export interface NetworkStepTrace {
  exampleIndex: number;
  input: number;
  target: number;
  // Activations at each layer: layerIndex -> nodeIndex -> value
  activations: number[][];
  // Pre-activations (z): layerIndex -> nodeIndex -> value
  preActivations: number[][];
  output: number;
  loss: number;
  outputError: number; // (y_hat - y)
  // Gradients for each node: layerIndex -> nodeIndex -> delta
  deltas: number[][];
  // Direction output needed to reduce loss: -1 for decrease, +1 for increase
  outputDirection: number;
  // Node level recommended direction: layerIndex -> nodeIndex -> direction (+1 or -1 or 0)
  nodeDirections: number[][];
  // Weight gradients: layerIndex -> toNode -> fromNode -> dL/dw
  weightGradients: number[][][];
  // Bias gradients: layerIndex -> nodeIndex -> dL/db
  biasGradients: number[][];
  // Projected output and loss if updated
  projectedOutput: number;
  projectedLoss: number;
}

/**
 * Deterministic PRNG (Mulberry32) ensuring identical parameter initialization
 * on both server and client to avoid SSR hydration mismatches.
 */
function createMulberry32(seed = 42) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class NeuralNetworkEngine {
  public shape: number[]; // e.g. [1, 8, 8, 8, 1]
  public weights: number[][][]; // [layerIdx][toNodeIdx][fromNodeIdx]
  public biases: number[][]; // [layerIdx][toNodeIdx]
  public learningRate: number;
  public mWeights: number[][][]; // 1st moment vector for Adam
  public vWeights: number[][][]; // 2nd moment vector for Adam
  public mBiases: number[][]; // 1st moment vector for biases
  public vBiases: number[][]; // 2nd moment vector for biases
  public t = 0; // timestep counter
  public seed = 42;

  constructor(
    shape: number[] = [1, 8, 8, 8, 1],
    learningRate = 0.001,
    seed = 42,
  ) {
    this.shape = [...shape];
    this.learningRate = learningRate;
    this.seed = seed;
    this.weights = [];
    this.biases = [];
    this.mWeights = [];
    this.vWeights = [];
    this.mBiases = [];
    this.vBiases = [];
    this.initializeParameters(seed);
  }

  /**
   * Initializes weights using He / Xavier-style scaled uniform distribution
   * using deterministic PRNG and resets Adam momentum buffers.
   */
  public initializeParameters(seed = this.seed): void {
    this.seed = seed;
    const rng = createMulberry32(seed);
    this.weights = [];
    this.biases = [];
    this.mWeights = [];
    this.vWeights = [];
    this.mBiases = [];
    this.vBiases = [];
    this.t = 0;

    for (let l = 0; l < this.shape.length - 1; l++) {
      const inDim = this.shape[l];
      const outDim = this.shape[l + 1];
      const scale = Math.sqrt(2.0 / inDim);

      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];
      const layerMW: number[][] = [];
      const layerVW: number[][] = [];
      const layerMB: number[] = [];
      const layerVB: number[] = [];

      for (let j = 0; j < outDim; j++) {
        const nodeWeights: number[] = [];
        const nodeMW: number[] = [];
        const nodeVW: number[] = [];
        for (let i = 0; i < inDim; i++) {
          // Centered around 0 with scale
          nodeWeights.push((rng() * 2 - 1) * scale);
          nodeMW.push(0);
          nodeVW.push(0);
        }
        layerWeights.push(nodeWeights);
        layerMW.push(nodeMW);
        layerVW.push(nodeVW);

        // Small initial bias
        layerBiases.push((rng() * 0.2 - 0.1) * 0.1);
        layerMB.push(0);
        layerVB.push(0);
      }

      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
      this.mWeights.push(layerMW);
      this.vWeights.push(layerVW);
      this.mBiases.push(layerMB);
      this.vBiases.push(layerVB);
    }
  }

  /**
   * Reconfigures network layer shape while reinitializing parameters
   */
  public setShape(shape: number[]): void {
    this.shape = [...shape];
    this.initializeParameters();
  }

  /**
   * Computes analytical loss over a dataset without mutating model parameters or optimizer moments
   */
  public computeLoss(data: DataPoint[]): number {
    const N = data.length;
    if (N === 0) return 0;
    let totalLoss = 0;
    for (let i = 0; i < N; i++) {
      const err = this.forwardSingle(data[i].x).output - data[i].y;
      totalLoss += 0.5 * err * err;
    }
    return totalLoss / N;
  }

  /**
   * Forward pass for a single input scalar x
   */
  public forwardSingle(x: number): {
    activations: number[][];
    preActivations: number[][];
    output: number;
  } {
    const activations: number[][] = [[x]];
    const preActivations: number[][] = [[x]];

    let currentActivation = [x];

    for (let l = 0; l < this.weights.length; l++) {
      const isOutputLayer = l === this.weights.length - 1;
      const nextActivation: number[] = [];
      const nextPreActivation: number[] = [];

      for (let j = 0; j < this.shape[l + 1]; j++) {
        let z = this.biases[l][j];
        for (let i = 0; i < this.shape[l]; i++) {
          z += this.weights[l][j][i] * currentActivation[i];
        }
        nextPreActivation.push(z);

        // Linear activation on output layer, Leaky ReLU (slope 0.05) on hidden layers
        const a = isOutputLayer ? z : z > 0 ? z : 0.05 * z;
        nextActivation.push(a);
      }

      preActivations.push(nextPreActivation);
      activations.push(nextActivation);
      currentActivation = nextActivation;
    }

    return {
      activations,
      preActivations,
      output: currentActivation[0],
    };
  }

  /**
   * Predicts output for an array of input values
   */
  public predict(inputs: number[]): number[] {
    return inputs.map((x) => this.forwardSingle(x).output);
  }

  /**
   * Performs one full batch training epoch using Mean Squared Error loss and SGD.
   * Returns current loss value.
   */
  public trainEpoch(data: DataPoint[], lr = this.learningRate): number {
    const N = data.length;
    if (N === 0) return 0;

    // Initialize gradient accumulators
    const accumulatedWeightGrads: number[][][] = this.weights.map((layer) =>
      layer.map((row) => new Array(row.length).fill(0)),
    );
    const accumulatedBiasGrads: number[][] = this.biases.map((layer) =>
      new Array(layer.length).fill(0),
    );

    let totalLoss = 0;

    // Accumulate gradients over all samples
    for (let s = 0; s < N; s++) {
      const { x, y } = data[s];
      const { activations, preActivations, output } = this.forwardSingle(x);

      const error = output - y;
      totalLoss += 0.5 * error * error;

      // Deltas for each layer: delta = dLoss / dz
      const deltas: number[][] = new Array(this.shape.length);

      // Output layer (linear): dLoss/dz = error
      deltas[this.shape.length - 1] = [error];

      // Backward chain rule through hidden layers
      for (let l = this.weights.length - 1; l >= 0; l--) {
        const nextDelta = deltas[l + 1]; // deltas at layer l+1
        const prevActivation = activations[l]; // activations at layer l

        // Accumulate gradients for weights at layer l: dL/dw_ji = delta_j * a_i
        for (let j = 0; j < this.shape[l + 1]; j++) {
          const deltaJ = nextDelta[j];
          accumulatedBiasGrads[l][j] += deltaJ;
          for (let i = 0; i < this.shape[l]; i++) {
            accumulatedWeightGrads[l][j][i] += deltaJ * prevActivation[i];
          }
        }

        // Propagate delta backwards to layer l (if not input layer)
        if (l > 0) {
          const currentDelta: number[] = [];
          for (let i = 0; i < this.shape[l]; i++) {
            let sum = 0;
            for (let j = 0; j < this.shape[l + 1]; j++) {
              sum += this.weights[l][j][i] * nextDelta[j];
            }
            // Leaky ReLU derivative (1.0 for z > 0, 0.05 for z <= 0)
            const reluGrad = preActivations[l][i] > 0 ? 1.0 : 0.05;
            currentDelta.push(sum * reluGrad);
          }
          deltas[l] = currentDelta;
        }
      }
    }

    // Adam optimizer parameter updates
    this.t += 1;
    const beta1 = 0.9;
    const beta2 = 0.999;
    const eps = 1e-8;
    // Scale effective step size with user learning rate (at lr = 0.001, alpha = 0.018)
    const alpha = lr * 18.0;
    const beta1t = beta1 ** this.t;
    const beta2t = beta2 ** this.t;

    for (let l = 0; l < this.weights.length; l++) {
      for (let j = 0; j < this.shape[l + 1]; j++) {
        // Adam update for biases
        const gb = accumulatedBiasGrads[l][j] / N;
        this.mBiases[l][j] = beta1 * this.mBiases[l][j] + (1 - beta1) * gb;
        this.vBiases[l][j] =
          beta2 * this.vBiases[l][j] + (1 - beta2) * (gb * gb);
        const mHatB = this.mBiases[l][j] / (1 - beta1t);
        const vHatB = this.vBiases[l][j] / (1 - beta2t);
        this.biases[l][j] -= (alpha * mHatB) / (Math.sqrt(vHatB) + eps);

        // Adam update for weights
        for (let i = 0; i < this.shape[l]; i++) {
          const gw = accumulatedWeightGrads[l][j][i] / N;
          this.mWeights[l][j][i] =
            beta1 * this.mWeights[l][j][i] + (1 - beta1) * gw;
          this.vWeights[l][j][i] =
            beta2 * this.vWeights[l][j][i] + (1 - beta2) * (gw * gw);
          const mHatW = this.mWeights[l][j][i] / (1 - beta1t);
          const vHatW = this.vWeights[l][j][i] / (1 - beta2t);
          this.weights[l][j][i] -= (alpha * mHatW) / (Math.sqrt(vHatW) + eps);
        }
      }
    }

    return totalLoss / N;
  }

  /**
   * Generates a step-by-step trace for a single sample, used in the walkthrough animation
   */
  public traceSingleStep(
    exampleIndex: number,
    data: DataPoint[],
    lr = this.learningRate,
  ): NetworkStepTrace {
    const { x, y } = data[exampleIndex];
    const { activations, preActivations, output } = this.forwardSingle(x);
    const outputError = output - y;
    const loss = 0.5 * outputError * outputError;

    // Direction the output must move to lower loss:
    // If output > y, we need output to decrease (-1)
    // If output < y, we need output to increase (+1)
    const outputDirection = outputError > 0 ? -1 : 1;

    // Calculate deltas layer-by-layer
    const deltas: number[][] = new Array(this.shape.length);
    const nodeDirections: number[][] = new Array(this.shape.length);
    const weightGradients: number[][][] = [];
    const biasGradients: number[][] = [];

    deltas[this.shape.length - 1] = [outputError];
    nodeDirections[this.shape.length - 1] = [outputDirection];

    for (let l = this.weights.length - 1; l >= 0; l--) {
      const nextDelta = deltas[l + 1];
      const prevActivation = activations[l];
      const layerWeightGrads: number[][] = [];
      const layerBiasGrads: number[] = [];

      for (let j = 0; j < this.shape[l + 1]; j++) {
        const deltaJ = nextDelta[j];
        layerBiasGrads.push(deltaJ);
        const nodeWGrads: number[] = [];
        for (let i = 0; i < this.shape[l]; i++) {
          nodeWGrads.push(deltaJ * prevActivation[i]);
        }
        layerWeightGrads.push(nodeWGrads);
      }

      weightGradients.unshift(layerWeightGrads);
      biasGradients.unshift(layerBiasGrads);

      // Backpropagate to layer l
      if (l > 0) {
        const currentDelta: number[] = [];
        const currentDirections: number[] = [];
        for (let i = 0; i < this.shape[l]; i++) {
          let sum = 0;
          for (let j = 0; j < this.shape[l + 1]; j++) {
            sum += this.weights[l][j][i] * nextDelta[j];
          }
          const reluGrad = preActivations[l][i] > 0 ? 1.0 : 0.05;
          const d = sum * reluGrad;
          currentDelta.push(d);
          // If gradient dL/dz is positive, increasing z increases loss, so direction to reduce loss is down (-1)
          currentDirections.push(d > 0.0001 ? -1 : d < -0.0001 ? 1 : 0);
        }
        deltas[l] = currentDelta;
        nodeDirections[l] = currentDirections;
      }
    }

    // Input layer has no backward delta needed for weights
    deltas[0] = [0];
    nodeDirections[0] = [0];

    // Compute hypothetical updated output for this sample
    let projectedOutput = output;
    let projectedLoss = loss;

    // Create shallow simulation copy to check projected step
    const tempEngine = new NeuralNetworkEngine(this.shape, lr);
    tempEngine.weights = this.weights.map((l) => l.map((r) => [...r]));
    tempEngine.biases = this.biases.map((l) => [...l]);

    // Apply single sample step scaled to Adam step magnitude
    const stepScale = lr * 18.0;
    for (let l = 0; l < tempEngine.weights.length; l++) {
      for (let j = 0; j < tempEngine.shape[l + 1]; j++) {
        const bg = biasGradients[l][j];
        tempEngine.biases[l][j] -= stepScale * (bg / (Math.abs(bg) + 0.1));
        for (let i = 0; i < tempEngine.shape[l]; i++) {
          const wg = weightGradients[l][j][i];
          tempEngine.weights[l][j][i] -=
            stepScale * (wg / (Math.abs(wg) + 0.1));
        }
      }
    }

    const projectedRes = tempEngine.forwardSingle(x);
    projectedOutput = projectedRes.output;
    projectedLoss = 0.5 * (projectedOutput - y) ** 2;

    return {
      exampleIndex,
      input: x,
      target: y,
      activations,
      preActivations,
      output,
      loss,
      outputError,
      deltas,
      outputDirection,
      nodeDirections,
      weightGradients,
      biasGradients,
      projectedOutput,
      projectedLoss,
    };
  }
}

/**
 * Generates synthetic regression datasets matching the reference tool:
 * Range x in [-5, 5], scaled to amplitude ~4.5 - 5.0 with realistic slight jitter.
 */
export function generateDataset(type: DatasetType, count = 48): DataPoint[] {
  const points: DataPoint[] = [];
  const minX = -4.8;
  const maxX = 4.8;
  const step = (maxX - minX) / (count - 1);

  for (let i = 0; i < count; i++) {
    const x = minX + i * step;
    let target = 0;

    switch (type) {
      case "sin":
        // 5 * sin(x)
        target = 4.6 * Math.sin(x * 0.95);
        break;
      case "cos":
        // 5 * cos(x)
        target = 4.6 * Math.cos(x * 0.95);
        break;
      case "tanh":
        // 5 * tanh(x)
        target = 4.6 * Math.tanh(x * 0.75);
        break;
    }

    // Controlled pseudo-noise for authentic scatter
    const noise = Math.sin(i * 12.345) * 0.18 + Math.cos(i * 3.456) * 0.12;
    points.push({
      x: Math.round(x * 100) / 100,
      y: Math.max(-5, Math.min(5, target + noise)),
    });
  }

  return points;
}

/**
 * Generates smooth ground truth curve coordinates for reference plotting
 */
export function generateIdealCurve(
  type: DatasetType,
  resolution = 120,
): { x: number; y: number }[] {
  const curve: { x: number; y: number }[] = [];
  const minX = -5.0;
  const maxX = 5.0;
  const step = (maxX - minX) / (resolution - 1);

  for (let i = 0; i < resolution; i++) {
    const x = minX + i * step;
    let y = 0;
    switch (type) {
      case "sin":
        y = 4.6 * Math.sin(x * 0.95);
        break;
      case "cos":
        y = 4.6 * Math.cos(x * 0.95);
        break;
      case "tanh":
        y = 4.6 * Math.tanh(x * 0.75);
        break;
    }
    curve.push({ x, y });
  }

  return curve;
}
