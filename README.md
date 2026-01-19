# hydric Gateway API

### The Unified Financial Intelligence Layer for DeFi

hydric Gateway is the "Single Plug" for multi-chain DeFi data. It serves as the semantic normalization layer, transforming raw blockchain state indexed by the hydric Indexing Layer indexers into institutional-grade, primitive-based financial intelligence.

[Documentation](https://docs.hydric.org) | [API Reference](https://docs.hydric.org/api-reference) | [Swagger UI](https://api.hydric.org/v1/openapi)

---

## The hydric Thesis

The Gateway API is built on three core engineering principles to ensure a great infrastructure:

1. **Primitive-Based Normalization:** We model DeFi through discrete financial primitives (Liquidity Pools, Lending, Staking), ensuring cross-protocol comparability.
2. **Architectural Preservation:** While we normalize financials, we preserve innovation. Protocol-specific nuances (like V4 Hooks, Algebra Plugins, or Slipstream invariants) are exposed through structured metadata.
3. **Deterministic Accuracy:** No inference. No guessing. If the data is unfinalized or the indexing layer is syncing, we return deterministic `null` values rather than estimated or "smoothed" metrics.

## Getting Started

### Prerequisites

- **Node.js** v20.10.0+
- **Yarn** v4.0.0+ (Corepack enabled)

### Installation

```
corepack enable
yarn install
```

### Environment Setup

Copy the example environment file and configure your providers:

```
cp .env.example .env
```

### Development

#### Start the gateway in watch mode

```
yarn start:dev
```

#### Run unit & integration tests

```
yarn test
```

#### Build for production

```
yarn build
```

---

## Stress Testing

We use [k6](https://k6.io/) to perform stress and load testing on the production API.

### Running Tests

All stress tests are located in the `stress-tests/` directory.

- **Load Test**: Baseline performance (up to 10 VUs).
  ```bash
  k6 run -e SCENARIO=load stress-tests/stress-test.js
  ```
- **Stress Test**: Pushing limits (up to 80 VUs).
  ```bash
  k6 run -e SCENARIO=stress stress-tests/stress-test.js
  ```

### Automated Reporting

To generate a comparative performance report:

```bash
k6 run --summary-export=summary.json stress-tests/stress-test.js
node stress-tests/generate-report.js
```

The results will be updated in [STRESS_TEST_REPORT.md](./STRESS_TEST_REPORT.md).
