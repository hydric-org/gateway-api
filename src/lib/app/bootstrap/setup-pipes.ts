import { ValidatorKey, ValidatorKeyUtils } from '@lib/api/common/validator-key';
import { GenericValidationError } from '@lib/api/error/errors/generic-validation.error';
import { INestApplication, ValidationError, ValidationPipe } from '@nestjs/common';

export function setupPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },

      exceptionFactory: (errors: ValidationError[]) => {
        const { leaf: leafError, path: fullPath } = findValidationError(errors[0]);

        const constraints = leafError.constraints || {};
        const constraintKeys = Object.keys(constraints);

        if (constraintKeys.length === 0) {
          return new GenericValidationError({
            validationErrorDescription: `Validation failed on property ${fullPath}`,
            meta: { property: fullPath, value: leafError.value },
          });
        }

        const constraint = constraintKeys[0];

        if (ValidatorKeyUtils.isValidatorKey(constraint)) {
          return ValidatorKeyUtils.validationError(leafError.value, constraint as ValidatorKey);
        }

        return new GenericValidationError({
          validationErrorDescription: constraints[constraint] || 'Unknown validation error',
          meta: {
            property: fullPath,
            value: leafError.value,
            constraint: constraint,
          },
        });
      },
    }),
  );
}

function findValidationError(err: ValidationError, currentPath: string = ''): { leaf: ValidationError; path: string } {
  const nextPath = currentPath ? `${currentPath}.${err.property}` : err.property;

  if (err.constraints && Object.keys(err.constraints).length > 0) {
    return { leaf: err, path: nextPath };
  }

  if (err.children && err.children.length > 0) {
    return findValidationError(err.children[0], nextPath);
  }

  return { leaf: err, path: nextPath };
}
