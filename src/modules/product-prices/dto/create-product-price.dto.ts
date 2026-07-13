import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Length,
  Min,
  Max,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'ProductPriceRuleValidation', async: false })
export class ProductPriceRuleValidation implements ValidatorConstraintInterface {
  validate(dto: CreateProductPriceDto, args: ValidationArguments): boolean {
    if (dto.ruleType === 'DAY') {
      if (dto.startDay == null || dto.endDay == null) return false;
      if (dto.startDay < 1 || dto.startDay > 31) return false;
      if (dto.endDay < 1 || dto.endDay > 31) return false;
      if (dto.startDay > dto.endDay) return false;
      if (dto.startDatetime || dto.endDatetime) return false;
    } else {
      if (!dto.startDatetime || !dto.endDatetime) return false;
      if (dto.startDay != null || dto.endDay != null) return false;
      if (dto.startDatetime >= dto.endDatetime) return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as CreateProductPriceDto;
    if (dto.ruleType === 'DAY') {
      return 'DAY rule: start_day and end_day required (1-31), start_day <= end_day, datetime fields must be null';
    }
    return 'PROMOTION rule: start_datetime and end_datetime required, start_datetime < end_datetime, day fields must be null';
  }
}

export class CreateProductPriceDto {
  @IsNumber()
  @Min(1)
  productId: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsIn(['DAY', 'PROMOTION'])
  ruleType: 'DAY' | 'PROMOTION';

  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  startDay?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  endDay?: number;

  @IsOptional()
  @IsString()
  startDatetime?: string;

  @IsOptional()
  @IsString()
  endDatetime?: string;

  @Validate(ProductPriceRuleValidation)
  _ruleValidation: any;
}
