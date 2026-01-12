import { OrderDirection } from '@core/enums/order-direction';
import { PoolOrderField } from '@core/enums/pool/pool-order-field';
import { PoolStatsTimeframe } from '@core/enums/pool/pool-stats-timeframe';
import { IPoolOrder } from '@core/interfaces/pool/pool-order.interface';
import { Order_By, Pool_Order_By, PoolTimeframedStats_Order_By } from '@gen/graphql.gen';

export const PoolsIndexerRequestAdapter = {
  poolOrderToIndexer,
};

function orderDirectionToIndexer(direction: OrderDirection): Order_By {
  return direction === OrderDirection.DESC ? Order_By.Desc : Order_By.Asc;
}

function poolStatsTimeframeToPoolStatsKey(timeframe: PoolStatsTimeframe): keyof Pool_Order_By {
  const statsKeyMap: Record<PoolStatsTimeframe, keyof Pool_Order_By> = {
    [PoolStatsTimeframe.DAY]: 'totalStats24h',
    [PoolStatsTimeframe.WEEK]: 'totalStats7d',
    [PoolStatsTimeframe.MONTH]: 'totalStats30d',
    [PoolStatsTimeframe.QUARTER]: 'totalStats90d',
  };

  return statsKeyMap[timeframe];
}

function poolOrderToIndexer(orderConfig: IPoolOrder): Pool_Order_By {
  const direction = orderDirectionToIndexer(orderConfig.direction);

  switch (orderConfig.field) {
    case PoolOrderField.YIELD: {
      const timeframedStatsKey = poolStatsTimeframeToPoolStatsKey(orderConfig.timeframe);
      const statOrderBy: PoolTimeframedStats_Order_By = {
        yearlyYield: direction,
      };

      return {
        [timeframedStatsKey]: statOrderBy,
      };
    }

    case PoolOrderField.TVL: {
      return {
        trackedTotalValueLockedUsd: direction,
      };
    }
  }
}
