import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartaController } from './carta.controller';
import { CartaService } from './carta.service';
import { DatabaseModule } from '../../services/database/database.module';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [CartaController],
  providers: [CartaService],
  exports: [CartaService],
})
export class CartaModule {}