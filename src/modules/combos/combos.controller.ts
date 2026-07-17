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
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('combos')
@Controller()
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Post('combos')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new combo (Admin/Manager only)' })
  @ApiCreatedResponse({ description: 'Combo created successfully' })
  async create(@Body() createComboDto: CreateComboDto) {
    const data = await this.combosService.create(createComboDto);
    return ApiResponse.created(data, 'Combo created successfully');
  }

  @Get('restaurants/:restaurantId/combos')
  @Public()
  @ApiOperation({ summary: 'Get all active combos for a restaurant' })
  @ApiOkResponse({ description: 'List of active combos' })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.combosService.findAllByRestaurant(
      restaurantId,
      paginationDto,
      search,
    );
    return PaginatedResponse.create(
      data,
      paginationDto.page || 1,
      paginationDto.limit || 10,
      total,
      'Combos retrieved successfully',
    );
  }

  @Get('combos/:id')
  @Public()
  @ApiOperation({ summary: 'Get combo details by ID' })
  @ApiOkResponse({ description: 'Combo detail' })
  async findOne(@Param('id') id: string) {
    const data = await this.combosService.findOne(+id);
    return ApiResponse.success(data, 'Combo retrieved successfully');
  }

  @Patch('combos/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update combo details (Admin/Manager only)' })
  @ApiOkResponse({ description: 'Combo updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateComboDto: UpdateComboDto,
  ) {
    const data = await this.combosService.update(+id, updateComboDto);
    return ApiResponse.updated(data, 'Combo updated successfully');
  }

  @Delete('combos/:id')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a combo (Admin/Manager only)' })
  @ApiOkResponse({ description: 'Combo deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.combosService.remove(+id);
    return ApiResponse.deleted('Combo deleted successfully');
  }

  @Post('combos/:id/image')
  @Roles('admin', 'manager')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for a combo (Admin/Manager only)' })
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
    const data = await this.combosService.uploadImage(+id, file);
    return ApiResponse.success(data, 'Image uploaded successfully');
  }
}
