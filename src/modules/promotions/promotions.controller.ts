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
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { BadRequestException } from '../../common/errors/exceptions';
import { RestaurantId } from '../../common/decorators/restaurant-id.decorator';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';
import type { Express } from 'express';

@Controller()
export class PromotionsController {
  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get('promotions')
  @Public()
  async index(
    @RestaurantId() restaurantId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const { data, total } = await this.promotionsService.findAll(restaurantId, p, l, search);
    return PaginatedResponse.create(data, p, l, total, 'Promotions retrieved successfully');
  }

  @Get('promotions/:id')
  @Public()
  async show(
    @Param('id', ParseIntPipe) id: number,
    @RestaurantId() restaurantId: string,
  ) {
    const promo = await this.promotionsService.findById(id, restaurantId);
    return ApiResponse.success(promo, 'Promotion retrieved successfully');
  }

  @Post('promotions')
  @Public()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @RestaurantId() restaurantId: string,
  ) {
    try {
      const dto = this.parseBody(body);

      if (file) {
        const uploaded = await this.cloudinary.uploadImage(file, 'promotions');
        dto.imageUrl = uploaded.url;
      }

      const promo = await this.promotionsService.create(dto, restaurantId);
      return ApiResponse.created(promo, 'Promotion created successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('promotions/:id')
  @Public()
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

      const existing = await this.promotionsService.findById(id, restaurantId);

      if (file) {
        if (existing.imageUrl) {
          await this.cloudinary.deleteImageByUrl(existing.imageUrl);
        }
        const uploaded = await this.cloudinary.uploadImage(file, 'promotions');
        imageUrl = uploaded.url;
      } else if ('image_url' in body) {
        if (existing.imageUrl) {
          await this.cloudinary.deleteImageByUrl(existing.imageUrl);
        }
        imageUrl = body.image_url || null;
      }

      const promo = await this.promotionsService.update(id, dto, restaurantId, imageUrl);
      return ApiResponse.updated(promo, 'Promotion updated successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('promotions/:id')
  @Public()
  async destroy(
    @Param('id', ParseIntPipe) id: number,
    @RestaurantId() restaurantId: string,
  ) {
    await this.promotionsService.delete(id, restaurantId);
    return ApiResponse.deleted('Promotion deleted successfully');
  }

  private parseBody(body: any): CreatePromotionDto {
    return {
      name: body.name,
      description: body.description,
      basePrice: body.base_price ? parseFloat(body.base_price) : undefined,
      promoPrice: body.promo_price ? parseFloat(body.promo_price) : parseFloat(body.promoPrice) || 0,
      startDate: body.start_date || undefined,
      endDate: body.end_date || undefined,
      isActive:
        body.is_active !== undefined
          ? body.is_active === 'true' || body.is_active === true
          : undefined,
    };
  }
}
