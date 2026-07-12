import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Length,
  Min,
} from 'class-validator';

export class CreatePriceRangeDto {
  @IsNumber()
  @Min(1)
  productId: number;

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
  @Length(1, 255)
  bonus?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
