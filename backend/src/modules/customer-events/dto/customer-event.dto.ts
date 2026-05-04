import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessCategory } from '../../business/business.schema';
import { CustomerEventType } from '../customer-event.schema';

class EventLocationDto {
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @IsNumber()
  @Type(() => Number)
  lng: number;
}

export class TrackCustomerEventDto {
  @IsEnum(CustomerEventType)
  eventType: CustomerEventType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sessionId?: string;

  @IsOptional()
  @IsMongoId()
  businessId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  businessSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  serviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  serviceName?: string;

  @IsOptional()
  @IsEnum(BusinessCategory)
  category?: BusinessCategory;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  collectionSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  query?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  area?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  pincode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EventLocationDto)
  location?: EventLocationDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
