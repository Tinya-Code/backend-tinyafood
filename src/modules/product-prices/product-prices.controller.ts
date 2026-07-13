import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductPricesService } from './product-prices.service';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { BadRequestException } from '../../common/errors/exceptions';

@Controller('product-prices')
export class ProductPricesController {
  constructor(private readonly service: ProductPricesService) {}

  @Get()
  async index(@Query('product_id') productId?: string) {
    const pid = productId ? parseInt(productId, 10) : undefined;
    const prices = await this.service.findAll(pid);
    return { data: prices };
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    const price = await this.service.findById(id);
    return { data: price };
  }

  @Post()
  async store(@Body() dto: CreateProductPriceDto) {
    try {
      const price = await this.service.create(dto);
      return { data: price };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductPriceDto,
  ) {
    try {
      const price = await this.service.update(id, dto);
      return { data: price };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number) {
    await this.service.delete(id);
    return { message: 'ProductPrice deleted successfully' };
  }
}
