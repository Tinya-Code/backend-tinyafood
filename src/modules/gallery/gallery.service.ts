import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { NotFoundException } from '../../common/errors/exceptions';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepo: Repository<Gallery>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findAll(restaurantId: string, page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit;

    const qb = this.galleryRepo.createQueryBuilder('g')
      .where('g.restaurant_id = :restaurantId', { restaurantId });

    if (search) {
      qb.andWhere(
        '(LOWER(g.title) LIKE LOWER(:search) OR LOWER(g.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();

    const items = await qb
      .orderBy('g.id', 'ASC')
      .take(limit)
      .skip(offset)
      .getMany();

    return { data: items, total };
  }

  async findById(id: number): Promise<Gallery> {
    const item = await this.galleryRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Gallery item not found');
    return item;
  }

  async create(dto: CreateGalleryDto, restaurantId: string): Promise<Gallery> {
    const item = this.galleryRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      restaurantId,
    });
    const saved = await this.galleryRepo.save(item);
    return this.findById(Array.isArray(saved) ? saved[0].id : saved.id);
  }

  async update(id: number, dto: UpdateGalleryDto, imageUrl?: string): Promise<Gallery> {
    const existing = await this.findById(id);

    if (dto.title !== undefined) existing.title = dto.title;
    if (dto.description !== undefined) existing.description = dto.description ?? null;
    if (imageUrl !== undefined) existing.imageUrl = imageUrl;

    await this.galleryRepo.save(existing);
    return this.findById(id);
  }

  async uploadImage(id: number, file: any): Promise<Gallery> {
    const existing = await this.findById(id);

    const uploadResult = await this.cloudinary.uploadImage(file, 'gallery');
    existing.imageUrl = uploadResult.url;

    await this.galleryRepo.save(existing);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const item = await this.findById(id);

    if (item.imageUrl) {
      try {
        await this.cloudinary.deleteImage(item.imageUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete Cloudinary image: ${error.message}`);
      }
    }

    await this.galleryRepo.remove(item);
  }
}
