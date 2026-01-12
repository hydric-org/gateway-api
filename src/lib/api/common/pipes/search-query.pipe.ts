import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseSearchQueryPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value || !value.hasValue()) {
      throw new BadRequestException(
        `A query string should be provided to ${metadata.data} in order to perform a search`,
      );
    }

    return value;
  }
}
