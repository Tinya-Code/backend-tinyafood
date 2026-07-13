import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductPricesModule } from '../product-prices/product-prices.module';
import { PriceRangesModule } from '../price-ranges/price-ranges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ProductPricesModule,
    PriceRangesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
