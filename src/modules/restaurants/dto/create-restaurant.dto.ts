import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ description: 'Restaurant name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Restaurant phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Restaurant address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsNumber()
  @IsOptional()
  location_lat?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsNumber()
  @IsOptional()
  location_lng?: number;

  @ApiProperty({ description: 'JSON configuration settings', default: {} })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any> = {};
}
