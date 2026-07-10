import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('gallery')
@Controller()
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('gallery')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new gallery item (Admin/Manager only)' })
  @ApiCreatedResponse({ description: 'Gallery item created successfully' })
  async create(@Body() createGalleryDto: CreateGalleryDto) {
    const data = await this.galleryService.create(createGalleryDto);
    return ApiResponse.created(data, 'Gallery item created successfully');
  }

  @Get('restaurants/:restaurantId/gallery')
  @Public()
  @ApiOperation({ summary: 'Get all gallery items for a restaurant' })
  @ApiOkResponse({ description: 'List of gallery items' })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } = await this.galleryService.findAllByRestaurant(
      restaurantId,
      paginationDto,
    );
    return PaginatedResponse.create(
      data,
      paginationDto.page || 1,
      paginationDto.limit || 10,
      total,
      'Gallery items retrieved successfully',
    );
  }

  @Get('gallery/:id')
  @Public()
  @ApiOperation({ summary: 'Get gallery item by ID' })
  @ApiOkResponse({ description: 'Gallery item detail' })
  async findOne(@Param('id') id: string) {
    const data = await this.galleryService.findOne(+id);
    return ApiResponse.success(data, 'Gallery item retrieved successfully');
  }

  @Patch('gallery/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update gallery item details (Admin/Manager only)' })
  @ApiOkResponse({ description: 'Gallery item updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ) {
    const data = await this.galleryService.update(+id, updateGalleryDto);
    return ApiResponse.updated(data, 'Gallery item updated successfully');
  }

  @Delete('gallery/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a gallery item (Admin/Manager only)' })
  @ApiOkResponse({ description: 'Gallery item deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.galleryService.remove(+id);
    return ApiResponse.deleted('Gallery item deleted successfully');
  }

  @Post('gallery/:id/image')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for a gallery item (Admin/Manager only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Image uploaded successfully' })
  async uploadImage(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const data = await this.galleryService.uploadImage(+id, file);
    return ApiResponse.success(data, 'Image uploaded successfully');
  }
}
