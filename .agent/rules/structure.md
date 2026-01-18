---
trigger: always_on
---

# Hydric Gateway API Structural Architecture

## 1. Directory Hierarchy & Core Philosophy

The codebase is organized into four distinct "Logical Zones." This structure enforces the **Inward Dependency Rule**: logic flows from external adapters towards the core domain. Frameworks (NestJS) and protocols (GraphQL) must never leak into the Core.

### A. Core (`src/core`) — The Domain Center

- **Role:** The source of truth for business logic. Contains only pure TypeScript.
- **Strict Rule:** **Zero dependencies** on NestJS, Axios, GraphQL, or external libraries.
- **Sub-Directories:**
  - `enums/`: Business-logic enums (e.g., `LiquidityPoolType`, `Network`).
  - `interfaces/`: Domain entities and data contracts (e.g., `liquidity-pool.interface.ts`).
  - `errors/`: Pure domain error classes (e.g., `liquidity-pool-not-found.error.ts`).
  - `extensions/`: Shared TypeScript prototypes or native object extensions.
  - `types/`: Types that the whole application would use

### B. Infrastructure (`src/infrastructure`) — The External Adapters

- **Role:** Handles all the communications against external services, doesn't matter if it's auth, indexing, etc. All the communications with external services should be done here.
- **Components:**
  - `graphql/`: Contains `.graphql` queries and auto-generated TypeScript types.
  - `indexer/clients/`: Wrapper classes (e.g., `LiquidityPoolsIndexerClient`) for external requests to the indexer.
  - `indexer/adapters/`: Mapping logic that transforms Indexer-specific GQL objects into Core Interfaces.
- **Rule:** If we switch external providers, only this folder should be modifed.

### C. Modules (`src/modules`) — The Feature Orchestration

- **Role:** Organized by business domain (Pools, Tokens, Protocols). Each module is a vertical slice.
- **Standard Module Layout:**
  - `[feature].controller.ts`: HTTP entry point (Routing, Swagger, Input Validation).
  - `[feature].service.ts`: Orchestrates calls between infrastructure clients and domain logic.
  - `[feature].module.ts`: The NestJS wiring (dependency injection).

### D. Lib (`src/lib`) — Shared API Infrastructure

- **Role:** Framework-specific utilities and reusable API boilerplate.
- **Components:**
  - `api/common/`: Things that the whole api folder could use (e.g., `round-usd-transformer.ts`).
  - `api/error/`: API-level error mapping, error codes and everyrhing related to global error things.
  - `identifiers/`: Logic for parsing and validating specific ID types (e.g., `protocol-id.ts`).
  - `app/`: Centralized NestJS configuration (Security, Swagger, CORS, etc.).

## 2. File Naming Conventions

To maintain professional consistency, all files must follow the kebab-case pattern with descriptive suffixes:

| File Type      | Suffix           | Example                                       |
| :------------- | :--------------- | :-------------------------------------------- |
| **Controller** | `.controller.ts` | `pools.controller.ts`                         |
| **Service**    | `.service.ts`    | `pools.service.ts`                            |
| **Interface**  | `.interface.ts`  | `liquidity-pool.interface.ts`                 |
| **DTO**        | `.dto.ts`        | `liquidity-pool-filter.dto.ts`                |
| **Error**      | `.error.ts`      | `pool-not-found.error.ts`                     |
| **Adapter**    | `.adapter.ts`    | `liquidity-pools-indexer-response.adapter.ts` |

## 3. Implementation Guardrails

1.  **Isolation:** Logic belongs in **Services**; Routing and Documentation belong in **Controllers**.
2.  **No Direct Process Env:** Never use `process.env`. Use the validated `ConfigService`.
3.  **The Adapter Mandate:** Every Infrastructure Client _must_ use an Adapter to return a Core Interface. Raw GraphQL objects are **prohibited** from reaching Services or Controllers.
4.  **Type Safety:** `any` is a breaking violation. Every external response must be typed via GraphQL Codegen or custom interfaces.

## 4. Absolute Consistency

Predictability is a core requirement of the codebase. You must maintain strict consistency across all abstractions, including class names, file naming conventions, function signatures, and directory structures.

### 4.1 Pattern Adherence

Existing patterns in the codebase override external "best practices" or personal preferences.

- **Example:** If the protocol uses the naming scheme `[Asset]V4` (e.g., `PoolV4`), do not generate `AlgebraPool`. You must either generate `AlgebraV4`, or change both if it make the code better.
- **Standardization:** Before generating new code, scan the relevant directory to identify the established naming convention and replicate it exactly.

### 4.2 Refactoring Protocol

When tasked with refactoring, your primary goal is the restoration of consistency.

- **Scope:** If a refactor is requested for a specific component, identify all related instances across the codebase and align them to the new, consistent standard.
- **Zero Deviance:** Introducing a new naming style without migrating the old ones is strictly prohibited.

### 4.3 Hierarchy of Truth

If you encounter conflicting patterns within the codebase, follow this priority:

1. **Core Protocol Files:** Match the naming used in the most critical, central contracts or modules.
2. **Most Recent Files:** Match the conventions used in the most recently updated files.
3. **The Scout Rule:** If you must choose between two patterns, choose the more descriptive one, but apply it globally to the task at hand.

### 4.4 Searchability: File and Class Alignment

To ensure the codebase is instantly searchable via global search or "Go to File" shortcuts, there must be an explicit, symmetrical relationship between file names and their contents.

- **Explicit Mapping:** The filename must explicitly follow the primary class, interface, or contract name and vice versa. But you should not include the type of the file in the class name, for example if the file name is `liquidity-provider.dto.ts` the class would be called `LiquidityProvider` but under a DTO folder
- **Direct Correspondence:** If you are looking for a class named `LiquidityProvider`, it must be located in a file named `liquidity-provider` (e.g., `liquidity-provider.sol` or `liquidity-provider.ts`).
- **File name case:** The file name should be always kebab-case

### 4.5 Explicit File Naming

Files must be named so that their purpose is clear without opening them.

- **No "Magic" Names:** Avoid generic names like `helper.ts`, `data.json`, or `script.js`. If a file contains price calculation logic for an Algebra pool, it should be `AlgebraPriceCalculator.ts`.
- **Contextual Suffixes:** If the codebase uses suffixes for organization (e.g., `user-service.ts`, `user-store.ts`, `user-component.tsx`), you must follow this pattern for all new files in that module.
- **Predictable Paths:** The file name should represent the "leaf" of its directory tree. If it is inside `/pools/algebra/`, the file should be `algebra-pool.ts`, not just `pool.ts`, to avoid having ten different files named `pool.ts` open in your editor tabs.
