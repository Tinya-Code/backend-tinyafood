import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateComboDto {
  @ApiProperty({ description: 'Restaurant ID this combo belongs to' })
  @IsUUID()
  @IsNotEmpty()
  restaurant_id!: string;

  @ApiProperty({ description: 'Combo name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Combo description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Combo image URL (defaults to placeholder)' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ description: 'Combo price (minimum 0)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}
