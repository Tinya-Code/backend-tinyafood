import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductPricesService } from '../product-prices/product-prices.service';
import { PriceRangesService } from '../price-ranges/price-ranges.service';
import { NotFoundException } from '../../common/errors/exceptions';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly priceService: ProductPricesService,
    private readonly rangeService: PriceRangesService,
  ) {}

  async findAll(restaurantId: string, page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit;

    const qb = this.productRepo.createQueryBuilder('p')
      .where('p.restaurant_id = :restaurantId', { restaurantId });

    if (search) {
      qb.andWhere(
        '(LOWER(p.name) LIKE LOWER(:search) OR LOWER(p.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();

    const products = await qb
      .orderBy('p.id', 'ASC')
      .take(limit)
      .skip(offset)
      .getMany();

    for (const product of products) {
      product.prices = await this.priceService.findAll(product.id);
      product.priceRanges = await this.rangeService.findByProductId(product.id);
    }

    return { data: products, total };
  }

  async findById(id: number, restaurantId?: string): Promise<Product> {
    const where: any = { id };
    if (restaurantId) where.restaurantId = restaurantId;

    const product = await this.productRepo.findOne({ where });
    if (!product) throw new NotFoundException('Product not found');

    product.prices = await this.priceService.findAll(id);
    product.priceRanges = await this.rangeService.findByProductId(id);

    return product;
  }

  async create(dto: CreateProductDto, restaurantId: string): Promise<Product> {
    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      price: dto.price ?? null,
      categoryId: dto.categoryId ?? null,
      isActive: dto.isActive ?? true,
      isRecommended: dto.isRecommended ?? false,
      imageUrl: dto.imageUrl ?? null,
      restaurantId,
    });

    const saved = await this.productRepo.save(product);

    if (dto.prices && dto.prices.length > 0) {
      await this.priceService.syncForProduct(saved.id, dto.prices);
    }

    if (dto.priceRanges && dto.priceRanges.length > 0) {
      await this.rangeService.syncForProduct(saved.id, dto.priceRanges);
    }

    return this.findById(saved.id, restaurantId);
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    restaurantId: string,
    imageUrl?: string,
  ): Promise<Product> {
    const existing = await this.findById(id, restaurantId);

    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.description !== undefined) existing.description = dto.description;
    if (dto.price !== undefined) existing.price = dto.price;
    if (dto.categoryId !== undefined) existing.categoryId = dto.categoryId;
    if (dto.isActive !== undefined) existing.isActive = dto.isActive;
    if (dto.isRecommended !== undefined) existing.isRecommended = dto.isRecommended;

    if (imageUrl !== undefined) {
      existing.imageUrl = imageUrl;
    }

    await this.productRepo.save(existing);

    if (dto.prices !== undefined) {
      await this.priceService.syncForProduct(id, dto.prices);
    }

    if (dto.priceRanges !== undefined) {
      await this.rangeService.syncForProduct(id, dto.priceRanges);
    }

    return this.findById(id, restaurantId);
  }

  async delete(id: number, restaurantId: string): Promise<void> {
    const product = await this.findById(id, restaurantId);
    await this.productRepo.remove(product);
  }

  async findPromotions(restaurantId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const countResult = await this.productRepo.query(
      `SELECT COUNT(DISTINCT p.id) as total
       FROM products p
       INNER JOIN product_prices pp ON pp.product_id = p.id
       WHERE pp.rule_type = 'PROMOTION'
         AND pp.end_datetime >= NOW()
         AND p.restaurant_id = ?`,
      [restaurantId],
    );
    const total: number = countResult[0]?.total || 0;

    const rows = await this.productRepo.query(
      `SELECT DISTINCT p.*, pp.start_datetime AS sort_datetime
       FROM products p
       INNER JOIN product_prices pp ON pp.product_id = p.id
       WHERE pp.rule_type = 'PROMOTION'
         AND pp.end_datetime >= NOW()
         AND p.restaurant_id = ?
       ORDER BY sort_datetime ASC
       LIMIT ? OFFSET ?`,
      [restaurantId, Number(limit), Number(offset)],
    );

    for (const row of rows) {
      row.prices = await this.priceService.findAll(row.id);
      row.priceRanges = await this.rangeService.findByProductId(row.id);
    }

    return { data: rows, total };
  }
}
