import {
  IsEmail,
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BookingStatus, PaymentMethod } from '../booking.schema';

export class CreateBookingDto {
  @IsMongoId()
  businessId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsString()
  serviceId: string;

  @IsISO8601()
  date: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be HH:MM format' })
  startTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

export class SlotQueryDto {
  @IsMongoId()
  businessId: string;

  @IsString()
  serviceId: string;

  @IsISO8601()
  date: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

export class RescheduleBookingDto {
  @IsISO8601()
  date: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be HH:MM format' })
  startTime: string;
}
