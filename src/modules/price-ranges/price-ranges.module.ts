import { Module } from '@nestjs/common';
import { PriceRangesService } from './price-ranges.service';
import { PriceRangesController } from './price-ranges.controller';

@Module({
  controllers: [PriceRangesController],
  providers: [PriceRangesService],
})
export class PriceRangesModule {}
