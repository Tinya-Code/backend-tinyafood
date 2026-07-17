import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/api-response/api-response';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';
import { SettingsService } from './settings.service';
import { RestaurantId } from '../../common/decorators/restaurant-id.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Settings')
@Controller()
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);
  constructor(private readonly settingsService: SettingsService) {}

  // ── Ruta pública: restaurantId en URL ─────────────────────────────
  @Get('restaurants/:restaurantId/settings')
  @Public()
  @ApiOperation({
    summary: 'Get business settings for a restaurant (public)',
    description: 'Returns the business settings for a restaurant. No authentication required.',
  })
  async getPublicBusinessSettings(
    @Param('restaurantId') restaurantId: string,
  ): Promise<ApiResponse<RestaurantSettingsResponseDto>> {
    this.logger.log(`Getting public business settings for restaurant: ${restaurantId}`);
    const data = await this.settingsService.getBusinessSettings(restaurantId);
    return ApiResponse.success(data, 'Business settings retrieved successfully');
  }

  // ── Ruta admin: restaurantId por header x-restaurant-id ────────────
  @Get('business-settings')
  @ApiBearerAuth()
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

  @Put('business-settings')
  @ApiBearerAuth()
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
