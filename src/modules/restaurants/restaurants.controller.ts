import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new restaurant (Admin only)' })
  @ApiCreatedResponse({ description: 'Restaurant created successfully' })
  async create(@Body() createRestaurantDto: CreateRestaurantDto) {
    const data = await this.restaurantsService.create(createRestaurantDto);
    return ApiResponse.created(data, 'Restaurant created successfully');
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all active restaurants' })
  @ApiOkResponse({ description: 'List of active restaurants' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const { data, total } = await this.restaurantsService.findAll(paginationDto);
    return PaginatedResponse.create(
      data,
      paginationDto.page || 1,
      paginationDto.limit || 10,
      total,
      'Restaurants retrieved successfully',
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiOkResponse({ description: 'Restaurant detail' })
  async findOne(@Param('id') id: string) {
    const data = await this.restaurantsService.findOne(id);
    return ApiResponse.success(data, 'Restaurant retrieved successfully');
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant details (Admin/Manager only)' })
  @ApiOkResponse({ description: 'Restaurant updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    const data = await this.restaurantsService.update(id, updateRestaurantDto);
    return ApiResponse.updated(data, 'Restaurant updated successfully');
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a restaurant (Admin only)' })
  @ApiOkResponse({ description: 'Restaurant deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.restaurantsService.remove(id);
    return ApiResponse.deleted('Restaurant deleted successfully');
  }
}
