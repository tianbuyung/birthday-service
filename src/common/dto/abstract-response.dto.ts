import { ApiProperty } from '@nestjs/swagger';

export class AbstractResponseDto {
  @ApiProperty({
    example: '6634a1f2e4b0c123456789ab',
    description: 'MongoDB document ID',
  })
  declare id: string;

  @ApiProperty({ example: '2024-05-03T10:00:00.000Z' })
  declare createdAt: string;

  @ApiProperty({ example: '2024-05-03T10:00:00.000Z' })
  declare updatedAt: string;
}
