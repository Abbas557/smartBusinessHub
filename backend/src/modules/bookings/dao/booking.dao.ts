import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from '../booking.schema';

@Injectable()
export class BookingDao {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async create(data: Partial<Booking>): Promise<BookingDocument> {
    const booking = new this.bookingModel(data);
    return booking.save();
  }

  async findById(id: string): Promise<BookingDocument | null> {
    return this.bookingModel.findById(id).exec();
  }

  async findByBusiness(businessId: string): Promise<BookingDocument[]> {
    return this.bookingModel
      .find({ businessId: new Types.ObjectId(businessId) })
      .sort({ date: 1, startTime: 1 })
      .exec();
  }

  async findByBusinessAndDate(
    businessId: string,
    date: Date,
  ): Promise<BookingDocument[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return this.bookingModel
      .find({
        businessId: new Types.ObjectId(businessId),
        date: { $gte: start, $lt: end },
        status: { $ne: BookingStatus.CANCELLED },
      })
      .sort({ startTime: 1 })
      .exec();
  }

  async findSlotConflict(params: {
    businessId: string;
    date: Date;
    startTime: string;
  }): Promise<BookingDocument | null> {
    const start = new Date(params.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return this.bookingModel
      .findOne({
        businessId: new Types.ObjectId(params.businessId),
        date: { $gte: start, $lt: end },
        startTime: params.startTime,
        status: { $ne: BookingStatus.CANCELLED },
      })
      .exec();
  }

  async updateById(
    id: string,
    update: UpdateQuery<BookingDocument>,
  ): Promise<BookingDocument | null> {
    return this.bookingModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  async deleteById(id: string): Promise<BookingDocument | null> {
    return this.bookingModel.findByIdAndDelete(id).exec();
  }
}
