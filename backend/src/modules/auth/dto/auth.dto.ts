import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBusinessDto, CreateServiceDto } from '../../business/dto/business.dto';
import { CreateCustomerProfileDto } from '../../customer-profiles/dto/customer-profile.dto';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(64, { message: 'Password must not exceed 64 characters' })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

export class RegisterOwnerDto extends RegisterDto {
  @ValidateNested()
  @Type(() => CreateBusinessDto)
  business: CreateBusinessDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateServiceDto)
  firstService?: CreateServiceDto;
}

export class RegisterCustomerDto extends RegisterDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCustomerProfileDto)
  profile?: CreateCustomerProfileDto;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
