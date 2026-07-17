import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('categories')
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('categories')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin/Manager only)' })
  @ApiCreatedResponse({ description: 'Category created successfully' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoriesService.create(createCategoryDto);
    return ApiResponse.created(data, 'Category created successfully');
  }

  @Get('restaurants/:restaurantId/categories')
  @Public()
  @ApiOperation({ summary: 'Get all active categories for a restaurant' })
  @ApiOkResponse({ description: 'List of active categories' })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.categoriesService.findAllByRestaurant(
      restaurantId,
      paginationDto,
      search,
    );
    return PaginatedResponse.create(
      data,
      paginationDto.page || 1,
      paginationDto.limit || 10,
      total,
      'Categories retrieved successfully',
    );
  }

  @Get('categories/:id')
  @Public()
  @ApiOperation({ summary: 'Get category details by ID' })
  @ApiOkResponse({ description: 'Category detail' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return ApiResponse.success(data, 'Category retrieved successfully');
  }

  @Patch('categories/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category details (Admin/Manager only)' })
  @ApiOkResponse({ description: 'Category updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.update(id, updateCategoryDto);
    return ApiResponse.updated(data, 'Category updated successfully');
  }

  @Delete('categories/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a category (Admin/Manager only)' })
  @ApiOkResponse({ description: 'Category deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return ApiResponse.deleted('Category deleted successfully');
  }
}
