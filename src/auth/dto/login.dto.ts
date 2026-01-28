import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @ApiProperty({ example: 'aman@gmail.com or 9876543210' })
  identifier: string;

  @MinLength(6)
  @ApiProperty({ example: 'password123' })
  password: string;
}
