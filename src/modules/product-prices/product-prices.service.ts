import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductPrice } from './entities/product-price.entity';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { NotFoundException } from '../../common/errors/exceptions';

@Injectable()
export class ProductPricesService {
  constructor(
    @InjectRepository(ProductPrice)
    private readonly repo: Repository<ProductPrice>,
  ) {}

  async findAll(productId?: number): Promise<ProductPrice[]> {
    const where: any = {};
    if (productId) where.productId = productId;
    return this.repo.find({ where, order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<ProductPrice> {
    const price = await this.repo.findOne({ where: { id } });
    if (!price) throw new NotFoundException('ProductPrice not found');
    return price;
  }

  async create(dto: CreateProductPriceDto): Promise<ProductPrice> {
    const entity = this.repo.create({
      productId: dto.productId,
      price: dto.price,
      ruleType: dto.ruleType,
      name: dto.name ?? null,
      description: dto.description ?? null,
      startDay: dto.startDay ?? null,
      endDay: dto.endDay ?? null,
      startDatetime: dto.startDatetime ? new Date(dto.startDatetime) : null,
      endDatetime: dto.endDatetime ? new Date(dto.endDatetime) : null,
    });
    return this.repo.save(entity);
  }

  async update(id: number, dto: CreateProductPriceDto): Promise<ProductPrice> {
    const existing = await this.findById(id);
    Object.assign(existing, {
      productId: dto.productId,
      price: dto.price,
      ruleType: dto.ruleType,
      name: dto.name ?? null,
      description: dto.description ?? null,
      startDay: dto.startDay ?? null,
      endDay: dto.endDay ?? null,
      startDatetime: dto.startDatetime ? new Date(dto.startDatetime) : null,
      endDatetime: dto.endDatetime ? new Date(dto.endDatetime) : null,
    });
    return this.repo.save(existing);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('ProductPrice not found');
  }

  async syncForProduct(
    productId: number,
    items: any[],
  ): Promise<ProductPrice[]> {
    await this.repo.delete({ productId });

    const entities = items.map((item) =>
      this.repo.create({
        productId,
        price: parseFloat(item.price),
        ruleType: item.rule_type,
        name: item.name ?? null,
        description: item.description ?? null,
        startDay: item.start_day ? parseInt(item.start_day) : null,
        endDay: item.end_day ? parseInt(item.end_day) : null,
        startDatetime: this.sanitizeDatetime(item.start_datetime),
        endDatetime: this.sanitizeDatetime(item.end_datetime),
      }),
    );

    return this.repo.save(entities);
  }

  private sanitizeDatetime(dt: string | null | undefined): Date | null {
    if (!dt) return null;
    const match = dt.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    return new Date(match ? match[0] : dt);
  }
}
