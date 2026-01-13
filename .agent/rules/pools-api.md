---
trigger: always_on
---

# 1. Strategic Identity & Mission

The **Pools API** is the definitive "Liquidity Pools Intelligence Layer" for Hydric. Its mission is to transform raw, fragmented blockchain events into a unified, institutional-grade data feed.

- **B2B Mandate:** This is a professional-first infrastructure. Every response must be treated as a financial contract: deterministic, accurate, and structured for automated consumption by third-party protocols, dashboards, and institutional investors.

- **The Aggregator Role:** The API serves as the "Universal Translator" for the [Pools Indexer](https://github.com/Zup-Protocol/pools-indexer). It exists to hide the complexity of varying DEX architectures (V3, V4, Algebra, etc.) behind a clean, normalized interface.

# 2. Scope of Capabilities (The Product)

The API is the single source of truth for the "Liquidity Lifecycle." Its capabilities are categorized into three core pillars:

## A. Liquidity Discovery & Analytics

- **Pool Intelligence:** Serving rich metadata for single pools, including cross-timeframe performance (24h to 90d) for Yield, Volume, Fees, and Net Inflow.
- **Discovery Engine:** Powering complex "Rank & Sort" operations across thousands of pools to find the highest TVL, best yield, or deepest liquidity for specific asset pairs.

## B. Asset & Protocol Intelligence

- **Token Ecosystem:** Providing a holistic view of tokens, including real-time USD pricing backed by liquidiyt pools, multi-chain presence, and total liquidity depth across all supported DEXs and networks.

- **Infrastructure Mapping:** Cataloging supported Decentralized Exchanges (DEXs) and their metadata, ensuring users know exactly where their liquidity is hosted and the rules (V3/V4/etc.) that govern it.

## C. Network-Wide Transparency

- **Chain-Level Data:** Aggregating liquidity metrics at the blockchain level to provide a "Macro" view of the protocol’s health.

# 3. The Data Engine (The Indexer Link)

The API is biologically tied to the Pools Indexer.

- **Schema Governance:** The [indexer's schema](https://github.com/Zup-Protocol/pools-indexer/blob/main/schema.graphql) defines the "Realm of the Possible." If a data point exists in the schema, the API must be capable of exposing it.

- **Evolutionary Design:** If a business requirement demands data not currently indexed, the Indexer must be extended first. The API should never "fake" or calculate core blockchain data that belongs in the indexing layer; it serves only to present it.

# 4. Non-Negotiable Business Constraints

To maintain "Elite" status, these principles must never be compromised:

- **Accuracy over Speed:** In DeFi, a fast wrong answer is worse than a slow right one. Calculations involving Yield and TVL must be verified for mathematical correctness before being exposed.

- **Institutional Availability:** The API must remain performant even during heavy indexer syncing. It should prioritize "Steady State" data but remain transparent about its health via the heartbeat.

- **Structural Rigidness:** B2B partners rely on stable JSON structures. Changing existing field names or removing data points is a "Breaking Change" that violates the protocol’s reliability promise.

- **Normalization:** A "Pool" must look like a "Pool" regardless of whether it is an Algebra, Slipstream, or Uniswap-style architecture. The API is responsible for the "Sameness" of data across different DEX designs.

# 5. Success Metric

The API is successful if a developer or institution can build a complete, professional-grade DeFi dashboard using exclusively these endpoints, without ever needing to query a blockchain node or a secondary data provider.

# 6. Determinism & Failure Semantics

- **No Inference Rule:** The API must never infer, interpolate, smooth, or estimate core financial metrics (price, TVL, yield, volume). If data is unavailable or incomplete, it must be explicitly marked as such.

- **Explicit Nullability:** Missing or invalid data must be returned as `null` with a deterministic reason code. Silent omission is forbidden.

- **Price Resolution Priority:** When multiple pools provide pricing for the same asset, resolution must follow a deterministic, documented priority order (e.g. liquidity-weighted median). No ad-hoc selection.

- **Sync Degradation Mode:** During indexer sync, the API must degrade predictably:

  - Historical finalized data remains served.
  - Unfinalized windows are flagged or withheld.
  - Health status must reflect degradation.

- **Normalization Loss Disclosure:** If a DEX feature cannot be normalized without loss of meaning, the API must expose this limitation explicitly rather than approximate.