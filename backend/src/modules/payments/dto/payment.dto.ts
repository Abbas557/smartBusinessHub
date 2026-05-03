import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../../bookings/booking.schema';

export class DemoPaymentDto {
  @IsMongoId()
  bookingId: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}

export class RazorpayOrderDto {
  @IsMongoId()
  bookingId: string;
}

export class RazorpayVerifyDto {
  @IsMongoId()
  bookingId: string;

  @IsString()
  razorpayOrderId: string;

  @IsString()
  razorpayPaymentId: string;

  @IsString()
  razorpaySignature: string;
}
