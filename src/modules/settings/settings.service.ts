import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../services/database/database.service';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async getBusinessSettings(
    restaurantId: string,
  ): Promise<RestaurantSettingsResponseDto> {
    this.logger.log(
      `Getting business settings for restaurant: ${restaurantId}`,
    );

    const rows = await this.databaseService.query<any[]>(
      `SELECT id, name, phone, address, location_lat, location_lng, is_active,
              settings, created_at, updated_at
       FROM restaurants WHERE id = ?`,
      [restaurantId],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    const result = rows[0];
    let settings = result.settings;

    if (typeof settings === 'string') {
      settings = JSON.parse(settings);
    }
    if (!settings || typeof settings !== 'object') {
      settings = {};
    }

    return {
      restaurant_id: result.id,
      name: result.name,
      phone: result.phone,
      address: result.address,
      location_lat: result.location_lat,
      location_lng: result.location_lng,
      is_active: result.is_active,
      whatsapp_config: settings.whatsapp_config || {},
      display_config: settings.display_config || {},
      order_config: settings.order_config || {},
      business_config: settings.business_config || {},
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }

  async updateBusinessSettings(
    restaurantId: string,
    updateData: UpdateRestaurantSettingsDto,
  ): Promise<RestaurantSettingsResponseDto> {
    this.logger.log(
      `Updating business settings for restaurant: ${restaurantId}`,
    );

    // Verify restaurant exists and get current settings
    const rows = await this.databaseService.query<any[]>(
      'SELECT id, settings FROM restaurants WHERE id = ?',
      [restaurantId],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    // Update individual restaurant columns
    const colFields: string[] = [];
    const colValues: any[] = [];

    if (updateData.name !== undefined) {
      colFields.push('name = ?');
      colValues.push(updateData.name);
    }
    if (updateData.phone !== undefined) {
      colFields.push('phone = ?');
      colValues.push(updateData.phone);
    }
    if (updateData.address !== undefined) {
      colFields.push('address = ?');
      colValues.push(updateData.address);
    }
    if (updateData.location_lat !== undefined) {
      colFields.push('location_lat = ?');
      colValues.push(updateData.location_lat);
    }
    if (updateData.location_lng !== undefined) {
      colFields.push('location_lng = ?');
      colValues.push(updateData.location_lng);
    }
    if (updateData.is_active !== undefined) {
      colFields.push('is_active = ?');
      colValues.push(updateData.is_active);
    }

    if (colFields.length > 0) {
      colFields.push('updated_at = NOW()');
      colValues.push(restaurantId);
      await this.databaseService.query(
        `UPDATE restaurants SET ${colFields.join(', ')} WHERE id = ?`,
        colValues,
      );
    }

    // Update settings JSON column
    let currentSettings = rows[0].settings;
    if (typeof currentSettings === 'string') {
      currentSettings = JSON.parse(currentSettings);
    }
    if (!currentSettings || typeof currentSettings !== 'object') {
      currentSettings = {};
    }

    let settingsChanged = false;

    if (updateData.whatsapp_config !== undefined) {
      currentSettings.whatsapp_config = updateData.whatsapp_config;
      settingsChanged = true;
    }
    if (updateData.display_config !== undefined) {
      currentSettings.display_config = updateData.display_config;
      settingsChanged = true;
    }
    if (updateData.order_config !== undefined) {
      currentSettings.order_config = updateData.order_config;
      settingsChanged = true;
    }
    if (updateData.business_config !== undefined) {
      currentSettings.business_config = updateData.business_config;
      settingsChanged = true;
    }

    if (settingsChanged) {
      await this.databaseService.query(
        'UPDATE restaurants SET settings = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(currentSettings), restaurantId],
      );
    }

    return this.getBusinessSettings(restaurantId);
  }
}
