import { ITokenGroup } from './token-group.interface';
import { IMultichainToken } from './token/multi-chain-token.interface';

export interface ITokenList {
  popularTokens: IMultichainToken[];
  tokenGroups: ITokenGroup[];
}
