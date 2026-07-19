import { ApiProperty } from '@nestjs/swagger';

export class Feature {
  @ApiProperty({
    description: 'Restaurant UUID identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Restaurant features configuration (JSON)',
    example: { deliveryOptions: true },
    type: 'object',
    additionalProperties: true,
  })
  features: Record<string, any>;
}
