import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Restaurant ID this category belongs to' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  restaurant_id!: string;

  @ApiProperty({
    description: 'Identifier of the visual block (e.g. block-1 to block-7)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  block_id!: string;

  @ApiProperty({ description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsString()
  @IsOptional()
  description?: string;
}
