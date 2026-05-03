import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerLocationDto {
  @IsLongitude()
  lng: number;

  @IsLatitude()
  lat: number;
}

export class CreateCustomerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  pincode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerLocationDto)
  location?: CustomerLocationDto;
}

export class UpdateCustomerProfileDto extends CreateCustomerProfileDto {}
