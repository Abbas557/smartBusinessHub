import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../bookings/booking.schema';

export type PaymentDocument = Payment & Document;

export enum PaymentProvider {
  DEMO = 'demo',
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
}

@Schema({
  timestamps: true,
  collection: 'payments',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true, index: true })
  bookingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ type: String, enum: PaymentProvider, default: PaymentProvider.DEMO })
  provider: PaymentProvider;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: String, enum: PaymentMethod, default: PaymentMethod.DEMO_CARD })
  method: PaymentMethod;

  @Prop({ required: true, trim: true })
  reference: string;

  @Prop({ default: null, trim: true })
  providerPaymentId: string;

  @Prop({ default: null, trim: true })
  providerSignature: string;

  id: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ businessId: 1, status: 1, createdAt: -1 });
