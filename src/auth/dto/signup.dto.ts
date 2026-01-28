import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Aman Sharma' })
  full_name: string;

  @IsEmail()
  @ApiProperty({ example: 'aman@gmail.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: '9876543210' })
  phone: string;

  @MinLength(6)
  @ApiProperty({ example: 'password123' })
  password: string;

  
}
