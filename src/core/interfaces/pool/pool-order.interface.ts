import { OrderDirection } from '../../enums/order-direction';
import { PoolOrderField } from '../../enums/pool/pool-order-field';
import { PoolStatsTimeframe } from '../../enums/pool/pool-stats-timeframe';

export interface IPoolOrder {
  field: PoolOrderField;
  direction: OrderDirection;
  timeframe: PoolStatsTimeframe;
}
