import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { IsTokenListCursor } from '../validators/is-token-list-cursor.validator';
import { TokenOrder } from './token-order.dto';

export class MultiChainTokenListConfig {
  @ApiPropertyOptional({
    description: `
Toggles the inclusion of multiple assets sharing the exact same ticker symbol.

* **false (Default):** Returns only the single most liquid (highest TVL) instance per chain. This is the "Canonical View" used to filter out secondary deployments.
* **true:** Includes every asset on a chain that matches the symbol string exactly, provided they pass basic price and metadata parity checks.

> ### ⚠️ Security Note
> When set to \`true\`, the probability of encountering **impersonation or scam tokens** increases. While hydric applies secondary heuristics (price,liquidity, etc.), enabling this flag bypasses the primary canonical filter. **Users assume all risks associated with verifying the authenticity of non-canonical contract addresses returned by this configuration.**`,
    default: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  readonly matchAllSymbols: boolean = false;

  @ApiPropertyOptional({
    description: 'The number of items to return in the response.',
    minimum: 1,
    maximum: 500,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  readonly limit: number = 10;

  @ApiPropertyOptional({
    description: `
Ordering configuration for the result.

**Critical Notes:**
- **Sequence Integrity:** Do not expect a 100% perfect sequence. Because multi-chain data is computed on-the-fly, some tokens may appear slightly out of order. This is an approximation used to maintain high-speed responses.
- **Pagination Warning:** Changing the sorting parameters while using a cursor will break your pagination flow and return inconsistent results.
    `,
    type: TokenOrder,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TokenOrder)
  readonly orderBy: TokenOrder = new TokenOrder();

  @ApiPropertyOptional({
    description:
      'Base64-encoded cursor for pagination. Fetch this from the "nextCursor" field of a previous response. Do not pass this if you want to start from the beginning.',
    example: null,
    default: null,
  })
  @IsOptional()
  @IsString()
  @IsTokenListCursor()
  readonly cursor?: string;
}
