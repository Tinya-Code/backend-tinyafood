import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const RestaurantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const restaurantId = request.headers['x-restaurant-id'];
    if (!restaurantId) {
      throw new BadRequestException('Missing x-restaurant-id header');
    }
    return restaurantId;
  },
);
