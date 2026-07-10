import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateGalleryDto {
  @ApiProperty({ description: 'Restaurant ID this gallery item belongs to' })
  @IsUUID()
  @IsNotEmpty()
  restaurant_id!: string;

  @ApiProperty({ description: 'Title of the gallery image' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Description of the gallery item' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Gallery image URL (defaults to placeholder)' })
  @IsString()
  @IsOptional()
  image_url?: string;
}
