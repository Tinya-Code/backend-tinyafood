import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(0, 1000)
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateIf((o) => !o.priceRanges || o.priceRanges.length === 0)
  price?: number;

  @IsOptional()
  @IsString()
  @Length(1, 36)
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  prices?: CreateProductPriceItemDto[];

  @IsOptional()
  priceRanges?: CreatePriceRangeItemDto[];
}

export class CreateProductPriceItemDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  ruleType: 'DAY' | 'PROMOTION';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  startDay?: number;

  @IsOptional()
  @IsNumber()
  endDay?: number;

  @IsOptional()
  @IsString()
  startDatetime?: string;

  @IsOptional()
  @IsString()
  endDatetime?: string;
}

export class CreatePriceRangeItemDto {
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  unit?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  bonus?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
