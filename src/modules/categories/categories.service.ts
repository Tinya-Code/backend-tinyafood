import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../services/database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const id = randomUUID();

    await this.db.execute(
      `INSERT INTO categories (id, restaurant_id, block_id, name, description) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        createCategoryDto.restaurant_id,
        createCategoryDto.block_id,
        createCategoryDto.name,
        createCategoryDto.description || null,
      ],
    );

    return this.findOne(id);
  }

  async findAllByRestaurant(restaurantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    const rows = await this.db.query<any[]>(
      `SELECT * FROM categories 
       WHERE restaurant_id = ? AND is_active = 1 
       LIMIT ? OFFSET ?`,
      [restaurantId, limit, offset],
    );

    const [{ total }] = await this.db.query<any[]>(
      `SELECT COUNT(*) as total FROM categories WHERE restaurant_id = ? AND is_active = 1`,
      [restaurantId],
    );

    return {
      data: rows,
      total,
    };
  }

  async findOne(id: string) {
    const rows = await this.db.query<any[]>(
      `SELECT * FROM categories WHERE id = ? AND is_active = 1`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return rows[0];
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    const fields: string[] = [];
    const params: any[] = [];

    if (updateCategoryDto.restaurant_id !== undefined) {
      fields.push('restaurant_id = ?');
      params.push(updateCategoryDto.restaurant_id);
    }
    if (updateCategoryDto.block_id !== undefined) {
      fields.push('block_id = ?');
      params.push(updateCategoryDto.block_id);
    }
    if (updateCategoryDto.name !== undefined) {
      fields.push('name = ?');
      params.push(updateCategoryDto.name);
    }
    if (updateCategoryDto.description !== undefined) {
      fields.push('description = ?');
      params.push(updateCategoryDto.description || null);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    params.push(id);

    await this.db.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.execute(
      `UPDATE categories SET is_active = 0 WHERE id = ?`,
      [id],
    );
    return { id };
  }
}
