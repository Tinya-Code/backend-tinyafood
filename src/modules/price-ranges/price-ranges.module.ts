import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceRange } from './entities/price-range.entity';
import { PriceRangesService } from './price-ranges.service';
import { PriceRangesController } from './price-ranges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PriceRange])],
  controllers: [PriceRangesController],
  providers: [PriceRangesService],
  exports: [PriceRangesService],
})
export class PriceRangesModule {}
