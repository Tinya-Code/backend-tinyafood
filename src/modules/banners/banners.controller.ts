import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { RestaurantId } from '../../common/decorators/restaurant-id.decorator';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import type { Express } from 'express';

@ApiTags('banners')
@Controller()
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ── Ruta pública: restaurantId en URL (solo activos) ──────────────────
  @Get('restaurants/:restaurantId/banners')
  @Public()
  @ApiOperation({ summary: 'Get all active banners for a restaurant (Public)' })
  @ApiOkResponse({ description: 'List of active banners' })
  async indexPublic(
    @Param('restaurantId') restaurantId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const { data, total } = await this.bannersService.findAllActive(restaurantId, p, l);
    return PaginatedResponse.create(data, p, l, total, 'Active banners retrieved successfully');
  }

  // ── Ruta admin: restaurantId por header x-restaurant-id (todos) ───────
  @Get('banners')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all banners (active & inactive) for a restaurant (Admin/Manager)' })
  @ApiOkResponse({ description: 'List of all banners' })
  async indexAdmin(
    @RestaurantId() restaurantId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const { data, total } = await this.bannersService.findAll(restaurantId, p, l, search);
    return PaginatedResponse.create(data, p, l, total, 'All banners retrieved successfully');
  }

  @Get('banners/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get banner details by ID (Admin/Manager)' })
  @ApiOkResponse({ description: 'Banner details' })
  async show(@Param('id') id: string) {
    const banner = await this.bannersService.findById(id);
    return ApiResponse.success(banner, 'Banner retrieved successfully');
  }

  @Post('banners')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new banner (Admin/Manager)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        isActive: { type: 'boolean' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Banner created successfully' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @RestaurantId() restaurantId: string,
  ) {
    try {
      const dto = this.parseBody(body);

      if (file) {
        const uploaded = await this.cloudinary.uploadImage(file, 'banners');
        dto.imageUrl = uploaded.url;
      } else if (body.imageUrl) {
        dto.imageUrl = body.imageUrl;
      }

      if (!dto.imageUrl) {
        throw new BadRequestException('Image file or imageUrl is required');
      }

      const banner = await this.bannersService.create(dto, restaurantId);
      return ApiResponse.created(banner, 'Banner created successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('banners/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update banner details (Admin/Manager)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        isActive: { type: 'boolean' },
        image: { type: 'string', format: 'binary' },
        imageUrl: { type: 'string' },
      },
    },
  })
  @ApiOkResponse({ description: 'Banner updated successfully' })
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      const dto = this.parseBody(body);
      let imageUrl: string | undefined;

      if (file) {
        const uploaded = await this.cloudinary.uploadImage(file, 'banners');
        imageUrl = uploaded.url;
      } else if (body.imageUrl) {
        imageUrl = body.imageUrl;
      }

      const banner = await this.bannersService.update(id, dto, imageUrl);
      return ApiResponse.updated(banner, 'Banner updated successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('banners/:id/toggle')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle banner active status (Admin/Manager)' })
  @ApiOkResponse({ description: 'Banner status toggled successfully' })
  async toggleActive(@Param('id') id: string) {
    const banner = await this.bannersService.toggleActive(id);
    return ApiResponse.success(banner, 'Banner status toggled successfully');
  }

  @Delete('banners/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner (Admin/Manager)' })
  @ApiOkResponse({ description: 'Banner deleted successfully' })
  async destroy(@Param('id') id: string) {
    await this.bannersService.delete(id);
    return ApiResponse.deleted('Banner deleted successfully');
  }

  @Post('banners/:id/image')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload banner image directly (Admin/Manager)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ description: 'Image uploaded successfully' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const banner = await this.bannersService.uploadImage(id, file);
    return ApiResponse.success(banner, 'Image uploaded successfully');
  }

  private parseBody(body: any): CreateBannerDto {
    return {
      title: body.title !== undefined ? body.title : undefined,
      isActive: body.isActive !== undefined 
        ? (body.isActive === 'true' || body.isActive === true || body.isActive === 1 || body.isActive === '1')
        : undefined,
    };
  }
}
