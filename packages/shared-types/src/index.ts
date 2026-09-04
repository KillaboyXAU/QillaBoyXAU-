/**
 * Qilla XAU — Shared types
 *
 * This is the contract both frontend-desktop and frontend-mobile consume.
 * The mock fetchDashboardSnapshot() in each frontend today returns data
 * shaped to this contract; the real /api/dashboard endpoint (apps/api)
 * should return exactly this shape so no frontend code needs to change
 * when the mock is swapped for the real call.
 */

export type Direction = "BUY" | "SELL";

export interface AccountSummary {
  totalBalance: number;
  totalBalanceChangePct: number;
  totalProfit: number;
  totalProfitChangePct: number;
  winRate: number;
  winRateChangePct: number;
  profitFactor: number;
  profitFactorChange: number;
  maxDrawdownPct: number;
  maxDrawdownChangePct: number;
  expectancyR: number;
  expectancyRChange: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
}

export interface LiveSignal {
  id: string;
  instrument: string;
  direction: Direction;
  strategy: string;
  confidence: number;
  price: number;
  agoMin: number;
}

export interface StrategyAllocationSlice {
  name: string;
  pct: number;
  color: string;
}

export interface OpenPosition {
  id: string;
  instrument: string;
  direction: Direction;
  size: number;
  entry: number;
  pnl: number;
  pnlPct: number;
}

export interface RecentTrade {
  id: string;
  time: string;
  instrument: string;
  direction: Direction;
  size: number;
  entry: number;
  exit: number;
  pnl: number;
  pnlPct: number;
  strategy: string;
}

export interface NewsEvent {
  id: string;
  time: string;
  currency: string;
  headline: string;
  impact: "Low" | "Medium" | "High" | null;
}

export interface RiskManagementSnapshot {
  dailyLossLimit: number;
  dailyLoss: number;
  remaining: number;
  riskPerTradePct: number;
  portfolioExposurePct: number;
  correlationExposurePct: number;
  maxDrawdownPct: number;
  killSwitch: "ARMED" | "DISARMED";
  state: "LOW RISK" | "MODERATE" | "HIGH" | "CRITICAL";
}

export interface SystemStatusItem {
  label: string;
  status: string;
  ok: boolean;
}

export interface DashboardSnapshot {
  account: AccountSummary;
  equityCurve: EquityPoint[];
  liveSignals: LiveSignal[];
  strategyAllocation: StrategyAllocationSlice[];
  openPositions: OpenPosition[];
  recentTrades: RecentTrade[];
  newsEvents: NewsEvent[];
  riskManagement: RiskManagementSnapshot;
  systemStatus: SystemStatusItem[];
}
