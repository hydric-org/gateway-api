import { MultichainTokenDTO } from './multi-chain-token.dto';
import { TokenGroupDTO } from './token-group.dto';

export interface TokenListDTO {
  popularTokens: MultichainTokenDTO[];
  tokenGroups: TokenGroupDTO[];
}
