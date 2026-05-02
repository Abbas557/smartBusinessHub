import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { Customer, CustomerDocument } from '../customer.schema';

@Injectable()
export class CustomerDao {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async create(data: Partial<Customer>): Promise<CustomerDocument> {
    const customer = new this.customerModel(data);
    return customer.save();
  }

  async findById(id: string): Promise<CustomerDocument | null> {
    return this.customerModel.findById(id).exec();
  }

  async findByBusiness(
    businessId: string,
    filter: FilterQuery<CustomerDocument> = {},
  ): Promise<CustomerDocument[]> {
    return this.customerModel
      .find({ ...filter, businessId: new Types.ObjectId(businessId) })
      .sort({ lastBookingDate: -1, createdAt: -1 })
      .exec();
  }

  async findByBusinessAndEmail(
    businessId: string,
    email: string,
  ): Promise<CustomerDocument | null> {
    return this.customerModel
      .findOne({
        businessId: new Types.ObjectId(businessId),
        email: email.toLowerCase(),
      })
      .exec();
  }

  async updateById(
    id: string,
    update: UpdateQuery<CustomerDocument>,
  ): Promise<CustomerDocument | null> {
    return this.customerModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  async touchBookingStats(
    id: string,
    bookingDate: Date,
  ): Promise<CustomerDocument | null> {
    return this.customerModel
      .findByIdAndUpdate(
        id,
        {
          $inc: { totalBookings: 1 },
          $set: { lastBookingDate: bookingDate },
        },
        { new: true },
      )
      .exec();
  }
}
