import { MultichainTokenDTO } from './multi-chain-token.dto';

export interface TokenGroupDTO {
  id: string;
  name: string;
  tokens: MultichainTokenDTO[];
}
