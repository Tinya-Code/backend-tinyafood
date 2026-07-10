import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, APP_GUARD } from '@nestjs/core';
// import { WinstonModule } from 'nest-winston';
// import * as winston from 'winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { CommonModule } from './common/common.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PriceRangesModule } from './modules/price-ranges/price-ranges.module';
import { ProductPricesModule } from './modules/product-prices/product-prices.module';
import { CombosModule } from './modules/combos/combos.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './services/database/database.module';
import { CloudinaryModule } from './services/cloudinary/cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/logging/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ValidationPipe } from './common/validation/validation.pipe';

// Winston logger configuration (commented out until dependencies are installed)
// const logDir = process.env.LOG_DIR || 'logs';
// const winstonConfig = {
//   level: process.env.LOG_LEVEL || 'info',
//   format: winston.format.combine(
//     winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     winston.format.errors({ stack: true }),
//     winston.format.splat(),
//     winston.format.json(),
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: `${logDir}/error.log`, level: 'error' }),
//     new winston.transports.File({ filename: `${logDir}/combined.log` }),
//   ],
// };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // WinstonModule.forRoot(winstonConfig), // Uncomment after installing dependencies
    ProductsModule,
    CommonModule,
    RestaurantsModule,
    CategoriesModule,
    PriceRangesModule,
    ProductPricesModule,
    CombosModule,
    GalleryModule,
    UsersModule,
    DatabaseModule,
    CloudinaryModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(),
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
