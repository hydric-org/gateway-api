import { Networks } from '../enums/networks';

export interface MultichainTokenDTO {
  id: string;
  name: string;
  symbol: string;
  decimals: Record<Networks, number | null>;
  addresses: Record<Networks, string | null>;
  logoUrl?: string;
}
