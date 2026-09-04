/**
 * Qilla XAU — Strategy Engine
 *
 * Every strategy implements this interface. The ensemble and backtester
 * never need code changes to accept a new strategy — see docs/architecture.md
 * section 5 ("Strategy interface").
 *
 * This file is a placeholder: it defines the contract and a trivial example
 * strategy so the interface compiles and is testable. Real strategies
 * (Trend Following, Breakout, Mean Reversion, etc.) get implemented here
 * once the Feature Engine and Regime Engine (Phase 2) exist to feed them.
 */

export type Regime =
  | "TRENDING_UP" | "TRENDING_DOWN" | "RANGE" | "BREAKOUT"
  | "HIGH_VOLATILITY" | "LOW_VOLATILITY" | "NEWS_SHOCK"
  | "ILLIQUID" | "ABNORMAL" | "UNCERTAIN";

export interface FeatureSet {
  instrument: string;
  timestamp: string;
  // populated by the Feature Engine (Phase 2) — indicators, structure, etc.
  [key: string]: unknown;
}

export interface Signal {
  instrument: string;
  direction: "BUY" | "SELL";
  entryZone: [number, number];
  stop: number;
  target: number;
  invalidationConditions: string[];
  expectedRewardR: number;
  expectedLossR: number;
  rationale: Record<string, string>; // feeds the "WHY?" explainability panel
}

export interface TransactionCostEstimate {
  spreadR: number;
  commissionR: number;
  slippageR: number;
}

export interface PerformanceHistory {
  backtest?: Record<string, number>;
  outOfSample?: Record<string, number>;
  paper?: Record<string, number>;
  live?: Record<string, number>;
}

export interface Strategy {
  id: string;
  version: string;
  compatibleRegimes: Regime[];
  onFeatures(features: FeatureSet, regime: Regime): Signal | null;
  costModel(instrument: string): TransactionCostEstimate;
  performanceHistory(): PerformanceHistory;
}

/**
 * Registry — strategies register themselves here; the ensemble iterates
 * this list rather than importing strategies by name.
 */
const registry: Strategy[] = [];

export function registerStrategy(strategy: Strategy): void {
  registry.push(strategy);
}

export function getCompatibleStrategies(regime: Regime): Strategy[] {
  return registry.filter((s) => s.compatibleRegimes.includes(regime));
}

export function runEnsemble(features: FeatureSet, regime: Regime): Signal[] {
  return getCompatibleStrategies(regime)
    .map((s) => s.onFeatures(features, regime))
    .filter((s): s is Signal => s !== null);
}
