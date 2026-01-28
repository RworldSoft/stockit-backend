import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @ApiProperty({
    description: 'Identifier used to send OTP (email or phone number)',
  })
  identifier: string;
  @IsString()
  @ApiProperty({ description: 'OTP to verify' })
  otp: string;
}
