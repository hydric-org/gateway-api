import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';

export interface ITokenOrder {
  field: TokenOrderField;
  direction: OrderDirection;
}
