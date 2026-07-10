import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PriceRangesService } from './price-ranges.service';
import { CreatePriceRangeDto } from './dto/create-price-range.dto';
import { UpdatePriceRangeDto } from './dto/update-price-range.dto';

@Controller('price-ranges')
export class PriceRangesController {
  constructor(private readonly priceRangesService: PriceRangesService) {}

  @Post()
  create(@Body() createPriceRangeDto: CreatePriceRangeDto) {
    return this.priceRangesService.create(createPriceRangeDto);
  }

  @Get()
  findAll() {
    return this.priceRangesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceRangesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePriceRangeDto: UpdatePriceRangeDto) {
    return this.priceRangesService.update(+id, updatePriceRangeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priceRangesService.remove(+id);
  }
}
