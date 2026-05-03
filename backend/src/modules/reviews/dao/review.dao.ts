import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument, ReviewStatus } from '../review.schema';

@Injectable()
export class ReviewDao {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async create(data: Partial<Review>): Promise<ReviewDocument> {
    const review = new this.reviewModel(data);
    return review.save();
  }

  async findByBooking(bookingId: string): Promise<ReviewDocument | null> {
    return this.reviewModel
      .findOne({ bookingId: new Types.ObjectId(bookingId) })
      .exec();
  }

  async findByCustomer(customerUserId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ customerUserId: new Types.ObjectId(customerUserId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPublishedByBusiness(businessId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({
        businessId: new Types.ObjectId(businessId),
        status: ReviewStatus.PUBLISHED,
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async getPublishedSummary(
    businessId: string,
  ): Promise<{ averageRating: number; reviewCount: number }> {
    const [summary] = await this.reviewModel.aggregate([
      {
        $match: {
          businessId: new Types.ObjectId(businessId),
          status: ReviewStatus.PUBLISHED,
        },
      },
      {
        $group: {
          _id: '$businessId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (!summary) return { averageRating: 0, reviewCount: 0 };

    return {
      averageRating: Math.round(summary.averageRating * 10) / 10,
      reviewCount: summary.reviewCount,
    };
  }
}
