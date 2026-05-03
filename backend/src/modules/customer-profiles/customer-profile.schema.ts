import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerProfileDocument = CustomerProfile & Document;

@Schema({
  timestamps: true,
  collection: 'customer_profiles',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class CustomerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ trim: true })
  phone: string;

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

  @Prop({
    type: [
      {
        label: String,
        address: String,
        city: String,
        area: String,
        pincode: String,
      },
    ],
    default: [],
  })
  savedAddresses: Array<{
    label?: string;
    address?: string;
    city?: string;
    area?: string;
    pincode?: string;
  }>;

  id: string;
}

export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);

CustomerProfileSchema.index({ userId: 1 }, { unique: true });
CustomerProfileSchema.index({ city: 1, area: 1, pincode: 1 });
CustomerProfileSchema.index({ location: '2dsphere' });
