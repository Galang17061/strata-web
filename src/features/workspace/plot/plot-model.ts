import type { SystemTree, TreeNode } from "@/features/projects/types";
import type { HierarchyCalculation, PlotComponentParameters } from "@/features/workspace/types";
import { exponentialReliability, weibullReliability } from "@/lib/reliability-math";

export type PlotSeries = {
  code: string;
  name: string;
  values: number[];
};

export type LevelPlot = {
  times: number[];
  total: PlotSeries;
  children: PlotSeries[];
};

type Token = { kind: "number"; value: number } | { kind: "name"; value: string } | { kind: "op"; value: string };

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < formula.length) {
    const char = formula[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      let end = index;
      while (end < formula.length && /[0-9.]/.test(formula[end])) end += 1;
      tokens.push({ kind: "number", value: Number(formula.slice(index, end)) });
      index = end;
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      let end = index;
      while (end < formula.length && /[A-Za-z0-9_-]/.test(formula[end])) end += 1;
      tokens.push({ kind: "name", value: formula.slice(index, end) });
      index = end;
      continue;
    }
    tokens.push({ kind: "op", value: char });
    index += 1;
  }
  return tokens;
}

export function evaluateFormula(formula: string, values: Record<string, number>): number {
  const tokens = tokenize(formula);
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];

  const factor = (): number => {
    const token = take();
    if (!token) throw new Error("Unexpected end of formula");
    if (token.kind === "number") return token.value;
    if (token.kind === "name") {
      const value = values[token.value];
      if (value === undefined) throw new Error(`No value for ${token.value}`);
      return value;
    }
    if (token.value === "(") {
      const inner = expression();
      const close = take();
      if (!close || close.kind !== "op" || close.value !== ")") throw new Error("Missing closing bracket");
      return inner;
    }
    if (token.value === "-") return -factor();
    if (token.value === "+") return factor();
    throw new Error(`Unexpected ${token.value}`);
  };

  const term = (): number => {
    let left = factor();
    for (;;) {
      const token = peek();
      if (!token || token.kind !== "op" || (token.value !== "*" && token.value !== "/")) return left;
      take();
      const right = factor();
      left = token.value === "*" ? left * right : left / right;
    }
  };

  const expression = (): number => {
    let left = term();
    for (;;) {
      const token = peek();
      if (!token || token.kind !== "op" || (token.value !== "+" && token.value !== "-")) return left;
      take();
      const right = term();
      left = token.value === "+" ? left + right : left - right;
    }
  };

  const result = expression();
  if (position < tokens.length) throw new Error("Formula has trailing input");
  return result;
}

function binomial(n: number, k: number): number {
  let result = 1;
  for (let index = 1; index <= k; index += 1) result = (result * (n - k + index)) / index;
  return result;
}

export function kOutOfN(reliability: number, k: number, n: number): number {
  let sum = 0;
  for (let index = k; index <= n; index += 1) {
    sum += binomial(n, index) * reliability ** index * (1 - reliability) ** (n - index);
  }
  return sum;
}

export function adjustBlock(base: number, connectionType: string | null, active: number | null, total: number | null): number {
  const type = (connectionType ?? "series").trim().toLowerCase();
  const k = active ?? 1;
  const n = total ?? 1;
  if (type === "series" || type === "serial") return base ** n;
  if (type === "parallel") return k === 1 ? 1 - (1 - base) ** n : kOutOfN(base, k, n);
  if (type.includes("partial") || type.includes("parsial") || type.includes("redundan")) {
    return k > 1 && n >= k && k !== n ? kOutOfN(base, k, n) : base;
  }
  return base;
}

export function componentReliabilityAt(parameters: PlotComponentParameters, hours: number): number {
  if (hours <= 0) return 1;
  if ((parameters.distributionType ?? "").toLowerCase() === "weibull") {
    if (!parameters.shapeParameter || !parameters.scaleParameter) return 0;
    return weibullReliability(hours, parameters.shapeParameter, parameters.scaleParameter);
  }
  if (parameters.failureRate === null) return 0;
  return exponentialReliability(hours, parameters.failureRate);
}

export function plotTimes(horizon: number, steps = 20): number[] {
  const safe = horizon > 0 ? horizon : 1000;
  return Array.from({ length: steps }, (_, index) => Math.round((safe * index) / (steps - 1)));
}

