---
trigger: always_on
---

# Hydric: API Structural Architecture

## 1. Directory Hierarchy & Core Philosophy

The codebase is organized into four distinct "Logical Zones." This structure enforces the **Inward Dependency Rule**: logic flows from external adapters towards the core domain. Frameworks (NestJS) and protocols (GraphQL) must never leak into the Core.

### A. Core (`src/core`) — The Domain Center

- **Role:** The source of truth for business logic. Contains only pure TypeScript.
- **Strict Rule:** **Zero dependencies** on NestJS, Axios, GraphQL, or external libraries.
- **Sub-Directories:**
  - `enums/`: Business-logic enums (e.g., `PoolType`, `Network`).
  - `interfaces/`: Domain entities and data contracts (e.g., `pool.interface.ts`).
  - `errors/`: Pure domain error classes (e.g., `pool-not-found.error.ts`).
  - `extensions/`: Shared TypeScript prototypes or native object extensions.

### B. Infrastructure (`src/infrastructure`) — The External Adapters

- **Role:** Handles all communication with the [Pools Indexer](https://github.com/Zup-Protocol/pools-indexer) and external services.
- **Components:**
  - `graphql/`: Contains `.graphql` queries and auto-generated TypeScript types.
  - `indexer/clients/`: Wrapper classes (e.g., `PoolsIndexerClient`) for external requests.
  - `indexer/adapters/`: Mapping logic that transforms Indexer-specific GQL objects into Core Interfaces.
- **Rule:** If we switch indexer providers, _only_ this folder should be modified.

### C. Modules (`src/modules`) — The Feature Orchestration

- **Role:** Organized by business domain (Pools, Tokens, Protocols). Each module is a vertical slice.
- **Standard Module Layout:**
  - `[feature].controller.ts`: HTTP entry point (Routing, Swagger, Input Validation).
  - `[feature].service.ts`: Orchestrates calls between infrastructure clients and domain logic.
  - `[feature].module.ts`: The NestJS wiring (dependency injection).

### D. Lib (`src/lib`) — Shared API Infrastructure

- **Role:** Framework-specific utilities and reusable API boilerplate.
- **Components:**
  - `api/common/`: Shared DTOs and Transformers (e.g., `round-usd-transformer.ts`).
  - `api/error/`: API-level error mapping and error codes.
  - `identifiers/`: Logic for parsing and validating specific ID types (e.g., `pool-address.ts`).
  - `app/bootstrap/`: Centralized NestJS configuration (Security, Swagger, CORS).

## 2. File Naming Conventions

To maintain professional consistency, all files must follow the kebab-case pattern with descriptive suffixes:

| File Type        | Suffix           | Example                             |
| :--------------- | :--------------- | :---------------------------------- |
| **Controller**   | `.controller.ts` | `pools.controller.ts`               |
| **Service**      | `.service.ts`    | `pools.service.ts`                  |
| **Interface**    | `.interface.ts`  | `pool.interface.ts`                 |
| **DTO (Input)**  | `-input.dto.ts`  | `pool-filter-input.dto.ts`          |
| **DTO (Output)** | `-output.dto.ts` | `pool-output.dto.ts`                |
| **Error**        | `.error.ts`      | `pool-not-found.error.ts`           |
| **Adapter**      | `-adapter.ts`    | `pools-indexer-response-adapter.ts` |

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
