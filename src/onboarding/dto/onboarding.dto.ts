import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class OnboardingDto {
  @ApiPropertyOptional({ example: 'Aman Kumar' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: 'aman@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Aman Store' })
  @IsString()
  business_name: string;
}