export function leafNodesUnder(node: TreeNode | null, tree: SystemTree): TreeNode[] {
  const leaves: TreeNode[] = [];
  const walk = (nodes: TreeNode[] | null | undefined) => {
    for (const child of nodes ?? []) {
      if ((child.components ?? []).length > 0 || (child.hierarchy ?? []).length === 0) leaves.push(child);
      walk(child.hierarchy);
    }
  };
  if (node) {
    if ((node.components ?? []).length > 0 || (node.hierarchy ?? []).length === 0) leaves.push(node);
    walk(node.hierarchy);
  } else {
    walk(tree.hierarchy);
  }
  return leaves;
}

export function connectionOf(tree: SystemTree, code: string): { connectionType: string | null; active: number | null; total: number | null } {
  const walk = (nodes: TreeNode[] | null | undefined): { connectionType: string | null; active: number | null; total: number | null } | null => {
    for (const node of nodes ?? []) {
      for (const component of node.components ?? []) {
        if (component.formulaCode === code) {
          return { connectionType: component.connectionType, active: component.activeComponent, total: component.totalComponent };
        }
      }
      const nested = walk(node.hierarchy);
      if (nested) return nested;
    }
    return null;
  };
  return walk(tree.hierarchy) ?? { connectionType: null, active: null, total: null };
}

type LevelInput = {
  tree: SystemTree;
  formula: string | null;
  name: string;
  code: string;
  calculations: HierarchyCalculation[];
  parameters: PlotComponentParameters[];
  leafFormulas: Record<string, string | null>;
};

function evaluateCalculation(
  calculation: HierarchyCalculation,
  componentValues: Record<string, number>,
  leafFormulas: Record<string, string | null>,
  parametersByLeaf: Record<string, string[]>,
): number | null {
  const children = calculation.children ?? [];
  if (children.length === 0) {
    const formula = calculation.formula ?? leafFormulas[calculation.hierarchyId] ?? null;
    const codes = parametersByLeaf[calculation.hierarchyId] ?? [];
    if (!formula) return codes.length > 0 ? codes.reduce((product, code) => product * (componentValues[code] ?? 0), 1) : null;
    try {
      return evaluateFormula(formula, componentValues);
    } catch {
      return null;
    }
  }
  const childValues: Record<string, number> = {};
  for (const child of children) {
    const value = evaluateCalculation(child, componentValues, leafFormulas, parametersByLeaf);
    if (value !== null && child.formulaCode) childValues[child.formulaCode] = value;
  }
  if (!calculation.formula) return Object.values(childValues).reduce((product, value) => product * value, 1);
  try {
    return evaluateFormula(calculation.formula, childValues);
  } catch {
    return null;
  }
}

export function buildLevelPlot(input: LevelInput, parametersByLeaf: Record<string, string[]>, horizon: number): LevelPlot {
  const times = plotTimes(horizon);
  const componentSeries = input.parameters.map((parameter) => {
    const wiring = connectionOf(input.tree, parameter.formulaCode ?? "");
    return {
      code: parameter.formulaCode ?? parameter.systemComponentId,
      name: parameter.componentName,
      values: times.map((hours) => adjustBlock(componentReliabilityAt(parameter, hours), wiring.connectionType, wiring.active, wiring.total)),
    };
  });
  const childSeries: PlotSeries[] = input.calculations.map((calculation) => ({
    code: calculation.formulaCode ?? calculation.hierarchyId,
    name: calculation.hierarchyName ?? calculation.hierarchyId,
    values: times.map((_, index) => {
      const componentValues: Record<string, number> = {};
      for (const series of componentSeries) componentValues[series.code] = series.values[index];
      return evaluateCalculation(calculation, componentValues, input.leafFormulas, parametersByLeaf) ?? 0;
    }),
  }));
  const total: PlotSeries = {
    code: input.code,
    name: input.name,
    values: times.map((_, index) => {
      const values: Record<string, number> = {};
      const sources = childSeries.length > 0 ? childSeries : componentSeries;
      for (const series of sources) values[series.code] = series.values[index];
      if (!input.formula) return Object.values(values).reduce((product, value) => product * value, 1);
      try {
        return evaluateFormula(input.formula, values);
      } catch {
        return 0;
      }
    }),
  };
  return { times, total, children: childSeries.length > 0 ? childSeries : componentSeries };
}
