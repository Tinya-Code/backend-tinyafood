import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../services/database/database.service';
import { RestaurantFeaturesResponseDto } from './dto/restaurant-features-response.dto';
import { UpdateRestaurantFeaturesDto } from './dto/update-restaurant-features.dto';

@Injectable()
export class FeaturesService {
  private readonly logger = new Logger(FeaturesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getRestaurantFeatures(
    restaurantId: string,
  ): Promise<RestaurantFeaturesResponseDto> {
    this.logger.log(
      `Getting features for restaurant: ${restaurantId}`,
    );

    const rows = await this.databaseService.query<any[]>(
      'SELECT id, features FROM restaurants WHERE id = ?',
      [restaurantId],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    const result = rows[0];
    let features = result.features;

    if (typeof features === 'string') {
      features = JSON.parse(features);
    }
    if (!features || typeof features !== 'object') {
      features = {};
    }

    return features as RestaurantFeaturesResponseDto;
  }

  async updateRestaurantFeatures(
    restaurantId: string,
    updateData: UpdateRestaurantFeaturesDto,
  ): Promise<RestaurantFeaturesResponseDto> {
    this.logger.log(
      `Updating features for restaurant: ${restaurantId}`,
    );

    const rows = await this.databaseService.query<any[]>(
      'SELECT id, features FROM restaurants WHERE id = ?',
      [restaurantId],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    let currentFeatures = rows[0].features;
    if (typeof currentFeatures === 'string') {
      currentFeatures = JSON.parse(currentFeatures);
    }
    if (!currentFeatures || typeof currentFeatures !== 'object') {
      currentFeatures = {};
    }

    if (updateData.deliveryOptions !== undefined) {
      currentFeatures.deliveryOptions = updateData.deliveryOptions;
    }

    await this.databaseService.query(
      'UPDATE restaurants SET features = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(currentFeatures), restaurantId],
    );

    return this.getRestaurantFeatures(restaurantId);
  }
}
