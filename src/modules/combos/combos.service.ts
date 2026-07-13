import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../services/database/database.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';

@Injectable()
export class CombosService {
  private readonly defaultPlaceholder = 'https://res.cloudinary.com/default-placeholder.png';

  constructor(
    private readonly db: DatabaseService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createComboDto: CreateComboDto) {
    const imageUrl = createComboDto.image_url || this.defaultPlaceholder;

    const result = await this.db.execute(
      `INSERT INTO combos (restaurant_id, name, description, image_url, price) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        createComboDto.restaurant_id,
        createComboDto.name,
        createComboDto.description || null,
        imageUrl,
        createComboDto.price,
      ],
    );

    return this.findOne(result.insertId);
  }

  async findAllByRestaurant(restaurantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    const rows = await this.db.query<any[]>(
      `SELECT * FROM combos 
       WHERE restaurant_id = ? AND is_active = 1 
       LIMIT ? OFFSET ?`,
       [restaurantId, Number(limit), Number(offset)],
    );

    const [{ total }] = await this.db.query<any[]>(
      `SELECT COUNT(*) as total FROM combos WHERE restaurant_id = ? AND is_active = 1`,
      [restaurantId],
    );

    return {
      data: rows,
      total,
    };
  }

  async findOne(id: number) {
    const rows = await this.db.query<any[]>(
      `SELECT * FROM combos WHERE id = ? AND is_active = 1`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Combo with ID ${id} not found`);
    }

    return rows[0];
  }

  async update(id: number, updateComboDto: UpdateComboDto) {
    await this.findOne(id);

    const fields: string[] = [];
    const params: any[] = [];

    if (updateComboDto.restaurant_id !== undefined) {
      fields.push('restaurant_id = ?');
      params.push(updateComboDto.restaurant_id);
    }
    if (updateComboDto.name !== undefined) {
      fields.push('name = ?');
      params.push(updateComboDto.name);
    }
    if (updateComboDto.description !== undefined) {
      fields.push('description = ?');
      params.push(updateComboDto.description || null);
    }
    if (updateComboDto.image_url !== undefined) {
      fields.push('image_url = ?');
      params.push(updateComboDto.image_url);
    }
    if (updateComboDto.price !== undefined) {
      fields.push('price = ?');
      params.push(updateComboDto.price);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    params.push(id);

    await this.db.execute(
      `UPDATE combos SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );

    return this.findOne(id);
  }

  async uploadImage(id: number, file: any) {
    const combo = await this.findOne(id);

    // Upload to Cloudinary
    const uploadResult = await this.cloudinary.uploadImage(file, 'combos');

    // Update in database
    await this.db.execute(
      `UPDATE combos SET image_url = ? WHERE id = ?`,
      [uploadResult.url, id],
    );

    // Optional: if the old image was a Cloudinary image, we could delete it,
    // but the schema doesn't store the publicId explicitly, so we just update the URL.

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.execute(
      `UPDATE combos SET is_active = 0 WHERE id = ?`,
      [id],
    );
    return { id };
  }
}
