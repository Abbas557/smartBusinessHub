import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomerEvent, CustomerEventDocument } from '../customer-event.schema';

@Injectable()
export class CustomerEventDao {
  constructor(
    @InjectModel(CustomerEvent.name)
    private readonly customerEventModel: Model<CustomerEventDocument>,
  ) {}

  async create(data: Partial<CustomerEvent>): Promise<CustomerEventDocument> {
    const event = new this.customerEventModel(data);
    return event.save();
  }

  async findRecentForUser(
    userId: string,
    limit = 50,
  ): Promise<CustomerEventDocument[]> {
    return this.customerEventModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findRecentForSession(
    sessionId: string,
    limit = 50,
  ): Promise<CustomerEventDocument[]> {
    if (!sessionId) return [];
    return this.customerEventModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findRecentSignals(params: {
    userId?: string;
    sessionId?: string;
    limit?: number;
  }): Promise<CustomerEventDocument[]> {
    const filters = [];
    if (params.userId && Types.ObjectId.isValid(params.userId)) {
      filters.push({ userId: new Types.ObjectId(params.userId) });
    }
    if (params.sessionId) filters.push({ sessionId: params.sessionId });
    if (filters.length === 0) return [];

    return this.customerEventModel
      .find({ $or: filters })
      .sort({ createdAt: -1 })
      .limit(params.limit || 80)
      .exec();
  }

  async findTrendingBusinessIds(params: {
    city?: string;
    area?: string;
    pincode?: string;
    limit?: number;
  }): Promise<string[]> {
    const match: Record<string, any> = {
      businessId: { $ne: null },
      createdAt: {
        $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
    };

    if (params.city) match.city = { $regex: params.city, $options: 'i' };
    if (params.area) match.area = { $regex: params.area, $options: 'i' };
    if (params.pincode) match.pincode = params.pincode;

    const rows = await this.customerEventModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$businessId',
            score: {
              $sum: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$eventType', 'booking_created'] }, then: 8 },
                    { case: { $eq: ['$eventType', 'booking_intent'] }, then: 5 },
                    { case: { $eq: ['$eventType', 'save_business'] }, then: 4 },
                    { case: { $eq: ['$eventType', 'view_business'] }, then: 2 },
                  ],
                  default: 1,
                },
              },
            },
            latest: { $max: '$createdAt' },
          },
        },
        { $sort: { score: -1, latest: -1 } },
        { $limit: params.limit || 12 },
      ])
      .exec();

    return rows.map((row) => row._id.toString());
  }
}
