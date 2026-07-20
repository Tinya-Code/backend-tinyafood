import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('banners')
export class Banner {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ name: 'restaurant_id', type: 'char', length: 36 })
  restaurantId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;


  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
