import { Injectable } from '@nestjs/common';
import { CreatePriceRangeDto } from './dto/create-price-range.dto';
import { UpdatePriceRangeDto } from './dto/update-price-range.dto';

@Injectable()
export class PriceRangesService {
  create(createPriceRangeDto: CreatePriceRangeDto) {
    return 'This action adds a new priceRange';
  }

  findAll() {
    return `This action returns all priceRanges`;
  }

  findOne(id: number) {
    return `This action returns a #${id} priceRange`;
  }

  update(id: number, updatePriceRangeDto: UpdatePriceRangeDto) {
    return `This action updates a #${id} priceRange`;
  }

  remove(id: number) {
    return `This action removes a #${id} priceRange`;
  }
}
