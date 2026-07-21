import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../services/database/database.service';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getBusinessSettings(
    restaurantId: string,
  ): Promise<RestaurantSettingsResponseDto> {
    this.logger.log(
      `Getting business settings for restaurant: ${restaurantId}`,
    );

    const result = await this.validateRestaurantExists(restaurantId);
    const settings = this.parseSettings(result.settings, restaurantId);

    return this.formatSettingsResponse(result, settings);
  }

  async updateBusinessSettings(
    restaurantId: string,
    updateData: UpdateRestaurantSettingsDto,
  ): Promise<RestaurantSettingsResponseDto> {
    this.logger.log(
      `Updating business settings for restaurant: ${restaurantId}`,
    );

    const result = await this.validateRestaurantExists(restaurantId);

    // Update individual restaurant columns
    await this.updateRestaurantColumns(restaurantId, updateData);

    // Update settings JSON column
    const currentSettings = this.parseSettings(result.settings, restaurantId);
    const settingsChanged = this.updateSettingsFields(currentSettings, updateData);

    if (settingsChanged) {
      await this.databaseService.query(
        'UPDATE restaurants SET settings = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(currentSettings), restaurantId],
      );
    }

    return this.getBusinessSettings(restaurantId);
  }

  private async validateRestaurantExists(restaurantId: string): Promise<any> {
    const rows = await this.databaseService.query<any[]>(
      'SELECT id, settings FROM restaurants WHERE id = ?',
      [restaurantId],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    return rows[0];
  }

  private parseSettings(settings: any, restaurantId: string): any {
    if (typeof settings === 'string') {
      try {
        settings = JSON.parse(settings);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        this.logger.error(
          `Failed to parse settings JSON for restaurant ${restaurantId}. Corrupted data detected. Rejecting operation. Error: ${errorMessage}`,
        );
        throw new Error(
          `Settings data corrupted for restaurant ${restaurantId}. Please contact support.`,
        );
      }
    }
    if (!settings || typeof settings !== 'object') {
      this.logger.error(
        `Invalid settings format for restaurant ${restaurantId}. Expected object, got ${typeof settings}. Rejecting operation.`,
      );
      throw new Error(
        `Invalid settings format for restaurant ${restaurantId}. Please contact support.`,
      );
    }
    return settings;
  }

  private formatSettingsResponse(result: any, settings: any): RestaurantSettingsResponseDto {
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

  private async updateRestaurantColumns(
    restaurantId: string,
    updateData: UpdateRestaurantSettingsDto,
  ): Promise<void> {
    const colFields: string[] = [];
    const colValues: any[] = [];

    const columnMappings = {
      name: 'name',
      phone: 'phone',
      address: 'address',
      location_lat: 'location_lat',
      location_lng: 'location_lng',
      is_active: 'is_active',
    };

    for (const [dtoField, dbField] of Object.entries(columnMappings)) {
      if (updateData[dtoField] !== undefined) {
        colFields.push(`${dbField} = ?`);
        colValues.push(updateData[dtoField]);
      }
    }

    if (colFields.length > 0) {
      colFields.push('updated_at = NOW()');
      colValues.push(restaurantId);
      await this.databaseService.query(
        `UPDATE restaurants SET ${colFields.join(', ')} WHERE id = ?`,
        colValues,
      );
    }
  }

  private updateSettingsFields(
    currentSettings: any,
    updateData: UpdateRestaurantSettingsDto,
  ): boolean {
    let settingsChanged = false;

    const configFields = [
      'whatsapp_config',
      'display_config',
      'order_config',
      'business_config',
    ] as const;

    for (const field of configFields) {
      if (updateData[field] !== undefined) {
        currentSettings[field] = this.deepMerge(
          currentSettings[field] || {},
          updateData[field],
        );
        settingsChanged = true;
      }
    }

    return settingsChanged;
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
