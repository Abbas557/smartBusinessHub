import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BusinessDocument = Business & Document;

// ─── Embedded: Service ────────────────────────────────────────────────────────

@Schema({ _id: true })
export class Service {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 5, max: 480 })
  durationMinutes: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: true })
  isActive: boolean;
}
export const ServiceSchema = SchemaFactory.createForClass(Service);

// ─── Embedded: DayHours ───────────────────────────────────────────────────────

@Schema({ _id: false })
export class DayHours {
  @Prop({ default: '09:00' })
  open: string;  // "09:00"

  @Prop({ default: '18:00' })
  close: string; // "18:00"

  @Prop({ default: false })
  isClosed: boolean;
}
export const DayHoursSchema = SchemaFactory.createForClass(DayHours);

// ─── Embedded: BusinessHours ──────────────────────────────────────────────────

@Schema({ _id: false })
export class BusinessHours {
  @Prop({ type: DayHoursSchema, default: () => ({}) }) monday: DayHours;
  @Prop({ type: DayHoursSchema, default: () => ({}) }) tuesday: DayHours;
  @Prop({ type: DayHoursSchema, default: () => ({}) }) wednesday: DayHours;
  @Prop({ type: DayHoursSchema, default: () => ({}) }) thursday: DayHours;
  @Prop({ type: DayHoursSchema, default: () => ({}) }) friday: DayHours;
  @Prop({ type: DayHoursSchema, default: () => ({ isClosed: true }) }) saturday: DayHours;
  @Prop({ type: DayHoursSchema, default: () => ({ isClosed: true }) }) sunday: DayHours;
}
export const BusinessHoursSchema = SchemaFactory.createForClass(BusinessHours);

// ─── Main: Business ────────────────────────────────────────────────────────────

export enum BusinessCategory {
  SALON = 'salon',
  GYM = 'gym',
  RESTAURANT = 'restaurant',
  CLINIC = 'clinic',
  REPAIR = 'repair',
  TUITION = 'tuition',
  OTHER = 'other',
}

@Schema({
  timestamps: true,
  collection: 'businesses',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Business {
  // Owner reference — every query filters by this for tenant isolation
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  ownerId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  // URL-friendly identifier: "priya-salon", "raj-gym"
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ type: String, enum: BusinessCategory, default: BusinessCategory.OTHER })
  category: BusinessCategory;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ default: null })
  logoUrl: string;   // AWS S3 / CloudFront URL

  @Prop({ default: null })
  bannerUrl: string; // AWS S3 / CloudFront URL

  @Prop({ type: [ServiceSchema], default: [] })
  services: Service[];

  @Prop({ type: BusinessHoursSchema, default: () => ({}) })
  hours: BusinessHours;

  @Prop({ default: false })
  isPublished: boolean; // false = draft, true = public profile live

  @Prop({ default: 0 })
  totalBookings: number;

  id: string;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);

// Compound index: fast lookup of a user's business
BusinessSchema.index({ ownerId: 1, slug: 1 });
