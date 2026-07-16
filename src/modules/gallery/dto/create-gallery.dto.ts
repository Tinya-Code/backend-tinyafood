import { IsString, IsNotEmpty, IsOptional, Length, MaxLength } from 'class-validator';

export class CreateGalleryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
