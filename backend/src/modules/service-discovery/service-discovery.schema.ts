import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BusinessCategory } from '../business/business.schema';

export type ServiceCategoryDocument = ServiceCategory & Document;
export type ServiceCollectionDocument = ServiceCollection & Document;

@Schema({
  timestamps: true,
  collection: 'service_categories',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class ServiceCategory {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ type: String, enum: BusinessCategory, required: true, index: true })
  businessCategory: BusinessCategory;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  icon: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

@Schema({
  timestamps: true,
  collection: 'service_collections',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class ServiceCollection {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ trim: true })
  subtitle: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  icon: string;

  @Prop({ type: [String], enum: BusinessCategory, default: [], index: true })
  categories: BusinessCategory[];

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ default: 'rose' })
  accent: string;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ default: true, index: true })
  isFeatured: boolean;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const ServiceCategorySchema = SchemaFactory.createForClass(ServiceCategory);
export const ServiceCollectionSchema = SchemaFactory.createForClass(ServiceCollection);

ServiceCategorySchema.index({ displayOrder: 1, name: 1 });
ServiceCollectionSchema.index({ displayOrder: 1, title: 1 });
