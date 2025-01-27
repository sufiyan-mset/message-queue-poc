import { BadRequestException } from '@nestjs/common';

export class MessageValidator {
  static validate(schema: Record<string, string>, payload: any) {
    for (const [key, type] of Object.entries(schema)) {
      const value = payload[key];

      if (type === 'string' && typeof value !== 'string') {
        throw new BadRequestException(
          `Invalid type for '${key}'. Expected string.`,
        );
      }

      if (
        type === 'array_of_strings' &&
        (!Array.isArray(value) ||
          !value.every((item) => typeof item === 'string'))
      ) {
        throw new BadRequestException(
          `Invalid type for '${key}'. Expected array of strings.`,
        );
      }
    }
  }
}
