import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../services/database/database.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';

@Injectable()
export class GalleryService {
  private readonly defaultPlaceholder = 'https://res.cloudinary.com/default-placeholder.png';

  constructor(
    private readonly db: DatabaseService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createGalleryDto: CreateGalleryDto) {
    const imageUrl = createGalleryDto.image_url || this.defaultPlaceholder;

    const result = await this.db.execute(
      `INSERT INTO gallery (restaurant_id, title, description, image_url) 
       VALUES (?, ?, ?, ?)`,
      [
        createGalleryDto.restaurant_id,
        createGalleryDto.title,
        createGalleryDto.description || null,
        imageUrl,
      ],
    );

    return this.findOne(result.insertId);
  }

  async findAllByRestaurant(restaurantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    const rows = await this.db.query<any[]>(
      `SELECT * FROM gallery 
       WHERE restaurant_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [restaurantId, limit, offset],
    );

    const [{ total }] = await this.db.query<any[]>(
      `SELECT COUNT(*) as total FROM gallery WHERE restaurant_id = ?`,
      [restaurantId],
    );

    return {
      data: rows,
      total,
    };
  }

  async findOne(id: number) {
    const rows = await this.db.query<any[]>(
      `SELECT * FROM gallery WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Gallery item with ID ${id} not found`);
    }

    return rows[0];
  }

  async update(id: number, updateGalleryDto: UpdateGalleryDto) {
    await this.findOne(id);

    const fields: string[] = [];
    const params: any[] = [];

    if (updateGalleryDto.restaurant_id !== undefined) {
      fields.push('restaurant_id = ?');
      params.push(updateGalleryDto.restaurant_id);
    }
    if (updateGalleryDto.title !== undefined) {
      fields.push('title = ?');
      params.push(updateGalleryDto.title);
    }
    if (updateGalleryDto.description !== undefined) {
      fields.push('description = ?');
      params.push(updateGalleryDto.description || null);
    }
    if (updateGalleryDto.image_url !== undefined) {
      fields.push('image_url = ?');
      params.push(updateGalleryDto.image_url);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    params.push(id);

    await this.db.execute(
      `UPDATE gallery SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );

    return this.findOne(id);
  }

  async uploadImage(id: number, file: any) {
    await this.findOne(id);

    // Upload image to Cloudinary
    const uploadResult = await this.cloudinary.uploadImage(file, 'gallery');

    // Update in database
    await this.db.execute(
      `UPDATE gallery SET image_url = ? WHERE id = ?`,
      [uploadResult.url, id],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.execute(
      `DELETE FROM gallery WHERE id = ?`,
      [id],
    );
    return { id };
  }
}
