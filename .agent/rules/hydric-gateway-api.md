---
trigger: always_on
---

# The Hydric Gateway Constitution

## 1. Strategic Identity: The "Unified Financial Model"

The **Hydric Gateway API** is the definitive **DeFi Intelligence Layer**. It serves as the "Universal Translator" that bridges the gap between fragmented, protocol-specific blockchain state and institutional-grade financial data.

- **Primitive-Based Normalization:** Hydric does not model protocols; it models **Financial Primitives**. Whether a user is querying a Uniswap Pool, an Aave Lending Market, or a Lido Staking Vault, the data conforms to a shared, stable, and predictable schema.
- **Infrastructure-First:** Every response is a financial contract. We provide the "Public Contract" of the DeFi ecosystem: deterministic, structure-immutable, and optimized for automated consumption.

## 2. Core Product Pillars: The Financial Primitives

Hydric organizes the chaos of DeFi into discrete primitives to ensure cross-protocol comparability. Protocol-specific behavior is abstracted within each primitive while maintaining high-fidelity metadata.

| Primitive           | Example Normalized Concepts                          | Example Use Cases                  |
| :------------------ | :--------------------------------------------------- | :--------------------------------- |
| **Liquidity Pools** | TVL, reserves, volume, fee-derived yield             | Dashboards, yield comparison       |
| **Lending Markets** | Supply/borrow rates, utilization, collateral factors | Risk analysis, lending integration |
| **Swaps & Events**  | Trade value, execution price, slippage               | Analytics, automation              |

### A. Primitive-Based Normalization

Data is normalized by financial primitive, not by protocol. Different implementations of the same primitive (e.g., Uniswap V3 vs. Algebra Integral) conform to a shared, stable schema to ensure ease of integration.

### B. Derived Metrics

Higher-level intelligence, such as rolling yields, utilization rates, and health factors—is computed using documented, deterministic logic applied to the indexed state.

---

## 3. The "Elite" Engineering Principles

### Semantic Transparency (The No-Inference Rule)

Hydric never "guesses." We do not smooth, interpolate, or estimate core financial metrics.

- **Truth over Aesthetics:** If data is missing or a sync is incomplete, we return `null`. A fast wrong answer is a failure; a deterministic `null` is a professional response.
- **Explicit Nullability:** Missing or invalid data must be returned as `null` with a deterministic reason. Silent omission is forbidden.

### Structural Rigidness

Our B2B partners rely on our DTOs as a foundation.

- **Breaking Changes:** Renaming a field or changing a data type is a violation of the protocol’s reliability promise.
- **Institutional Naming:** Field names must be semantic and professional (e.g., `balances` instead of `total value locked`, `utilization` instead of `usage`).

### Architectural Preservation

Normalization must never lead to "Information Loss."

- While we normalize the _Interface_ for comparability, we expose the _Innovation_ (e.g., V4 Hooks or specialized Lending risk logic) via protocol-specific `metadata` extensions.

---

## 4. Determinism & Reliability

- **Precise Precision:** All asset balances and raw financial values are handled as **Strings/BigInts** to prevent floating-point corruption. Human-readable `number` values are reserved for display or USD-denominated metrics.
- **Sync-Aware Responses:** The API is biologically linked to the Hydric Indexing Layer. If a data source is lagging, the API must signal this status predictably via health headers. We never serve "stale" data as "fresh."
- **Deterministic Weighting:** Price resolution and asset weighting follow documented, liquidity-weighted algorithms.

## 5. Success Metric

**Hydric is successful when a developer or institution can build a professional-grade DeFi dashboard, yield aggregator, or automated risk-management engine using _exclusively_ our endpoints, without ever needing to query a blockchain node or a secondary data provider.**
