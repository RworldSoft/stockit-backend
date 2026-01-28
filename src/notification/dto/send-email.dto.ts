import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
    @ApiProperty({ description: 'Recipient email address' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ description: 'Email template name (if sending a template-based email)' })
    @IsOptional()
    @IsString()
    template?: string;

    @ApiPropertyOptional({ description: 'Email subject (required if html is provided)' })
    @IsOptional()
    @IsString()
    subject?: string;

    @ApiPropertyOptional({ description: 'Context object for template variables' })
    @IsOptional()
    @IsObject()
    context?: object;

    @ApiPropertyOptional({ description: 'Raw HTML content (if not using a template)' })
    @IsOptional()
    @IsString()
    html?: string;
}
