import { Network } from '../../enums/network';

export interface IMultichainToken {
  id: string;
  name: string;
  symbol: string;
  decimals: Record<Network, number | null>;
  addresses: Record<Network, string | null>;
  logoUrl?: string;
}
