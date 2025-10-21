import { SingleChainTokenDTO } from './dtos/single-chain-token-dto';
import { singleChainTokenCacheKey } from './keys';

export class MemoryCache {
  private cache = new Map<string, any>();

  private _set<T>(key: string, obj: T): void {
    this.cache[key] = obj;
  }

  private _get<T>(key: string): T | undefined {
    return this.cache[key];
  }

  setSingleChainToken(token: SingleChainTokenDTO, network: number): void {
    this._set<SingleChainTokenDTO>(singleChainTokenCacheKey(token.address, network), token);
  }

  getSingleChainToken(address: string, network: number): SingleChainTokenDTO | undefined {
    return this._get<SingleChainTokenDTO>(singleChainTokenCacheKey(address, network));
  }
}
