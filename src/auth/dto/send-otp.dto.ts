import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SendOtpDto {
    @IsString()
    @ApiProperty( { description: 'Identifier to send OTP to (email or phone number)' } )
  identifier: string; // email or phone
}
