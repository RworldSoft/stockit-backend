import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsNotEmpty()
  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;
}
