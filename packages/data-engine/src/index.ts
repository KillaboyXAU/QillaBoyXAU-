/**
 * Qilla XAU — Data Engine (Phase 1 target)
 *
 * Responsibility: ingest → validate → normalize → store. Nothing downstream
 * (Feature Engine, Regime Engine, Strategy Ensemble) sees a bar/tick that
 * hasn't passed validateBar(). See docs/architecture.md section 5, step 1.
 *
 * This is the next real module to build — see the conversation for the
 * broker/data-provider decision that determines what ingestBar() connects to.
 */

export interface RawBar {
  instrument: string;
  ts: string; // ISO 8601
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  source: string;
}

export interface ValidationResult {
  isValid: boolean;
  flag?: "STALE" | "OUTLIER" | "GAP" | "BAD_OHLC";
  reason?: string;
}

const STALE_THRESHOLD_MS = 60_000; // instrument-specific tuning belongs in config, not here

/**
 * Validates a single bar. This is intentionally simple in Phase 1 —
 * outlier/gap detection should be replaced with a proper statistical
 * model (e.g. rolling z-score vs. recent volatility) before this is
 * trusted with real capital.
 */
export function validateBar(bar: RawBar, previousClose: number | null, nowMs: number): ValidationResult {
  const barMs = new Date(bar.ts).getTime();

  if (nowMs - barMs > STALE_THRESHOLD_MS) {
    return { isValid: false, flag: "STALE", reason: `Bar is ${Math.round((nowMs - barMs) / 1000)}s old.` };
  }

  if (!(bar.low <= bar.open && bar.open <= bar.high) || !(bar.low <= bar.close && bar.close <= bar.high)) {
    return { isValid: false, flag: "BAD_OHLC", reason: "Open/close outside high-low range." };
  }

  if (previousClose !== null) {
    const pctMove = Math.abs(bar.close - previousClose) / previousClose;
    if (pctMove > 0.05) {
      // Flag, don't necessarily reject — a 5%+ move can be real (news shock).
      // Downstream regime/news modules decide what to do with the flag.
      return { isValid: true, flag: "OUTLIER", reason: `${(pctMove * 100).toFixed(2)}% move from previous close.` };
    }
  }

  return { isValid: true };
}
