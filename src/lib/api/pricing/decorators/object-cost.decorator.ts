import { DecoratorKey } from '@lib/api/common/decorator-key';
import { SetMetadata } from '@nestjs/common';

export const ObjectCost = (cost: number) => SetMetadata(DecoratorKey.OBJECT_COST, cost);
