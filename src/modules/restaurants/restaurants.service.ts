import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../services/database/database.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class RestaurantsService {
  constructor(private readonly db: DatabaseService) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    const id = randomUUID();
    const settingsJson = JSON.stringify(createRestaurantDto.settings || {});

    await this.db.execute(
      `INSERT INTO restaurants (id, name, phone, address, location_lat, location_lng, settings) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        createRestaurantDto.name,
        createRestaurantDto.phone || null,
        createRestaurantDto.address || null,
        createRestaurantDto.location_lat || null,
        createRestaurantDto.location_lng || null,
        settingsJson,
      ],
    );

    return this.findOne(id);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    const rows = await this.db.query<any[]>(
      `SELECT * FROM restaurants WHERE is_active = 1 LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    const [{ total }] = await this.db.query<any[]>(
      `SELECT COUNT(*) as total FROM restaurants WHERE is_active = 1`,
    );

    const formattedData = rows.map((row) => ({
      ...row,
      settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
    }));

    return {
      data: formattedData,
      total,
    };
  }

  async findOne(id: string) {
    const rows = await this.db.query<any[]>(
      `SELECT * FROM restaurants WHERE id = ? AND is_active = 1`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    const row = rows[0];
    return {
      ...row,
      settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
    };
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    // Verify it exists
    await this.findOne(id);

    const fields: string[] = [];
    const params: any[] = [];

    if (updateRestaurantDto.name !== undefined) {
      fields.push('name = ?');
      params.push(updateRestaurantDto.name);
    }
    if (updateRestaurantDto.phone !== undefined) {
      fields.push('phone = ?');
      params.push(updateRestaurantDto.phone || null);
    }
    if (updateRestaurantDto.address !== undefined) {
      fields.push('address = ?');
      params.push(updateRestaurantDto.address || null);
    }
    if (updateRestaurantDto.location_lat !== undefined) {
      fields.push('location_lat = ?');
      params.push(updateRestaurantDto.location_lat || null);
    }
    if (updateRestaurantDto.location_lng !== undefined) {
      fields.push('location_lng = ?');
      params.push(updateRestaurantDto.location_lng || null);
    }
    if (updateRestaurantDto.settings !== undefined) {
      fields.push('settings = ?');
      params.push(JSON.stringify(updateRestaurantDto.settings || {}));
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    params.push(id);

    await this.db.execute(
      `UPDATE restaurants SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.execute(
      `UPDATE restaurants SET is_active = 0 WHERE id = ?`,
      [id],
    );
    return { id };
  }
}
