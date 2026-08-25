import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { NotFoundException } from '../../common/errors/exceptions';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly promoRepo: Repository<Promotion>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findAll(restaurantId: string, page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit;

    const qb = this.promoRepo.createQueryBuilder('p')
      .where('p.restaurant_id = :restaurantId', { restaurantId });

    if (search) {
      qb.andWhere(
        '(LOWER(p.name) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();

    const items = await qb
      .orderBy('p.id', 'ASC')
      .take(limit)
      .skip(offset)
      .getMany();

    return { data: items, total };
  }

  async findById(id: number, restaurantId?: string): Promise<Promotion> {
    const where: any = { id };
    if (restaurantId) where.restaurantId = restaurantId;

    const promo = await this.promoRepo.findOne({ where });
    if (!promo) throw new NotFoundException('Promotion not found');

    return promo;
  }

  async create(dto: CreatePromotionDto, restaurantId: string): Promise<Promotion> {
    const promo = this.promoRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      basePrice: dto.basePrice ?? null,
      promoPrice: dto.promoPrice,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      imageUrl: dto.imageUrl ?? null,
      isActive: dto.isActive ?? true,
      restaurantId,
    });

    const saved = await this.promoRepo.save(promo);
    return this.findById(saved.id, restaurantId);
  }

  async update(
    id: number,
    dto: UpdatePromotionDto,
    restaurantId: string,
    imageUrl?: string,
  ): Promise<Promotion> {
    const existing = await this.findById(id, restaurantId);

    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.description !== undefined) existing.description = dto.description ?? null;
    if (dto.basePrice !== undefined) existing.basePrice = dto.basePrice ?? null;
    if (dto.promoPrice !== undefined) existing.promoPrice = dto.promoPrice;
    if (dto.startDate !== undefined) existing.startDate = dto.startDate ?? null;
    if (dto.endDate !== undefined) existing.endDate = dto.endDate ?? null;
    if (dto.isActive !== undefined) existing.isActive = dto.isActive;

    if (imageUrl !== undefined) {
      if (existing.imageUrl) {
        try {
          await this.cloudinary.deleteImageByUrl(existing.imageUrl);
        } catch (error) {
          this.logger.warn(`Failed to delete old image: ${error.message}`);
        }
      }
      existing.imageUrl = imageUrl;
    }

    await this.promoRepo.save(existing);
    return this.findById(id, restaurantId);
  }

  async delete(id: number, restaurantId: string): Promise<void> {
    const promo = await this.findById(id, restaurantId);

    if (promo.imageUrl) {
      try {
        await this.cloudinary.deleteImageByUrl(promo.imageUrl);
      } catch (error) {
        this.logger.warn(`Failed to delete image: ${error.message}`);
      }
    }

    await this.promoRepo.remove(promo);
  }
}
