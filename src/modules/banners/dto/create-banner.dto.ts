import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateBannerDto {
  @ApiPropertyOptional({ description: 'Title of the banner', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Image URL of the banner (either file is uploaded or direct URL is sent)', maxLength: 500 })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Status of the banner', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
