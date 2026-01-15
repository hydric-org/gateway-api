import { LiquidityPoolOrderField } from '@core/enums/liquidity-pool/liquidity-pool-order-field';
import { LiquidityPoolStatsTimeframe } from '@core/enums/liquidity-pool/liquidity-pool-stats-timeframe';
import { OrderDirection } from '@core/enums/order-direction';
import { ILiquidityPoolOrder } from '@core/interfaces/liquidity-pool/liquidity-pool-order.interface';
import { Order_By, Pool_Order_By, PoolTimeframedStats_Order_By } from '@gen/graphql.gen';

export const LiquidityPoolsIndexerRequestAdapter = {
  poolOrderToIndexer: liquidityPoolOrderToIndexer,
};

function orderDirectionToIndexer(direction: OrderDirection): Order_By {
  return direction === OrderDirection.DESC ? Order_By.Desc : Order_By.Asc;
}

function liquidityPoolStatsTimeframeToPoolStatsKey(timeframe: LiquidityPoolStatsTimeframe): keyof Pool_Order_By {
  const statsKeyMap: Record<LiquidityPoolStatsTimeframe, keyof Pool_Order_By> = {
    [LiquidityPoolStatsTimeframe.DAY]: 'totalStats24h',
    [LiquidityPoolStatsTimeframe.WEEK]: 'totalStats7d',
    [LiquidityPoolStatsTimeframe.MONTH]: 'totalStats30d',
    [LiquidityPoolStatsTimeframe.QUARTER]: 'totalStats90d',
  };

  return statsKeyMap[timeframe];
}

function liquidityPoolOrderToIndexer(order: ILiquidityPoolOrder): Pool_Order_By {
  const direction = orderDirectionToIndexer(order.direction);

  switch (order.field) {
    case LiquidityPoolOrderField.YIELD: {
      const timeframedStatsKey = liquidityPoolStatsTimeframeToPoolStatsKey(order.timeframe);
      const statOrderBy: PoolTimeframedStats_Order_By = {
        yearlyYield: direction,
      };

      return {
        [timeframedStatsKey]: statOrderBy,
      };
    }

    case LiquidityPoolOrderField.TVL: {
      return {
        trackedTotalValueLockedUsd: direction,
      };
    }
  }
}
