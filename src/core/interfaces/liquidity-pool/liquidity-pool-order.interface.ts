import { LiquidityPoolOrderField } from '@core/enums/liquidity-pool/liquidity-pool-order-field';
import { LiquidityPoolStatsTimeframe } from '@core/enums/liquidity-pool/liquidity-pool-stats-timeframe';
import { OrderDirection } from '@core/enums/order-direction';

export interface ILiquidityPoolOrder {
  field: LiquidityPoolOrderField;
  direction: OrderDirection;
  timeframe: LiquidityPoolStatsTimeframe;
}
