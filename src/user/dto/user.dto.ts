import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty( { example: 'Aman' })
  first_name: string;

  @IsString()
  @IsOptional()
  @ApiProperty( { example: 'Adee' })
  last_name?: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty( { example: 'aman@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty( { example: '9876543210' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty( { example: 'My Business Name' })
  business_name: string;
}
