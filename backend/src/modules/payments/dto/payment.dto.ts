import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaymentMethod } from '../../bookings/booking.schema';

export class DemoPaymentDto {
  @IsMongoId()
  bookingId: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
