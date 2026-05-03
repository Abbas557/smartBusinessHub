import { Injectable } from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { BusinessService } from '../business/business.service';
import { PaymentsService } from '../payments/payments.service';
import { ReviewsService } from '../reviews/reviews.service';
import { ReviewStatus } from '../reviews/review.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly businessService: BusinessService,
    private readonly bookingsService: BookingsService,
    private readonly paymentsService: PaymentsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  async getOverview() {
    const [users, businesses, bookings, payments, reviews] = await Promise.all([
      this.usersService.findAllForAdmin(),
      this.businessService.listAllForAdmin(),
      this.bookingsService.findAllForAdmin(),
      this.paymentsService.findAllForAdmin(),
      this.reviewsService.findAllForAdmin(),
    ]);

    return {
      users: users.length,
      businesses: businesses.length,
      bookings: bookings.length,
      payments: payments.length,
      reviews: reviews.length,
      verifiedBusinesses: businesses.filter((business) => business.isVerified)
        .length,
      hiddenReviews: reviews.filter(
        (review) => review.status === ReviewStatus.HIDDEN,
      ).length,
    };
  }

  findUsers() {
    return this.usersService.findAllForAdmin();
  }

  findBusinesses() {
    return this.businessService.listAllForAdmin();
  }

  findBookings() {
    return this.bookingsService.findAllForAdmin();
  }

  findPayments() {
    return this.paymentsService.findAllForAdmin();
  }

  findReviews() {
    return this.reviewsService.findAllForAdmin();
  }

  verifyBusiness(businessId: string, isVerified: boolean) {
    return this.businessService.setVerificationForAdmin(
      businessId,
      isVerified,
    );
  }

  setReviewStatus(reviewId: string, status: ReviewStatus) {
    return this.reviewsService.setStatusForAdmin(reviewId, status);
  }
}
