import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

export enum ReviewStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}

@Schema({
  timestamps: true,
  collection: 'reviews',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true, index: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  customerUserId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true, unique: true })
  bookingId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  customerName: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true, maxlength: 700 })
  comment: string;

  @Prop({
    type: String,
    enum: ReviewStatus,
    default: ReviewStatus.PUBLISHED,
    index: true,
  })
  status: ReviewStatus;

  id: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ businessId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ customerUserId: 1, createdAt: -1 });
