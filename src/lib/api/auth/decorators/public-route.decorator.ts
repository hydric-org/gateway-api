import { DecoratorKey } from '@lib/api/common/decorator-key';
import { SetMetadata } from '@nestjs/common';

export const PublicRoute = () => SetMetadata(DecoratorKey.PUBLIC_ROUTE, true);
