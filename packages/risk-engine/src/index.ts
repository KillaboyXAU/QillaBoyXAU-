/**
 * Qilla XAU — Risk Engine (Phase 1)
 *
 * This module is the veto gate described in the architecture doc: nothing
 * downstream of here reaches a broker without passing checkTrade().
 * The AI/strategy layer feeds in probability + reward/loss estimates;
 * it never has write access to order submission directly.
 */

export interface InstrumentSpec {
  symbol: string;
  tickSize: number;      // smallest price increment
  tickValue: number;     // account-currency value of one tick, per 1 lot/unit
  contractSize: number;
  minOrderSize: number;
  maxOrderSize: number;
  stepSize: number;
}

export interface AccountRiskConfig {
  equity: number;
  riskFraction: number;          // r — fraction of equity risked per trade (e.g. 0.01)
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  maxDrawdownPct: number;
  maxLeverage: number;
  maxPositions: number;
  maxPortfolioExposurePct: number;
  maxCorrelatedExposurePct: number;
}

export interface AccountRiskState {
  dailyPnl: number;
  weeklyPnl: number;
  currentDrawdownPct: number;
  openPositionsCount: number;
  currentExposurePct: number;          // sum of notional / equity
  correlatedExposurePct: number;       // exposure within same correlation cluster as candidate
  tradingDisabled: boolean;
  tradingDisabledReason?: string;
}

export interface CandidateTrade {
  instrument: InstrumentSpec;
  direction: "BUY" | "SELL";
  entry: number;
  stop: number;
  target: number;
  probability: number | null;   // null/undefined => not modeled
  isCalibrated: boolean;        // has the source model been validated out-of-sample?
  expectedWinR: number;         // reward in R multiples
  expectedLossR: number;        // usually 1.0R by construction (risk defines 1R)
  estimatedCostsR: number;      // spread+commission+slippage expressed in R
}

export type TradeDecision =
  | { decision: "NO_TRADE"; reason: string }
  | { decision: "TRADE_APPROVED"; positionSize: number; evR: number; riskAmount: number };

/** RiskAmount = E × r */
export function riskAmount(cfg: AccountRiskConfig): number {
  return cfg.equity * cfg.riskFraction;
}

/**
 * PositionSize = RiskAmount / (StopDistance(in ticks) × TickValue)
 * Rounded down to the instrument's step size, clamped to min/max order size.
 */
export function calculatePositionSize(
  cfg: AccountRiskConfig,
  instrument: InstrumentSpec,
  entry: number,
  stop: number
): number {
  const stopDistance = Math.abs(entry - stop);
  if (stopDistance <= 0) return 0;

  const stopDistanceTicks = stopDistance / instrument.tickSize;
  const rAmount = riskAmount(cfg);
  const rawSize = rAmount / (stopDistanceTicks * instrument.tickValue);

  const steps = Math.floor(rawSize / instrument.stepSize);
  let size = steps * instrument.stepSize;

  size = Math.max(0, Math.min(size, instrument.maxOrderSize));
  if (size < instrument.minOrderSize) return 0;

  return Number(size.toFixed(8));
}

/** EV = P(win) × ExpectedWin − P(loss) × ExpectedLoss − Costs   (in R multiples) */
export function calculateExpectedValueR(trade: CandidateTrade): number | null {
  if (trade.probability === null || trade.probability === undefined) return null;
  const pWin = trade.probability;
  const pLoss = 1 - pWin;
  return pWin * trade.expectedWinR - pLoss * trade.expectedLossR - trade.estimatedCostsR;
}

/**
 * checkTrade — the single authorization gate. Every candidate trade,
 * regardless of which strategy produced it, passes through here.
 * Returns NO_TRADE for any failed check; never partially bypasses a check.
 */
export function checkTrade(
  cfg: AccountRiskConfig,
  state: AccountRiskState,
  trade: CandidateTrade
): TradeDecision {
  if (state.tradingDisabled) {
    return { decision: "NO_TRADE", reason: state.tradingDisabledReason ?? "Trading disabled: risk limit previously breached." };
  }

  if (state.openPositionsCount >= cfg.maxPositions) {
    return { decision: "NO_TRADE", reason: "Max simultaneous positions reached." };
  }

  if (Math.abs(state.dailyPnl) > 0 && state.dailyPnl < 0 &&
      Math.abs(state.dailyPnl) >= cfg.equity * cfg.maxDailyLossPct) {
    return { decision: "NO_TRADE", reason: "Daily loss limit reached." };
  }

  if (state.weeklyPnl < 0 && Math.abs(state.weeklyPnl) >= cfg.equity * cfg.maxWeeklyLossPct) {
    return { decision: "NO_TRADE", reason: "Weekly loss limit reached." };
  }

  if (state.currentDrawdownPct >= cfg.maxDrawdownPct) {
    return { decision: "NO_TRADE", reason: "Max drawdown reached." };
  }

  if (state.currentExposurePct >= cfg.maxPortfolioExposurePct) {
    return { decision: "NO_TRADE", reason: "Portfolio exposure limit reached." };
  }

  if (state.correlatedExposurePct >= cfg.maxCorrelatedExposurePct) {
    return { decision: "NO_TRADE", reason: "Correlated-exposure limit reached for this cluster." };
  }

  const evR = calculateExpectedValueR(trade);

  if (evR === null) {
    return { decision: "NO_TRADE", reason: "No probability estimate available — cannot compute expected value." };
  }

  if (!trade.isCalibrated) {
    // Uncalibrated probability sources never authorize a full-size trade.
    // (A stricter policy — blocking entirely — is a one-line change here
    // if that's preferred over reduced-size trading.)
    return { decision: "NO_TRADE", reason: "Probability source is UNCALIBRATED — trade blocked pending validation." };
  }

  if (evR <= 0) {
    return { decision: "NO_TRADE", reason: `Expected value non-positive after costs (EV=${evR.toFixed(3)}R).` };
  }

  const size = calculatePositionSize(cfg, trade.instrument, trade.entry, trade.stop);
  if (size <= 0) {
    return { decision: "NO_TRADE", reason: "Computed position size below instrument minimum order size." };
  }

  const notional = size * trade.instrument.contractSize * trade.entry;
  const projectedExposurePct = state.currentExposurePct + (notional / cfg.equity) * 100;
  const projectedLeverage = notional / cfg.equity;

  if (projectedLeverage > cfg.maxLeverage) {
    return { decision: "NO_TRADE", reason: "Trade would exceed max leverage." };
  }
  if (projectedExposurePct > cfg.maxPortfolioExposurePct) {
    return { decision: "NO_TRADE", reason: "Trade would exceed portfolio exposure limit." };
  }

  return {
    decision: "TRADE_APPROVED",
    positionSize: size,
    evR,
    riskAmount: riskAmount(cfg),
  };
}

/**
 * No-martingale guard: sizing must never be a function of the prior trade's
 * outcome. Call this in tests/CI against trade history to catch regressions
 * where someone accidentally wires "last trade lost" into sizing.
 */
export function assertNoMartingale(
  sizeBeforeLoss: number,
  sizeAfterLoss: number,
  cfg: AccountRiskConfig,
  equityUnchanged: boolean
): void {
  if (equityUnchanged && sizeAfterLoss > sizeBeforeLoss) {
    throw new Error(
      "Martingale pattern detected: position size increased after a loss with no change in qualifying inputs (equity, stop distance, or risk fraction)."
    );
  }
}
