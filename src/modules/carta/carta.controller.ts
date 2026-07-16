import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CartaService, CartaResponse } from './carta.service';
import { ApiResponse } from '../../common/api-response/api-response';
import { Public } from '../../common/decorators/public.decorator';

@Controller('carta')
export class CartaController {
  constructor(private readonly cartaService: CartaService) {}

  @Get('restaurant/:restaurantId')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getCartaByRestaurant(@Param('restaurantId') restaurantId: string): Promise<ApiResponse<CartaResponse>> {
    const carta = await this.cartaService.getCartaByRestaurant(restaurantId);
    return ApiResponse.success(carta, 'Carta retrieved successfully');
  }

  @Get('restaurant/:restaurantId/simple')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getCartaSimple(@Param('restaurantId') restaurantId: string) {
    const carta = await this.cartaService.getCartaSimple(restaurantId);
    return ApiResponse.success(carta, 'Carta simple retrieved successfully');
  }
}