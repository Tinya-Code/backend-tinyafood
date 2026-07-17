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
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { BadRequestException } from '../../common/errors/exceptions';
import { RestaurantId } from '../../common/decorators/restaurant-id.decorator';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';
import type { Express } from 'express';

@Controller()
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ── Ruta pública: restaurantId en URL ─────────────────────────────
  @Get('restaurants/:restaurantId/gallery')
  @Public()
  async indexByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const { data, total } = await this.galleryService.findAll(restaurantId, p, l);
    return PaginatedResponse.create(data, p, l, total, 'Gallery items retrieved successfully');
  }

  // ── Ruta admin: restaurantId por header x-restaurant-id ────────────
  @Get('gallery')
  @Public()
  async index(
    @RestaurantId() restaurantId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const { data, total } = await this.galleryService.findAll(restaurantId, p, l);
    return PaginatedResponse.create(data, p, l, total, 'Gallery items retrieved successfully');
  }

  @Get('gallery/:id')
  @Public()
  async show(@Param('id', ParseIntPipe) id: number) {
    const item = await this.galleryService.findById(id);
    return ApiResponse.success(item, 'Gallery item retrieved successfully');
  }

  @Post('gallery')
  @UseInterceptors(FileInterceptor('image'))
  async store(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @RestaurantId() restaurantId: string,
  ) {
    try {
      const dto = this.parseBody(body);

      if (file) {
        const uploaded = await this.cloudinary.uploadImage(file, 'gallery');
        dto.imageUrl = uploaded.url;
      }

      const item = await this.galleryService.create(dto, restaurantId);
      return ApiResponse.created(item, 'Gallery item created successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('gallery/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      const dto = this.parseBody(body);
      let imageUrl: string | undefined;

      if (file) {
        const uploaded = await this.cloudinary.uploadImage(file, 'gallery');
        imageUrl = uploaded.url;
      } else if (body.image_url) {
        imageUrl = body.image_url;
      }

      const item = await this.galleryService.update(id, dto, imageUrl);
      return ApiResponse.updated(item, 'Gallery item updated successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('gallery/:id')
  async destroy(@Param('id', ParseIntPipe) id: number) {
    await this.galleryService.delete(id);
    return ApiResponse.deleted('Gallery item deleted successfully');
  }

  @Post('gallery/:id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const item = await this.galleryService.uploadImage(id, file);
    return ApiResponse.success(item, 'Image uploaded successfully');
  }

  private parseBody(body: any): CreateGalleryDto {
    return {
      title: body.title || body.name,
      description: body.description || undefined,
      imageUrl: body.image_url || undefined,
    };
  }
}
