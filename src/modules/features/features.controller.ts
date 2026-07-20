import { Body, Controller, Get, Logger, Param, Put, Headers, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';
import { RestaurantFeaturesResponseDto } from './dto/restaurant-features-response.dto';
import { UpdateRestaurantFeaturesDto } from './dto/update-restaurant-features.dto';
import { FeaturesService } from './features.service';

@ApiTags('Features')
@Controller()
export class FeaturesController {
  private readonly logger = new Logger(FeaturesController.name);
  constructor(
    private readonly featuresService: FeaturesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('restaurants/:restaurantId/features')
  @Public()
  @ApiOperation({
    summary: 'Get restaurant features (public)',
    description:
      'Returns the features configuration for a restaurant. No authentication required.',
  })
  async getRestaurantFeatures(
    @Param('restaurantId') restaurantId: string,
  ): Promise<ApiResponse<RestaurantFeaturesResponseDto>> {
    this.logger.log(`Getting features for restaurant: ${restaurantId}`);
    const data = await this.featuresService.getRestaurantFeatures(restaurantId);
    return ApiResponse.success(data, 'Features retrieved successfully');
  }

  @Put('restaurants/:restaurantId/features')
  @Public()
  @ApiOperation({
    summary: 'Update restaurant features',
    description:
      'Updates the features configuration for a restaurant. Requires x-api-key header.',
  })
  async updateRestaurantFeatures(
    @Param('restaurantId') restaurantId: string,
    @Body() updateData: UpdateRestaurantFeaturesDto,
    @Headers('x-api-key') apiKey: string,
  ): Promise<ApiResponse<RestaurantFeaturesResponseDto>> {
    const validApiKey = this.configService.get<string>('FEATURES_API_KEY');
    if (!apiKey || apiKey !== validApiKey) {
      throw new ForbiddenException('Invalid or missing API key');
    }

    this.logger.log(`Updating features for restaurant: ${restaurantId}`);
    const data = await this.featuresService.updateRestaurantFeatures(
      restaurantId,
      updateData,
    );
    return ApiResponse.success(data, 'Features updated successfully');
  }
}
