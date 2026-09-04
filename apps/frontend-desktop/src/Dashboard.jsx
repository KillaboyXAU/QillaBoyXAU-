import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import {
  LayoutDashboard, Activity, Briefcase, ListOrdered, Layers,
  BarChart3, Newspaper, LineChart as LineChartIcon, ShieldAlert,
  Settings, FileText, Menu, Bell, ChevronDown, Circle,
} from "lucide-react";

const COLORS = {
  bg: "#0a0c10",
  panel: "#12151c",
  panelBorder: "#1e222b",
  gold: "#e0a530",
  goldSoft: "rgba(224,165,48,0.12)",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  textPrimary: "#f2f3f5",
  textSecondary: "#868b96",
  textMuted: "#565b66",
};

function genEquityCurve() {
  const points = [];
  let v = 7600;
  const start = new Date("2026-06-01");
  for (let i = 0; i < 95; i++) {
    const drift = 0.0055 + (Math.sin(i / 14) * 0.004);
    const noise = (Math.random() - 0.46) * 90;
    v = Math.max(6000, v * (1 + drift * 0.12) + noise);
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    points.push({ date: d.toISOString().slice(0, 10), equity: Math.round(v) });
  }
  return points;
}

function genSparkline(base, vol, n = 12) {
  const arr = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.45) * vol;
    arr.push({ v: Math.round(v * 100) / 100 });
  }
  return arr;
}

async function fetchDashboardSnapshot() {
  await new Promise((r) => setTimeout(r, 250));

  return {
    account: {
      totalBalance: 10247.68,
      totalBalanceChangePct: 7.48,
      totalProfit: 2412.75,
      totalProfitChangePct: 23.57,
      winRate: 72.4,
      winRateChangePct: 5.3,
      profitFactor: 1.89,
      profitFactorChange: 0.24,
      maxDrawdownPct: 8.32,
      maxDrawdownChangePct: -1.02,
      expectancyR: 0.43,
      expectancyRChange: 0.07,
    },
    equityCurve: genEquityCurve(),
    sparklines: {
      balance: genSparkline(10000, 60),
      profit: genSparkline(2000, 80),
      winRate: genSparkline(70, 2),
      profitFactor: genSparkline(1.7, 0.08),
      drawdown: genSparkline(7, 0.4),
      expectancy: genSparkline(0.4, 0.03),
    },
    liveSignals: [
      { id: "s1", instrument: "XAUUSD", direction: "BUY", strategy: "Breakout", confidence: 78, price: 2531.68, agoMin: 2 },
      { id: "s2", instrument: "XAUUSD", direction: "BUY", strategy: "Trend Momentum", confidence: 82, price: 2532.40, agoMin: 3 },
      { id: "s3", instrument: "XAUUSD", direction: "BUY", strategy: "Pullback", confidence: 73, price: 2530.91, agoMin: 4 },
      { id: "s4", instrument: "XAUUSD", direction: "SELL", strategy: "Mean Reversion", confidence: 71, price: 2529.12, agoMin: 5 },
      { id: "s5", instrument: "XAUUSD", direction: "BUY", strategy: "Trend Following", confidence: 76, price: 2533.02, agoMin: 6 },
    ],
    strategyAllocation: [
      { name: "Trend Following", pct: 40, color: COLORS.gold },
      { name: "Breakout", pct: 25, color: COLORS.blue },
      { name: "Mean Reversion", pct: 20, color: COLORS.purple },
      { name: "Scalping", pct: 10, color: "#f97316" },
      { name: "Other", pct: 5, color: "#565b66" },
    ],
    openPositions: [
      { id: "p1", instrument: "XAUUSD", direction: "BUY", size: 0.20, entry: 2518.40, pnl: 265.80, pnlPct: 2.63 },
      { id: "p2", instrument: "XAUUSD", direction: "BUY", size: 0.10, entry: 2520.10, pnl: 124.60, pnlPct: 1.98 },
      { id: "p3", instrument: "XAUUSD", direction: "BUY", size: 0.30, entry: 2512.30, pnl: 518.42, pnlPct: 3.41 },
      { id: "p4", instrument: "XAUUSD", direction: "SELL", size: 0.05, entry: 2535.80, pnl: -23.10, pnlPct: -0.45 },
    ],
    recentTrades: [
      { id: "t1", time: "09:32:15", instrument: "XAUUSD", direction: "BUY", size: 0.20, entry: 2518.40, exit: 2526.40, pnl: 160.00, pnlPct: 1.59, strategy: "Breakout" },
      { id: "t2", time: "09:15:42", instrument: "XAUUSD", direction: "BUY", size: 0.10, entry: 2512.30, exit: 2520.10, pnl: 78.00, pnlPct: 1.55, strategy: "Trend Momentum" },
      { id: "t3", time: "09:02:11", instrument: "XAUUSD", direction: "SELL", size: 0.05, entry: 2535.80, exit: 2529.10, pnl: 33.50, pnlPct: 0.26, strategy: "Mean Reversion" },
      { id: "t4", time: "08:45:33", instrument: "XAUUSD", direction: "BUY", size: 0.30, entry: 2505.20, exit: 2518.40, pnl: 396.00, pnlPct: 2.64, strategy: "Trend Following" },
      { id: "t5", time: "08:30:05", instrument: "XAUUSD", direction: "BUY", size: 0.10, entry: 2498.60, exit: 2505.20, pnl: 66.00, pnlPct: 1.76, strategy: "Pullback" },
    ],
    newsEvents: [
      { id: "n1", time: "09:30", currency: "USD", headline: "U.S. Non-Farm Payrolls came in higher than expected", impact: "High" },
      { id: "n2", time: "09:15", currency: "USD", headline: "FOMC Member Speaks on Economic Outlook", impact: "Medium" },
      { id: "n3", time: "08:45", currency: "USD", headline: "Gold Prices Surge as Dollar Weakens", impact: "Medium" },
      { id: "n4", time: "08:30", currency: "USD", headline: "Fed Member Comments on Interest Rates", impact: "High" },
      { id: "n5", time: "08:00", currency: "USD", headline: "Inflation Data Shows Cooling Trend", impact: null },
    ],
    riskManagement: {
      dailyLossLimit: 500.00,
      dailyLoss: 124.60,
      remaining: 375.40,
      riskPerTradePct: 1.00,
      portfolioExposurePct: 28,
      correlationExposurePct: 22,
      maxDrawdownPct: 8.32,
      killSwitch: "DISARMED",
      state: "LOW RISK",
    },
    systemStatus: [
      { label: "Market Data", status: "Connected", ok: true },
      { label: "Broker Connection", status: "Connected", ok: true },
      { label: "AI Engine", status: "Active", ok: true },
      { label: "Risk Engine", status: "Active", ok: true },
      { label: "News Feed", status: "Connected", ok: true },
      { label: "Execution Engine", status: "Active", ok: true },
      { label: "Database", status: "Healthy", ok: true },
    ],
  };
}

