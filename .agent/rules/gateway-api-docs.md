---
trigger: always_on
---

# hydric Gatway API Documentation & Transparency Standards

## 1. The Documentation Mandate

Documentation is not an "extra"—it is a core feature of hydric. Every element exposed to an API consumer must be fully documented via **Swagger (OpenAPI)**. A feature is not considered "done" until its public contract is perfectly described.

- **Rule of Zero Ambiguity:** An external developer must be able to integrate any endpoint without asking a single question to our team.
- **The "Broke Rule":** Exposing a variable, endpoint, or error code to the end consumer without Swagger documentation is a high-severity violation of our quality standards.

## 2. DTO Documentation Standards

Data Transfer Objects (DTOs) are the backbone of our communication. Every property in a DTO must be decorated with `@ApiProperty` or `@ApiPropertyOptional`. Also, the DTO itself must be decorated with `@ApiSchema` and a clear description about it.

- **Mandatory Fields:** Every `@ApiProperty` must include:
  - `description`: A clear, business-logic explanation of what the field represents.
  - `example`: A real-world value (e.g., a checksummed ETH address, a TVL number).
  - `type` or `enum`: Explicitly state the data type or the allowed Enum values.
- **Validation Transparency:** Any `@IsInt()`, `@IsEnum()`, or custom validation logic must be reflected in the documentation so the consumer knows the constraints before they hit "Send."

## 3. Controller & Endpoint Documentation

Each controller method must be a "Single Source of Truth" for that endpoint's behavior.

- **Operation Identity:** Use `@ApiOperation` to summarize the business purpose of the endpoint.
- **Success Contracts:** Use `@ApiOkResponse` or `@ApiCreatedResponse` with the specific `type` of the output DTO.
- **Decorator Reuse:** For complex endpoints (like Pool Searches), use our "Elite" custom decorators (e.g., `@SearchLiquidityPoolsDocs()`) to maintain clean controllers while providing rich documentation.

## 4. Error Transparency (The B2B Failure Contract)

In institutional DeFi, understanding _why_ a request failed is as important as the data itself.

- **Explicit Error Codes:** All possible error responses (400, 401, 404) must be documented.
- **Error Schemas:** Ensure the `ErrorResponse` DTO is used to document the structure of error responses, including the `code`, `message`, and `traceId`.
- **Domain Specificity:** If an endpoint can return a `LiquidityPoolNotFoundError` for example, the documentation must explicitly state the HTTP 404 condition and the specific Error Code associated with it.

## 5. Variable & Logic Nuance

Documentation must explain the _behavior_, not just the _type_.

- **Sorting/Filtering:** Document the default values and the impact of specific filters (e.g., "If no network is specified, results from all supported chains are returned").
- **Address Formats:** Always specify that addresses are expected in EVM-compatible formats (and mention if they are case-sensitive).

## 6. The Developer "Self-Audit"

Before submitting a Pull Request, the developer must verify:

1.  **Does the Swagger UI (`/openapi`) look professional?**
2.  **Are there any "Undefined" or "Object" types in the response examples?**
3.  **Are all enums listed with their possible values?**
4.  **If I were a third-party dev, could I use this endpoint using _only_ these docs?**

---

### Why this rule?

By enforcing these standards, we ensure **Hydric** is synonymous with reliability. High-quality documentation reduces support overhead, builds trust with partners, and accelerates the adoption of our liquidity layer.
