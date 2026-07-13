import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPrice } from './entities/product-price.entity';
import { ProductPricesService } from './product-prices.service';
import { ProductPricesController } from './product-prices.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPrice])],
  controllers: [ProductPricesController],
  providers: [ProductPricesService],
  exports: [ProductPricesService],
})
export class ProductPricesModule {}
