import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsISO8601,
  IsNotEmpty,
  IsString,
  IsTimeZone,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  declare name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  declare email: string;

  @ApiProperty({
    example: '1990-04-21',
    description: 'ISO 8601 date (YYYY-MM-DD)',
  })
  @IsISO8601({ strict: true })
  declare birthday: string;

  @ApiProperty({
    example: 'Asia/Jakarta',
    description: 'IANA timezone identifier',
  })
  @IsString()
  @IsTimeZone()
  declare timezone: string;
}
