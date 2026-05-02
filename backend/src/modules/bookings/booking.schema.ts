import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({
  timestamps: true,
  collection: 'bookings',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', default: null, index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  customerName: string;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  customerEmail: string;

  @Prop({ trim: true })
  customerPhone: string;

  @Prop({ required: true })
  serviceId: string;

  @Prop({ required: true, trim: true })
  serviceName: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING,
    index: true,
  })
  status: BookingStatus;

  @Prop({ trim: true, maxlength: 500 })
  notes: string;

  id: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ businessId: 1, date: 1, startTime: 1 });
BookingSchema.index({ businessId: 1, status: 1, date: 1 });
