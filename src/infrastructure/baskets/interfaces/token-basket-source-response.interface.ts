import { ChainId } from '@core/enums/chain-id';

export interface ITokenBasketSourceResponse {
  id: string;
  name: string;
  description: string;
  logo: string;
  lastUpdated: string;
  addresses: Record<ChainId, string[]>;
}
