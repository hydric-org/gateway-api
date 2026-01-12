import { IMultichainToken } from './token/multi-chain-token.interface';

export interface ITokenGroup {
  id: string;
  name: string;
  tokens: IMultichainToken[];
}
