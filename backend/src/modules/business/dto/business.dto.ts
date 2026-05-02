import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsUrl,
  MaxLength,
  MinLength,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsObject,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessCategory } from '../business.schema';

// ─── Service DTOs ─────────────────────────────────────────────────────────────

export class CreateServiceDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(5)
  @Max(480)
  durationMinutes: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ─── Day Hours DTO ────────────────────────────────────────────────────────────

export class DayHoursDto {
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be HH:MM format' })
  open?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be HH:MM format' })
  close?: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class BusinessHoursDto {
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) monday?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) tuesday?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) wednesday?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) thursday?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) friday?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) saturday?: DayHoursDto;
  @IsOptional() @ValidateNested() @Type(() => DayHoursDto) sunday?: DayHoursDto;
}

// ─── Business DTOs ────────────────────────────────────────────────────────────

export class CreateBusinessDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(BusinessCategory)
  category?: BusinessCategory;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(BusinessCategory)
  category?: BusinessCategory;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;
}
