import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BookingDao } from '../bookings/dao/booking.dao';
import { BookingStatus } from '../bookings/booking.schema';
import { BusinessService } from '../business/business.service';
import { CreateReviewDto } from './dto/review.dto';
import { ReviewDocument, ReviewStatus } from './review.schema';
import { ReviewDao } from './dao/review.dao';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewDao: ReviewDao,
    private readonly bookingDao: BookingDao,
    private readonly businessService: BusinessService,
  ) {}

  async createForCustomer(
    customerUserId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewDocument> {
    const booking = await this.bookingDao.findByIdAndCustomerUser(
      dto.bookingId,
      customerUserId,
    );
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Only completed bookings can be reviewed',
      );
    }

    const existing = await this.reviewDao.findByBooking(dto.bookingId);
    if (existing) {
      throw new ConflictException('This booking has already been reviewed');
    }

    const review = await this.reviewDao.create({
      businessId: booking.businessId,
      customerUserId: new Types.ObjectId(customerUserId) as any,
      bookingId: new Types.ObjectId(dto.bookingId) as any,
      customerName: booking.customerName,
      rating: dto.rating,
      comment: dto.comment,
      status: ReviewStatus.PUBLISHED,
    });

    await this.refreshBusinessRating(booking.businessId.toString());
    return review;
  }

  async findMine(customerUserId: string): Promise<ReviewDocument[]> {
    return this.reviewDao.findByCustomer(customerUserId);
  }

  async findPublishedByBusiness(
    businessId: string,
  ): Promise<ReviewDocument[]> {
    await this.businessService.getPublicProfileById(businessId);
    return this.reviewDao.findPublishedByBusiness(businessId);
  }

  async findAllForAdmin(): Promise<ReviewDocument[]> {
    return this.reviewDao.findAll();
  }

  async setStatusForAdmin(
    reviewId: string,
    status: ReviewStatus,
  ): Promise<ReviewDocument> {
    const updated = await this.reviewDao.updateStatus(reviewId, status);
    if (!updated) throw new NotFoundException('Review not found');
    await this.refreshBusinessRating(updated.businessId.toString());
    return updated;
  }

  async reportReview(
    reviewId: string,
    reason?: string,
  ): Promise<ReviewDocument> {
    const updated = await this.reviewDao.report(reviewId, reason);
    if (!updated) throw new NotFoundException('Review not found');
    return updated;
  }

  private async refreshBusinessRating(businessId: string): Promise<void> {
    const summary = await this.reviewDao.getPublishedSummary(businessId);
    await this.businessService.updateRatingSummary(businessId, summary);
  }
}
