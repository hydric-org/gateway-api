import { ChainId, ChainIdUtils } from '@core/enums/chain-id';
import { UnsupportedChainIdError } from '@lib/api/network/errors/unsupported-chain-id.error';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseChainIdArrayPipe implements PipeTransform<string | string[] | undefined, ChainId[] | undefined> {
  transform(value: string | string[] | undefined): ChainId[] | undefined {
    if (value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return undefined;
    }

    const rawValues = Array.isArray(value) ? value : value.split(',');
    const chainIds: ChainId[] = [];

    for (const rawValue of rawValues) {
      const trimmedValue = rawValue.trim();
      if (trimmedValue === '') continue;

      const chainId = Number(trimmedValue);

      if (isNaN(chainId)) {
        throw new BadRequestException(`Validation failed: "${trimmedValue}" is not a valid numeric Chain ID.`);
      }

      if (!ChainIdUtils.includes(chainId)) {
        throw new UnsupportedChainIdError({
          chainId,
        });
      }

      chainIds.push(chainId as ChainId);
    }

    return chainIds.length > 0 ? chainIds : undefined;
  }
}
