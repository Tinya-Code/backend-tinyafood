import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductPrice } from '../../product-prices/entities/product-price.entity';
import { PriceRange } from '../../price-ranges/entities/price-range.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float', nullable: true })
  price: number | null;

  @Column({ name: 'restaurant_id', type: 'varchar', length: 36 })
  restaurantId: string;

  @Column({ name: 'category_id', type: 'varchar', length: 36, nullable: true })
  categoryId: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProductPrice, (price) => price.product)
  prices: ProductPrice[];

  @OneToMany(() => PriceRange, (range) => range.product)
  priceRanges: PriceRange[];
}
