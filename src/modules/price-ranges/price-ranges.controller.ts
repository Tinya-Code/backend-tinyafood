import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PriceRangesService } from './price-ranges.service';
import { CreatePriceRangeDto } from './dto/create-price-range.dto';
import { BadRequestException } from '../../common/errors/exceptions';

@Controller('price-ranges')
export class PriceRangesController {
  constructor(private readonly service: PriceRangesService) {}

  @Get()
  async index() {
    const ranges = await this.service.findAll();
    return { data: ranges };
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    const range = await this.service.findById(id);
    return { data: range };
  }

  @Get('product/:productId')
  async byProduct(@Param('productId', ParseIntPipe) productId: number) {
    const ranges = await this.service.findByProductId(productId);
    return { data: ranges };
  }

  @Post()
  async store(@Body() dto: CreatePriceRangeDto) {
    try {
      const range = await this.service.create(dto);
      return { data: range };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePriceRangeDto,
  ) {
    try {
      const range = await this.service.update(id, dto);
      return { data: range };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('product/:productId/sync')
  async sync(
    @Param('productId', ParseIntPipe) productId: number,
    @Body('variants') variants: any[],
  ) {
    try {
      const results = await this.service.syncForProduct(
        productId,
        variants || [],
      );
      return { data: results };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number) {
    await this.service.delete(id);
    return { message: 'Price range deleted successfully' };
  }
}
