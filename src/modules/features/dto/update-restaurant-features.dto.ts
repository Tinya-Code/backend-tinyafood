import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateRestaurantFeaturesDto {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Enable or disable delivery options for this restaurant',
    example: true,
    required: false,
  })
  deliveryOptions?: boolean;
}
