import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsModule } from '../bookings/bookings.module';
import { BusinessModule } from '../business/business.module';
import { Review, ReviewSchema } from './review.schema';
import { ReviewDao } from './dao/review.dao';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    BookingsModule,
    BusinessModule,
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewDao, ReviewsService],
  exports: [ReviewDao, ReviewsService],
})
export class ReviewsModule {}
