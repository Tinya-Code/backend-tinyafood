import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsUUID, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Restaurant ID the user belongs to' })
  @IsUUID()
  @IsNotEmpty()
  restaurant_id!: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Email address (must be unique)' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Password (minimum 6 characters)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ description: 'User role', enum: ['admin', 'manager', 'staff'] })
  @IsEnum(['admin', 'manager', 'staff'])
  role!: 'admin' | 'manager' | 'staff';
}
