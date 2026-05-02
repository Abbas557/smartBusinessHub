import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  CUSTOMER = 'CUSTOMER',
}

@Schema({
  timestamps: true,         // Adds createdAt and updatedAt automatically
  collection: 'users',
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  // select: false — never returned in queries unless explicitly requested
  // This prevents password leaking in any findOne/findAll accidentally
  @Prop({ select: false })
  password: string;

  @Prop({
    type: String,
    enum: Role,
    default: Role.BUSINESS_OWNER,
  })
  role: Role;

  // Populated when user signs in with Google OAuth
  @Prop({ sparse: true })
  googleId: string;

  @Prop({ default: null })
  avatarUrl: string;

  // Hashed refresh token stored for validation — select: false for security
  @Prop({ select: false, default: null })
  refreshToken: string;

  @Prop({ default: true })
  isActive: boolean;

  // Virtual: id from _id (string form)
  id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { sparse: true });