const fmtUSD = (n) =>
  (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n, digits = 2) => `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
const fmtPrice = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatCard({ label, value, sub, subValue, sparkline, sparkColor, valueColor }) {
  return (
    <div style={{
      background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 10,
      padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0,
    }}>
      <div style={{ fontSize: 11, letterSpacing: 0.6, color: COLORS.textSecondary, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: valueColor || COLORS.textPrimary }}>{value}</span>
        {subValue !== undefined && (
          <span style={{ fontSize: 13, fontWeight: 600, color: subValue >= 0 ? COLORS.green : COLORS.red }}>
            {fmtPct(subValue)}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 12, color: COLORS.textMuted }}>{sub}</span>
        <div style={{ width: 72, height: 28 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.75} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, action, children, style }) {
  return (
    <div style={{
      background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 10,
      padding: 18, display: "flex", flexDirection: "column", gap: 14, minWidth: 0, ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.textPrimary }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

const ViewAll = () => (
  <span style={{ fontSize: 12.5, color: COLORS.gold, cursor: "pointer", fontWeight: 600 }}>View All</span>
);

function DirectionTag({ dir }) {
  const buy = dir === "BUY";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
      color: buy ? COLORS.green : COLORS.red,
      background: buy ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
    }}>
      {dir}
    </span>
  );
}

function ImpactTag({ impact }) {
  if (!impact) return null;
  const high = impact === "High";
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, color: high ? COLORS.red : "#eab308" }}>
      {impact} Impact
    </span>
  );
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Activity, label: "Live Trading" },
  { icon: Briefcase, label: "Portfolio" },
  { icon: ListOrdered, label: "Positions" },
  { icon: Layers, label: "Strategies" },
  { icon: BarChart3, label: "Market Analysis" },
  { icon: Newspaper, label: "News & Events" },
  { icon: LineChartIcon, label: "Performance" },
  { icon: ShieldAlert, label: "Risk Management" },
  { icon: Settings, label: "Settings" },
  { icon: FileText, label: "Logs" },
];

const RANGES = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

function RiskGauge({ pct, label }) {
  const angle = -90 + (pct / 100) * 180;
  const r = 68, cx = 90, cy = 90;
  const arcColor = pct < 40 ? COLORS.green : pct < 70 ? "#eab308" : COLORS.red;
  const rad = (deg) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(180));
  const y1 = cy + r * Math.sin(rad(180));
  const x2 = cx + r * Math.cos(rad(0));
  const y2 = cy + r * Math.sin(rad(0));
  const needleX = cx + (r - 10) * Math.cos(rad(angle));
  const needleY = cy + (r - 10) * Math.sin(rad(angle));

  return (
    <div style={{ position: "relative", width: 180, height: 110 }}>
      <svg width="180" height="110" viewBox="0 0 180 110">
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} stroke="#242833" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(rad(angle))} ${cy + r * Math.sin(rad(angle))}`}
          stroke={arcColor} strokeWidth="14" fill="none" strokeLinecap="round"
        />
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#f2f3f5" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r="4" fill="#f2f3f5" />
      </svg>
      <div style={{ position: "absolute", top: 58, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: arcColor, letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary }}>{pct}%</div>
      </div>
    </div>
  );
}

