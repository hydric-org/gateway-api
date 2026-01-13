---
trigger: always_on
---

# Zup Protocol: Type Safety & Data Transformation Standards

## 1. The "No-Leak" Policy

The internal structure of our Data Source (the Indexer) must never be exposed directly to the API consumer. The API is a curated view, not a passthrough.

- **Mandatory Adapters:** Every raw response from `src/infrastructure` must pass through a `ResponseAdapter` before reaching a Service.
- **Strict Mapping:** Adapters must explicitly map every field. Avoid using spread operators (`...`) when converting Indexer objects to Core Interfaces, as this leaks unvalidated external types into our domain.

## 2. DTO Integrity & Validation

DTOs (Data Transfer Objects) are the only legal way to move data across the network.

- **Input Validation:** Every input DTO must use `class-validator` decorators (e.g., `@IsNotEmpty()`, `@IsEnum()`). If it's not validated, it doesn't exist.
- **Output Transformation:** Use `class-transformer` to ensure data types are correct before serialization.
  - **Currency:** Always use the `RoundUsdTransformer` for financial values.
  - **Booleans:** Ensure string-based booleans from query params are cast to actual primitives.

## 3. Financial Precision Standards

As a liquidity aggregator, mathematical precision is non-negotiable.

- **Large Numbers:** Blockchain numbers (BigInts) must be handled with care. If a value exceeds the safe integer limit of JavaScript, it must be handled as a `string` in the DTO to avoid precision loss on the client side.
- **Consistency:** Yield percentages, TVL, and Volume must follow a consistent rounding rule defined in `src/lib/api/common/transformers/`.

## 4. Custom Identifiers & Formatters

The Zup Protocol uses specific formats for identifying assets across chains.

- **Address Checksumming:** All `poolAddress` and `tokenAddress` inputs must be validated using the `IsPoolAddress` or `IsValidTokenId` validators.
- **Case Sensitivity:** The API should be case-insensitive on input but strictly consistent (typically lowercased or checksummed) on output. Use the `StringExtension` to normalize strings at the entry point.

## 5. The "Anti-Any" Mandate

The use of `any` or `unknown` as a final type is a high-severity violation.

- **GraphQL Codegen:** Always use the types generated in `src/infrastructure/graphql` to type your Indexer responses.
- **Discriminated Unions:** For pools that vary by architecture (V3, V4, etc.), use Discriminated Unions to ensure that if a pool is marked as `V4`, the `v4PoolData` field is strictly required and typed.

## 6. Self-Correction Check

When creating a new data field, ask:

1. Is this field present in the `Core Interface`?
2. Does the `Indexer Response Adapter` explicitly map it?
3. Does the `Output DTO` have an `@ApiProperty` description and a `class-transformer` decorator?
4. Is there a unit test in `.spec.ts` verifying the mapping from raw GQL to the final DTO?

---

### Why this rule?

This rule prevents "Silent Failures" where the API returns a 200 OK but the data inside is null, wrongly formatted, or mathematically incorrect. It ensures the Zup Protocol remains a "Source of Truth" for every partner using it.
