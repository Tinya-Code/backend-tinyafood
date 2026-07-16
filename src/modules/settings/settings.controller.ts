import {
  Body,
  Controller,
  Get,
  Logger,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/api-response/api-response';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';
import { SettingsService } from './settings.service';
import { RestaurantId } from '../../common/decorators/restaurant-id.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('business-settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get business settings for a restaurant',
    description:
      'Returns the business settings for the current restaurant context. If no settings exist, returns default settings.',
  })
  async getBusinessSettings(
    @RestaurantId() restaurantId: string,
  ): Promise<ApiResponse<RestaurantSettingsResponseDto>> {
    this.logger.log(`Getting business settings for restaurant: ${restaurantId}`);
    const data = await this.settingsService.getBusinessSettings(restaurantId);
    return ApiResponse.success(data, 'Business settings retrieved successfully');
  }

  @Put()
  @ApiOperation({
    summary: 'Update business settings for a restaurant',
    description:
      'Updates the business settings for the current restaurant context. Creates new settings if none exist. Only provided fields will be updated.',
  })
  async updateBusinessSettings(
    @RestaurantId() restaurantId: string,
    @Body() updateData: UpdateRestaurantSettingsDto,
  ): Promise<ApiResponse<RestaurantSettingsResponseDto>> {
    this.logger.log(`Updating business settings for restaurant: ${restaurantId}`);
    const data = await this.settingsService.updateBusinessSettings(
      restaurantId,
      updateData,
    );
    return ApiResponse.success(data, 'Business settings updated successfully');
  }
}