export default function QillaXauDashboard() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("3M");

  useEffect(() => {
    let mounted = true;
    fetchDashboardSnapshot().then((snap) => mounted && setData(snap));
    return () => { mounted = false; };
  }, []);

  if (!data) {
    return (
      <div style={{ background: COLORS.bg, minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.textSecondary, fontFamily: "Inter, system-ui, sans-serif" }}>
        Loading dashboard…
      </div>
    );
  }

  const { account, equityCurve, sparklines, liveSignals, strategyAllocation, openPositions, recentTrades, newsEvents, riskManagement, systemStatus } = data;
  const totalOpenPnl = openPositions.reduce((s, p) => s + p.pnl, 0);

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.textPrimary, fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      display: "flex", minHeight: 800, fontSize: 13.5,
    }}>
      <div style={{ width: 232, borderRight: `1px solid ${COLORS.panelBorder}`, display: "flex", flexDirection: "column", padding: "20px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: COLORS.goldSoft,
            display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.gold}`,
          }}>
            <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: 16 }}>Q</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>
              Qilla <span style={{ color: COLORS.gold }}>XAU</span>
            </div>
            <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.8, fontWeight: 600 }}>
              AUTOMATED TRADING SYSTEM
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ icon: Icon, label }) => {
            const active = label === "Dashboard";
            return (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 7,
                background: active ? COLORS.goldSoft : "transparent",
                borderLeft: active ? `2px solid ${COLORS.gold}` : "2px solid transparent",
                color: active ? COLORS.gold : COLORS.textSecondary, cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500,
              }}>
                <Icon size={16} strokeWidth={2} />
                {label}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 18 }}>
          <div style={{
            background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8, padding: "12px 12px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>System Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Circle size={7} fill={COLORS.green} stroke="none" />
              <span style={{ fontSize: 11.5, color: COLORS.green, fontWeight: 600 }}>All Systems Operational</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {systemStatus.map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: 11.5 }}>{s.label}</span>
                  <span style={{ color: COLORS.green, fontSize: 11.5, fontWeight: 600 }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 12, padding: "0 4px" }}>
            Qilla XAU v1.0.0<br />© 2026 All Rights Reserved
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: `1px solid ${COLORS.panelBorder}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Menu size={18} color={COLORS.textSecondary} />
            <span style={{ fontSize: 17, fontWeight: 700 }}>Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Circle size={8} fill={COLORS.green} stroke="none" />
              <span style={{ fontSize: 13, color: COLORS.textSecondary }}>Live Trading</span>
            </div>
            <Bell size={17} color={COLORS.textSecondary} />
            <Settings size={17} color={COLORS.textSecondary} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>John Trader</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>Pro Account</div>
              </div>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", background: COLORS.gold, color: "#12151c",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12,
              }}>JT</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
            <StatCard label="TOTAL BALANCE" value={fmtUSD(account.totalBalance)} sub="Today" subValue={account.totalBalanceChangePct}
              sparkline={sparklines.balance} sparkColor={COLORS.green} />
            <StatCard label="TOTAL PROFIT" value={fmtUSD(account.totalProfit)} sub="This Week" subValue={account.totalProfitChangePct}
              sparkline={sparklines.profit} sparkColor={COLORS.green} />
            <StatCard label="WIN RATE" value={`${account.winRate}%`} sub="This Week" subValue={account.winRateChangePct}
              sparkline={sparklines.winRate} sparkColor={COLORS.purple} />
            <StatCard label="PROFIT FACTOR" value={account.profitFactor.toFixed(2)} sub="This Week" subValue={account.profitFactorChange}
              sparkline={sparklines.profitFactor} sparkColor={COLORS.blue} />
            <StatCard label="MAX DRAWDOWN" value={`${account.maxDrawdownPct}%`} sub="This Month" subValue={account.maxDrawdownChangePct}
              sparkline={sparklines.drawdown} sparkColor={COLORS.red} valueColor={COLORS.textPrimary} />
            <StatCard label="EXPECTANCY (R)" value={`${account.expectancyR}R`} sub="This Week" subValue={account.expectancyRChange}
              sparkline={sparklines.expectancy} sparkColor={COLORS.gold} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 14, alignItems: "stretch" }}>
            <Panel
              title="Equity Curve"
              action={
                <div style={{ display: "flex", gap: 4 }}>
                  {RANGES.map((r) => (
                    <button key={r} onClick={() => setRange(r)} style={{
                      fontSize: 11.5, padding: "4px 9px", borderRadius: 6, border: "none", cursor: "pointer",
                      background: r === range ? COLORS.gold : "transparent",
                      color: r === range ? "#12151c" : COLORS.textSecondary, fontWeight: 600,
                    }}>{r}</button>
                  ))}
                </div>
              }
            >
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={equityCurve}>
                    <defs>
                      <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={COLORS.panelBorder} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: COLORS.textMuted, fontSize: 10.5 }} axisLine={false} tickLine={false}
                      tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      interval={13} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10.5 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)},000`} width={54} domain={["dataMin - 300", "dataMax + 300"]} />
                    <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8 }}
                      labelStyle={{ color: COLORS.textSecondary }} formatter={(v) => [fmtUSD(v), "Equity"]} />
                    <Area type="monotone" dataKey="equity" stroke={COLORS.gold} strokeWidth={2} fill="url(#eq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Live Signals" action={<ViewAll />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 260, overflowY: "auto" }}>
                {liveSignals.map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%", background: COLORS.goldSoft,
                        display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.gold, fontSize: 10, fontWeight: 700,
                      }}>XAU</div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{s.instrument}</span>
                          <DirectionTag dir={s.direction} />
                        </div>
                        <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>
                          Strategy: {s.strategy} &nbsp;·&nbsp; Confidence: {s.confidence}%
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{fmtPrice(s.price)}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.agoMin}m ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 14, alignItems: "start" }}>
            <Panel title="Strategy Allocation">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={strategyAllocation} dataKey="pct" innerRadius={30} outerRadius={48} paddingAngle={2} stroke="none">
                        {strategyAllocation.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {strategyAllocation.map((s) => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" }} />
                      <span style={{ color: COLORS.textSecondary, flex: 1 }}>{s.name}</span>
                      <span style={{ fontWeight: 600 }}>{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel title="Open Positions" action={<ViewAll />}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ color: COLORS.textMuted, fontSize: 10.5, textAlign: "left" }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>PAIR</th>
                    <th style={{ fontWeight: 600 }}>TYPE</th>
                    <th style={{ fontWeight: 600 }}>SIZE</th>
                    <th style={{ fontWeight: 600 }}>ENTRY</th>
                    <th style={{ fontWeight: 600, textAlign: "right" }}>P/L</th>
                    <th style={{ fontWeight: 600, textAlign: "right" }}>P/L %</th>
                  </tr>
                </thead>
                <tbody>
                  {openPositions.map((p) => (
                    <tr key={p.id} style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
                      <td style={{ padding: "8px 0", fontWeight: 500 }}>{p.instrument}</td>
                      <td><DirectionTag dir={p.direction} /></td>
                      <td>{p.size.toFixed(2)}</td>
                      <td>{fmtPrice(p.entry)}</td>
                      <td style={{ textAlign: "right", color: p.pnl >= 0 ? COLORS.green : COLORS.red, fontWeight: 600 }}>{fmtUSD(p.pnl)}</td>
                      <td style={{ textAlign: "right", color: p.pnlPct >= 0 ? COLORS.green : COLORS.red, fontWeight: 600 }}>{fmtPct(p.pnlPct)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
                    <td style={{ padding: "8px 0", fontWeight: 600 }} colSpan={4}>Total P/L</td>
                    <td colSpan={2} style={{ textAlign: "right", color: totalOpenPnl >= 0 ? COLORS.green : COLORS.red, fontWeight: 700 }}>
                      {fmtUSD(totalOpenPnl)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>

            <Panel title="News & Events" action={<ViewAll />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {newsEvents.map((n) => (
                  <div key={n.id} style={{ display: "flex", gap: 10 }}>
                    <div style={{ fontSize: 11.5, color: COLORS.textMuted, width: 68, flexShrink: 0 }}>
                      {n.time} <span style={{ color: COLORS.textMuted }}>{n.currency}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.3 }}>{n.headline}</div>
                      <ImpactTag impact={n.impact} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, alignItems: "start" }}>
            <Panel title="Recent Trades" action={<ViewAll />}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ color: COLORS.textMuted, fontSize: 10.5, textAlign: "left" }}>
                    <th style={{ paddingBottom: 8, fontWeight: 600 }}>TIME</th>
                    <th style={{ fontWeight: 600 }}>PAIR</th>
                    <th style={{ fontWeight: 600 }}>TYPE</th>
                    <th style={{ fontWeight: 600 }}>SIZE</th>
                    <th style={{ fontWeight: 600 }}>ENTRY</th>
                    <th style={{ fontWeight: 600 }}>EXIT</th>
                    <th style={{ fontWeight: 600, textAlign: "right" }}>P/L</th>
                    <th style={{ fontWeight: 600, textAlign: "right" }}>P/L %</th>
                    <th style={{ fontWeight: 600 }}>STRATEGY</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((t) => (
                    <tr key={t.id} style={{ borderTop: `1px solid ${COLORS.panelBorder}` }}>
                      <td style={{ padding: "7px 0", color: COLORS.textMuted }}>{t.time}</td>
                      <td style={{ fontWeight: 500 }}>{t.instrument}</td>
                      <td><DirectionTag dir={t.direction} /></td>
                      <td>{t.size.toFixed(2)}</td>
                      <td>{fmtPrice(t.entry)}</td>
                      <td>{fmtPrice(t.exit)}</td>
                      <td style={{ textAlign: "right", color: t.pnl >= 0 ? COLORS.green : COLORS.red, fontWeight: 600 }}>{fmtUSD(t.pnl)}</td>
                      <td style={{ textAlign: "right", color: t.pnlPct >= 0 ? COLORS.green : COLORS.red, fontWeight: 600 }}>{fmtPct(t.pnlPct)}</td>
                      <td style={{ color: COLORS.textSecondary }}>{t.strategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Panel title="Risk Management">
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <RiskGauge pct={riskManagement.portfolioExposurePct} label={riskManagement.state} />
                <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, fontSize: 12 }}>
                  {[
                    ["Daily Loss Limit", fmtUSD(riskManagement.dailyLossLimit)],
                    ["Daily Loss", fmtUSD(riskManagement.dailyLoss)],
                    ["Remaining", fmtUSD(riskManagement.remaining)],
                    ["Risk Per Trade", `${riskManagement.riskPerTradePct.toFixed(2)}%`],
                    ["Portfolio Exposure", `${riskManagement.portfolioExposurePct}%`],
                    ["Correlation Exposure", `${riskManagement.correlationExposurePct}%`],
                    ["Max Drawdown", `${riskManagement.maxDrawdownPct}%`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: COLORS.textSecondary }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: COLORS.textSecondary }}>Kill Switch</span>
                    <span style={{ fontWeight: 700, color: COLORS.red }}>{riskManagement.killSwitch}</span>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
