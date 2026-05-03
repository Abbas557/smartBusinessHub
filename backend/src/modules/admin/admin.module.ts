import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { BusinessModule } from '../business/business.module';
import { PaymentsModule } from '../payments/payments.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    UsersModule,
    BusinessModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
