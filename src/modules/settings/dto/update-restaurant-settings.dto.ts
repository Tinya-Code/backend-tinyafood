import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, IsObject, MaxLength } from 'class-validator';

export class UpdateRestaurantSettingsDto {
  // --- Restaurant fields ---

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    description: 'Restaurant name',
    example: 'Mi Restaurante',
    required: false,
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({
    description: 'Phone number',
    example: '+51987654321',
    required: false,
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Address',
    example: 'Av. Principal 123, Lima',
    required: false,
  })
  address?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'Latitude',
    example: -12.0464,
    required: false,
  })
  location_lat?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'Longitude',
    example: -77.0428,
    required: false,
  })
  location_lng?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Is restaurant active',
    example: true,
    required: false,
  })
  is_active?: boolean;

  // --- Settings JSON fields ---

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: 'WhatsApp configuration',
    type: 'object',
    additionalProperties: true,
    example: { enabled: true, number: '+51987654321' },
  })
  whatsapp_config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: 'Display configuration',
    type: 'object',
    additionalProperties: true,
    example: { currency: 'PEN', theme: 'light' },
  })
  display_config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: 'Order configuration',
    type: 'object',
    additionalProperties: true,
    example: { enabled: true, delivery_fee: 5 },
  })
  order_config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: 'Business configuration',
    type: 'object',
    additionalProperties: true,
    example: { timezone: 'America/Lima' },
  })
  business_config?: Record<string, any>;
}
