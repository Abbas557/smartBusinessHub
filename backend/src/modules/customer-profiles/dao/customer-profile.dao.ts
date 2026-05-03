import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../customer-profile.schema';

@Injectable()
export class CustomerProfileDao {
  constructor(
    @InjectModel(CustomerProfile.name)
    private readonly customerProfileModel: Model<CustomerProfileDocument>,
  ) {}

  async create(data: Partial<CustomerProfile>): Promise<CustomerProfileDocument> {
    const profile = new this.customerProfileModel(data);
    return profile.save();
  }

  async findByUserId(userId: string): Promise<CustomerProfileDocument | null> {
    return this.customerProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async updateByUserId(
    userId: string,
    update: UpdateQuery<CustomerProfileDocument>,
  ): Promise<CustomerProfileDocument | null> {
    return this.customerProfileModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        update,
        { new: true },
      )
      .exec();
  }

  async addSavedBusiness(
    userId: string,
    businessId: string,
  ): Promise<CustomerProfileDocument | null> {
    return this.customerProfileModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $addToSet: { savedBusinessIds: new Types.ObjectId(businessId) } },
        { new: true },
      )
      .exec();
  }

  async removeSavedBusiness(
    userId: string,
    businessId: string,
  ): Promise<CustomerProfileDocument | null> {
    return this.customerProfileModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $pull: { savedBusinessIds: new Types.ObjectId(businessId) } },
        { new: true },
      )
      .exec();
  }
}
