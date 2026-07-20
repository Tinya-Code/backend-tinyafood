import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { Banner } from './entities/banner.entity';
import { CloudinaryModule } from '../../services/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner]),
    CloudinaryModule,
  ],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
