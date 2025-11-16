// Simple curve helpers for examples (map [0,1] -> [0,1])

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

// Linear curve (optionally with slope and bias)
export function linear(x: number, slope = 1, bias = 0): number {
  return clamp01(slope * x + bias);
}

// Logistic/Sigmoid shaped importance curve
export function sigmoid(x: number, k = 10, x0 = 0.5): number {
  // Standard logistic centered at x0, steepness k
  const y = 1 / (1 + Math.exp(-k * (x - x0)));
  return clamp01(y);
}

// Inverse curve: high when input is low (e.g., hunger satisfaction -> eat urgency)
export function inverse(x: number): number {
  return clamp01(1 - x);
}

// Exponential emphasis for high values
export function expPow(x: number, p = 2): number {
  return clamp01(Math.pow(clamp01(x), p));
}
