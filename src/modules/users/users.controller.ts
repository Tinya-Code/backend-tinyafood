import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiResponse, PaginatedResponse } from '../../common/api-response/api-response';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('users')
@ApiBearerAuth()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return ApiResponse.created(data, 'User created successfully');
  }

  @Get('restaurants/:restaurantId/users')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all active users for a restaurant (Admin/Manager only)' })
  @ApiOkResponse({ description: 'List of active users' })
  async findAll(
    @Param('restaurantId') restaurantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } = await this.usersService.findAll(restaurantId, paginationDto);
    return PaginatedResponse.create(
      data,
      paginationDto.page || 1,
      paginationDto.limit || 10,
      total,
      'Users retrieved successfully',
    );
  }

  @Get('users/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get user details by ID (Admin/Manager only)' })
  @ApiOkResponse({ description: 'User detail' })
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return ApiResponse.success(data, 'User retrieved successfully');
  }

  @Patch('users/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update user details (Admin/Manager only)' })
  @ApiOkResponse({ description: 'User updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.usersService.update(id, updateUserDto);
    return ApiResponse.updated(data, 'User updated successfully');
  }

  @Delete('users/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Soft delete a user (Admin only)' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return ApiResponse.deleted('User deleted successfully');
  }

  @Patch('users/:id/password')
  @ApiOperation({ summary: 'Update user password (Admin or self only)' })
  @ApiOkResponse({ description: 'Password updated successfully' })
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    if (currentUser.role !== 'admin' && currentUser.sub !== id) {
      throw new ForbiddenException('You can only change your own password');
    }

    await this.usersService.updatePassword(id, updatePasswordDto.newPassword);
    return ApiResponse.success(null, 'Password updated successfully');
  }
}
