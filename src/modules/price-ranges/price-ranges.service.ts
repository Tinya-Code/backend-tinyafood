import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceRange } from './entities/price-range.entity';
import { CreatePriceRangeDto } from './dto/create-price-range.dto';
import { NotFoundException } from '../../common/errors/exceptions';

@Injectable()
export class PriceRangesService {
  constructor(
    @InjectRepository(PriceRange)
    private readonly repo: Repository<PriceRange>,
  ) {}

  async findAll(): Promise<PriceRange[]> {
    return this.repo.find({ order: { quantity: 'ASC' } });
  }

  async findById(id: number): Promise<PriceRange> {
    const range = await this.repo.findOne({ where: { id } });
    if (!range) throw new NotFoundException('PriceRange not found');
    return range;
  }

  async findByProductId(productId: number): Promise<PriceRange[]> {
    return this.repo.find({
      where: { productId },
      order: { quantity: 'ASC' },
    });
  }

  async create(dto: CreatePriceRangeDto): Promise<PriceRange> {
    if (dto.isDefault) {
      await this.clearDefaultForProduct(dto.productId);
    }

    const entity = this.repo.create({
      productId: dto.productId,
      quantity: dto.quantity,
      unit: dto.unit ?? null,
      price: dto.price,
      bonus: dto.bonus ?? null,
      isDefault: dto.isDefault ?? false,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: CreatePriceRangeDto): Promise<PriceRange> {
    const existing = await this.findById(id);

    if (dto.isDefault) {
      await this.clearDefaultForProduct(dto.productId);
    }

    Object.assign(existing, {
      productId: dto.productId,
      quantity: dto.quantity,
      unit: dto.unit ?? null,
      price: dto.price,
      bonus: dto.bonus ?? null,
      isDefault: dto.isDefault ?? false,
    });
    return this.repo.save(existing);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('PriceRange not found');
  }

  async syncForProduct(
    productId: number,
    variants: any[],
  ): Promise<PriceRange[]> {
    const existing = await this.repo.find({ where: { productId } });
    const existingIds = existing.map((e) => e.id);
    const incomingIds = variants.filter((v) => v.id).map((v) => parseInt(v.id));

    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
    if (toDelete.length > 0) {
      await this.repo.delete(toDelete);
    }

    const results: PriceRange[] = [];
    let hasDefault = false;

    for (const item of variants) {
      const isDefault = item.is_default === true || item.is_default === 'true';
      if (isDefault) hasDefault = true;

      if (item.id && existingIds.includes(parseInt(item.id))) {
        const range = await this.findById(parseInt(item.id));
        Object.assign(range, {
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
          unit: item.unit ?? null,
          bonus: item.bonus ?? null,
          isDefault,
        });
        results.push(await this.repo.save(range));
      } else {
        const entity = this.repo.create({
          productId,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
          unit: item.unit ?? null,
          bonus: item.bonus ?? null,
          isDefault,
        });
        results.push(await this.repo.save(entity));
      }
    }

    if (hasDefault) {
      await this.clearDefaultForProduct(productId);
      const defaultItem = results.find((r) => r.isDefault);
      if (defaultItem) {
        defaultItem.isDefault = true;
        await this.repo.save(defaultItem);
      }
    }

    return results;
  }

  private async clearDefaultForProduct(productId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(PriceRange)
      .set({ isDefault: false })
      .where('product_id = :productId AND is_default = :true', {
        productId,
        true: true,
      })
      .execute();
  }
}
