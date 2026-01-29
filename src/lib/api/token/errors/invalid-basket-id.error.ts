import { BasketIdUtils } from '@core/enums/token/basket-id.enum';
import { ValidationErrorCode } from '../../error/error-codes/validation-error-codes';
import { BaseApiError } from '../../error/errors/base-api-error';

export class InvalidBasketIdError extends BaseApiError {
  constructor(params: { basketId: string }) {
    const supportedIds = BasketIdUtils.values();

    super({
      message: `Invalid Basket ID: ${params.basketId}`,
      errorCode: ValidationErrorCode.INVALID_BASKET_ID,
      details: `The provided ID is not supported. Supported IDs are: ${supportedIds.join(', ')}`,
      metadata: {
        basketId: params.basketId,
        supportedIds: supportedIds,
      },
    });
  }
}
