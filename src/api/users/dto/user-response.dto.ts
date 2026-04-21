import { ApiProperty } from '@nestjs/swagger';

import { AbstractResponseDto } from '@/common/dto/abstract-response.dto';

export class UserResponseDto extends AbstractResponseDto {
  @ApiProperty({ example: 'John Doe' })
  declare name: string;

  @ApiProperty({ example: 'john@example.com' })
  declare email: string;

  @ApiProperty({
    example: '1990-04-21T00:00:00.000Z',
    description: 'ISO 8601 date',
  })
  declare birthday: string;

  @ApiProperty({
    example: 'Asia/Jakarta',
    description: 'IANA timezone identifier',
  })
  declare timezone: string;
}
