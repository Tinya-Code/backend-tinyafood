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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { BadRequestException } from '../../common/errors/exceptions';
import { RestaurantId } from '../../common/decorators/restaurant-id.decorator';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import type { Express } from 'express';
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productService: ProductsService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  @Get()
  async index(
    @RestaurantId() restaurantId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const { data, total } = await this.productService.findAll(restaurantId, p, l);
    return PaginatedResponse.create(data, p, l, total, 'Products retrieved successfully');
  }

  @Get('promotions')
  async promotions(
    @RestaurantId() restaurantId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const { data, total } = await this.productService.findPromotions(restaurantId, p, l);
    return PaginatedResponse.create(data, p, l, total, 'Promotions retrieved successfully');
  }

  @Get(':id')
  async show(
    @Param('id', ParseIntPipe) id: number,
    @RestaurantId() restaurantId: string,
  ) {
    const product = await this.productService.findById(id, restaurantId);
    return ApiResponse.success(product, 'Product retrieved successfully');
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async store(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @RestaurantId() restaurantId: string,
  ) {
    try {
      const dto = this.parseBody(body);

      if (file) {
        const uploaded = await this.cloudinary.uploadImage(file);
        dto.imageUrl = uploaded.url;
      }

      const product = await this.productService.create(dto, restaurantId);
      return ApiResponse.created(product, 'Product created successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @RestaurantId() restaurantId: string,
  ) {
    try {
      const dto = this.parseBody(body);
      let imageUrl: string | undefined;

      if (file) {
        const uploaded = await this.cloudinary.uploadImage(file);
        imageUrl = uploaded.url;
      } else if (body.image_url) {
        imageUrl = body.image_url;
      }

      const product = await this.productService.update(
        id,
        dto,
        restaurantId,
        imageUrl,
      );
      return ApiResponse.updated(product, 'Product updated successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @RestaurantId() restaurantId: string,
  ) {
    await this.productService.delete(id, restaurantId);
    return ApiResponse.deleted('Product deleted successfully');
  }

  private parseBody(body: any): CreateProductDto {
    let prices = body.prices;
    let priceRanges = body.price_ranges;

    if (typeof prices === 'string') {
      try {
        prices = JSON.parse(prices);
      } catch {
        prices = undefined;
      }
    }
    if (typeof priceRanges === 'string') {
      try {
        priceRanges = JSON.parse(priceRanges);
      } catch {
        priceRanges = undefined;
      }
    }

    return {
      name: body.name,
      description: body.description,
      price: body.price ? parseFloat(body.price) : undefined,
      categoryId: body.category_id || body.categoryId || undefined,
      isActive:
        body.is_active !== undefined
          ? body.is_active === 'true' || body.is_active === true
          : undefined,
      isRecommended:
        body.is_recommended !== undefined
          ? body.is_recommended === 'true' || body.is_recommended === true
          : undefined,
      prices,
      priceRanges,
    };
  }
}
