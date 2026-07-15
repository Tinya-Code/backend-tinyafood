import { ApiProperty } from '@nestjs/swagger';

export class RestaurantSettingsResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Restaurant UUID identifier',
  })
  restaurant_id: string;

  // --- Restaurant fields ---

  @ApiProperty({
    example: 'Mi Restaurante',
    description: 'Restaurant name',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: '+51987654321',
    description: 'Phone number',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    example: 'Av. Principal 123, Lima',
    description: 'Address',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: -12.0464,
    description: 'Latitude',
    required: false,
  })
  location_lat?: number;

  @ApiProperty({
    example: -77.0428,
    description: 'Longitude',
    required: false,
  })
  location_lng?: number;

  @ApiProperty({
    example: true,
    description: 'Is restaurant active',
    required: false,
  })
  is_active?: boolean;

  // --- Settings JSON fields ---

  @ApiProperty({
    example: {},
    description: 'WhatsApp configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  whatsapp_config: Record<string, any>;

  @ApiProperty({
    example: {},
    description: 'Display configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  display_config: Record<string, any>;

  @ApiProperty({
    example: {},
    description: 'Order configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  order_config: Record<string, any>;

  @ApiProperty({
    example: {},
    description: 'Business configuration settings',
    type: 'object',
    additionalProperties: true,
  })
  business_config: Record<string, any>;

  @ApiProperty({
    example: '2024-02-21T15:06:00.000Z',
    description: 'Settings creation timestamp',
  })
  created_at: string;

  @ApiProperty({
    example: '2024-02-21T15:06:00.000Z',
    description: 'Settings last update timestamp',
  })
  updated_at: string;
}
