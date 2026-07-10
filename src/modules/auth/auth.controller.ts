import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiResponse } from '../../common/api-response/api-response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login to obtain JWT token' })
  @ApiOkResponse({ description: 'Authentication successful' })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return ApiResponse.success(data, 'Login successful');
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Current user details' })
  async getProfile(@CurrentUser() currentUser: JwtPayload) {
    const data = await this.authService.getProfile(currentUser.sub);
    return ApiResponse.success(data, 'Profile retrieved successfully');
  }
}
