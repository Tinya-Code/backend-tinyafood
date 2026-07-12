import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('product_prices')
export class ProductPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ name: 'start_day', type: 'int', nullable: true })
  startDay: number | null;

  @Column({ name: 'end_day', type: 'int', nullable: true })
  endDay: number | null;

  @Column({ name: 'start_datetime', type: 'timestamp', nullable: true })
  startDatetime: Date | null;

  @Column({ name: 'end_datetime', type: 'timestamp', nullable: true })
  endDatetime: Date | null;

  @Column({ name: 'rule_type', type: 'varchar', length: 50 })
  ruleType: 'DAY' | 'PROMOTION';

  @ManyToOne(() => Product, (product) => product.prices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
