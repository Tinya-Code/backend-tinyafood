import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { NotFoundException } from '../../common/errors/exceptions';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ── Admin: trae todos (activos e inactivos) ─────────────────────────
  async findAll(restaurantId: string, page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit;

    const qb = this.bannerRepo.createQueryBuilder('b')
      .where('b.restaurant_id = :restaurantId', { restaurantId });

    if (search) {
      qb.andWhere(
        '(LOWER(b.title) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();

    const items = await qb
      .orderBy('b.created_at', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();

    return { data: items, total };
  }

  // ── Público: solo banners activos ───────────────────────────────────
  async findAllActive(restaurantId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [items, total] = await this.bannerRepo.findAndCount({
      where: { restaurantId, isActive: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data: items, total };
  }

  async findById(id: string): Promise<Banner> {
    const item = await this.bannerRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Banner not found');
    return item;
  }

  async create(dto: CreateBannerDto, restaurantId: string): Promise<Banner> {
    const banner = this.bannerRepo.create({
      title: dto.title ?? null,
      imageUrl: dto.imageUrl ?? '',
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      restaurantId,
    });
    const saved = await this.bannerRepo.save(banner);
    return this.findById((saved as Banner).id);
  }

  async update(id: string, dto: UpdateBannerDto, imageUrl?: string): Promise<Banner> {
    const existing = await this.findById(id);

    if (dto.title !== undefined) existing.title = dto.title ?? null;
    if (imageUrl !== undefined) existing.imageUrl = imageUrl;
    if (dto.isActive !== undefined) existing.isActive = dto.isActive;

    await this.bannerRepo.save(existing);
    return this.findById(id);
  }

  async toggleActive(id: string): Promise<Banner> {
    const existing = await this.findById(id);
    existing.isActive = !existing.isActive;
    await this.bannerRepo.save(existing);
    return this.findById(id);
  }

  async uploadImage(id: string, file: any): Promise<Banner> {
    const existing = await this.findById(id);

    const uploadResult = await this.cloudinary.uploadImage(file, 'banners');
    existing.imageUrl = uploadResult.url;

    await this.bannerRepo.save(existing);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const item = await this.findById(id);

    if (item.imageUrl) {
      try {
        await this.cloudinary.deleteImage(item.imageUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete Cloudinary image: ${error.message}`);
      }
    }

    await this.bannerRepo.remove(item);
  }
}
