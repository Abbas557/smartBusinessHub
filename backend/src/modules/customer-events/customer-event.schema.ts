import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BusinessCategory } from '../business/business.schema';

export type CustomerEventDocument = CustomerEvent & Document;

export enum CustomerEventType {
  SEARCH = 'search',
  VIEW_BUSINESS = 'view_business',
  CLICK_COLLECTION = 'click_collection',
  CLICK_CATEGORY = 'click_category',
  SAVE_BUSINESS = 'save_business',
  UNSAVE_BUSINESS = 'unsave_business',
  BOOKING_INTENT = 'booking_intent',
  BOOKING_CREATED = 'booking_created',
}

@Schema({
  timestamps: true,
  collection: 'customer_events',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class CustomerEvent {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  userId: Types.ObjectId | null;

  @Prop({ trim: true, index: true })
  sessionId: string;

  @Prop({ type: String, enum: CustomerEventType, required: true, index: true })
  eventType: CustomerEventType;

  @Prop({ type: Types.ObjectId, ref: 'Business', default: null, index: true })
  businessId: Types.ObjectId | null;

  @Prop({ trim: true })
  businessSlug: string;

  @Prop({ trim: true })
  serviceId: string;

  @Prop({ trim: true })
  serviceName: string;

  @Prop({ type: String, enum: BusinessCategory, default: null, index: true })
  category: BusinessCategory | null;

  @Prop({ trim: true, index: true })
  collectionSlug: string;

  @Prop({ trim: true })
  query: string;

  @Prop({ trim: true, index: true })
  city: string;

  @Prop({ trim: true, index: true })
  area: string;

  @Prop({ trim: true, index: true })
  pincode: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      default: undefined,
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const CustomerEventSchema = SchemaFactory.createForClass(CustomerEvent);

CustomerEventSchema.index({ createdAt: -1 });
CustomerEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
CustomerEventSchema.index({ sessionId: 1, createdAt: -1 });
CustomerEventSchema.index({ location: '2dsphere' });
