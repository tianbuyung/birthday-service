import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class WrappedResponseDto<T> {
  declare data: T | T[];

  @ApiProperty({ example: 200 })
  declare statusCode: number;

  @ApiProperty({ example: '2024-05-03T10:00:00.000Z' })
  declare timestamp: string;
}

export function createWrappedResponseDto<T>(
  type: Type<T>,
  isArray = false,
): Type<WrappedResponseDto<T>> {
  class WrappedDto extends WrappedResponseDto<T> {
    @ApiProperty({ type, isArray })
    declare data: T | T[];
  }

  Object.defineProperty(WrappedDto, 'name', {
    value: `${type.name}${isArray ? 'Array' : ''}Wrapped`,
  });

  return WrappedDto;
}
