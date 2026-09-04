# Qilla XAU

**Automated Trading System — Multi-Asset**

Qilla XAU is a quantitative trading platform. Despite the name, it is not
restricted to gold — the architecture supports XAUUSD, EURUSD, GBPUSD,
USDJPY, BTCUSD, ETHUSD, indices, equities, and other broker/exchange-
supported instruments without rewriting the core pipeline.

Full architecture, database schema rationale, risk mathematics, and the
phased build plan live in [`docs/architecture.md`](docs/architecture.md).
Read that before touching the code — it explains *why* the modules are
separated the way they are.

## Core principle

The AI/strategy layer never talks to the broker directly:

```
Market Data → Data Validation → Feature Engine → Regime Engine
  → Opportunity Detection → Strategy Ensemble → Signal Validation
  → News/Event Filter → Expected Value Engine → Risk Engine
  → Position Sizing → Portfolio Risk Check → Execution Authorization
  → Broker Adapter → Position Monitor → Early-Exit Engine
  → Performance Analytics
```

The Risk Engine and Portfolio Risk Check are veto gates. A signal that
fails either becomes `NO_TRADE` — a legitimate, logged outcome, not an
error.

## Repository layout

```
qilla-xau/
├── apps/
│   ├── frontend-desktop/   # Full dashboard — sidebar nav, data tables
│   ├── frontend-mobile/    # Independent mobile layout — bottom nav, card lists
│   └── api/                # Gateway + service layer (not yet implemented)
├── packages/
│   ├── risk-engine/        # Position sizing, EV math, the authorization gate
│   ├── strategy-engine/    # Strategy interface + registry (Phase 2 target)
│   ├── data-engine/        # Ingestion + validation (Phase 1 target)
│   └── shared-types/       # The API contract both frontends and the backend share
├── db/
│   └── schema.sql          # Postgres schema — accounts, instruments, signals, orders, ...
└── docs/
    └── architecture.md
```

## Status

This is early. What exists today:

- ✅ Architecture and DB schema
- ✅ Risk engine: `calculatePositionSize`, `calculateExpectedValueR`, `checkTrade` (the authorization gate), `assertNoMartingale`
- ✅ Both frontends, rendering against a **mock** data layer shaped exactly like the future real API (`packages/shared-types`) — swap the fetch call, not the components
- ✅ Strategy interface + registry (no real strategies implemented yet)
- ✅ Data validation stub (`validateBar`) — needs a real statistical outlier model and a real feed connected
- ❌ Broker adapters (none built — need a chosen provider + real API docs)
- ❌ News/economic-calendar integration (none built — need a chosen provider)
- ❌ Backtesting engine
- ❌ API gateway / auth

**Default trading mode is PAPER.** LIVE requires `LIVE_TRADING_ENABLED=true`
in the environment *and* explicit account-level activation — see
`.env.example`. Never commit a real `.env`.

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum; leave broker/news blank for now

npm run dev:desktop    # http://localhost:5173
npm run dev:mobile     # http://localhost:5174 (separate app, not a responsive breakpoint of desktop)
```

The database schema can be applied to a local Postgres instance:

```bash
psql $DATABASE_URL -f db/schema.sql
```

## Next steps

See "Development Phases" in `docs/architecture.md`. The immediate next
piece is the real data ingestion service (`packages/data-engine`) wired to
a chosen market-data source for one instrument — everything downstream
(regime, strategies, risk) depends on that being trustworthy first.

## License

No license has been added yet. Until one is, default copyright applies —
all rights reserved.
