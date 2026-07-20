import { ApiProperty } from '@nestjs/swagger';

export class RestaurantFeaturesResponseDto {
  @ApiProperty({
    example: true,
    description: 'Enable or disable delivery options',
    required: false,
  })
  deliveryOptions?: boolean;
}
