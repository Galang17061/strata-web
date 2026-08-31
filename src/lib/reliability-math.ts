export type Distribution = "weibull" | "exponential" | "poisson";

export function weibullReliability(hours: number, shape: number, scale: number): number {
  if (hours <= 0) return 1;
  if (scale <= 0 || shape <= 0) return 0;
  return Math.exp(-((hours / scale) ** shape));
}

export function exponentialReliability(hours: number, failureRate: number): number {
  if (hours <= 0) return 1;
  if (failureRate <= 0) return 1;
  return Math.exp(-failureRate * hours);
}

export function poissonReliability(hours: number, failureRate: number, allowedFailures: number): number {
  if (hours <= 0) return 1;
  if (failureRate <= 0) return 1;
  const mean = failureRate * hours;
  let term = Math.exp(-mean);
  let sum = term;
  for (let count = 1; count <= allowedFailures; count += 1) {
    term *= mean / count;
    sum += term;
  }
  return sum;
}

export function seriesReliability(values: number[]): number {
  return values.reduce((product, value) => product * value, 1);
}

export function parallelReliability(values: number[]): number {
  return 1 - values.reduce((product, value) => product * (1 - value), 1);
}

export function curvePoints(
  distribution: Distribution,
  maxHours: number,
  steps: number,
  parameters: { shape: number; scale: number; failureRate: number; allowedFailures?: number },
): { hours: number; reliability: number }[] {
  const points: { hours: number; reliability: number }[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const hours = Math.round((maxHours * index) / steps);
    const reliability =
      distribution === "weibull"
        ? weibullReliability(hours, parameters.shape, parameters.scale)
        : distribution === "poisson"
          ? poissonReliability(hours, parameters.failureRate, parameters.allowedFailures ?? 0)
          : exponentialReliability(hours, parameters.failureRate);
    points.push({ hours, reliability });
  }
  return points;
}
