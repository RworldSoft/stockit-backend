import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from 'class-validator';

export class SendSMSDto {
    @ApiProperty()
    @IsPhoneNumber()
    phone: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty()
    @IsOptional()
    @IsObject()
    context: object;
}