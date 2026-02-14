import { LiquidityPoolOrderField } from '@core/enums/liquidity-pool/liquidity-pool-order-field';
import { LiquidityPoolStatsTimeframe } from '@core/enums/liquidity-pool/liquidity-pool-stats-timeframe';
import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { ILiquidityPoolOrder } from '@core/interfaces/liquidity-pool/liquidity-pool-order.interface';
import { ITokenOrder } from '@core/interfaces/token/token-order.interface';
import { Order_By, Pool_Order_By, PoolTimeframedStats_Order_By, SingleChainToken_Order_By } from '@gen/graphql.gen';

export const LiquidityPoolsIndexerRequestAdapter = {
  poolOrderToIndexer: liquidityPoolOrderToIndexer,
  tokenOrderToIndexer: tokenOrderToIndexer,
  buildEntityId: buildEntityId,
};

function buildEntityId(chainId: number, address: string): string {
  return `${chainId}-${address.toLowerCase()}`;
}

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

function tokenOrderToIndexer(order: ITokenOrder): SingleChainToken_Order_By {
  const direction = orderDirectionToIndexer(order.direction);

  switch (order.field) {
    case TokenOrderField.TVL: {
      return {
        trackedTotalValuePooledUsd: direction,
      };
    }
  }
}
