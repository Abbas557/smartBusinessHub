import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessModule } from '../business/business.module';
import { CustomersModule } from '../customers/customers.module';
import { MailModule } from '../mail/mail.module';
import { Booking, BookingSchema } from './booking.schema';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingDao } from './dao/booking.dao';

@Module({
  imports: [
    BusinessModule,
    CustomersModule,
    MailModule,
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingDao, BookingsService],
  exports: [BookingDao, BookingsService],
})
export class BookingsModule {}
