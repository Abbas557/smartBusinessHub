import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../user.schema';

/**
 * UserDao — Data Access Object
 *
 * ALL Mongoose queries for the User collection live here.
 * Services never import Model<User> directly — they always go through the DAO.
 * This keeps business logic (service) completely decoupled from DB implementation.
 *
 * Pattern:
 *   Controller → Service (business logic) → DAO (DB queries) → MongoDB
 */
@Injectable()
export class UserDao {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── CREATE ────────────────────────────────────────────────────────────────

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  // ─── READ ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    // Explicitly select password field (it's hidden by default via select:false)
    return this.userModel.findById(id).select('+password +refreshToken').exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  async findByEmailWithRefreshToken(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+refreshToken')
      .exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findAll(filter: FilterQuery<UserDocument> = {}): Promise<UserDocument[]> {
    return this.userModel.find(filter).exec();
  }

  // ─── UPDATE ────────────────────────────────────────────────────────────────

  async updateById(
    id: string,
    update: UpdateQuery<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, update, { new: true }) // new:true returns updated doc
      .exec();
  }

  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    // null clears the token on logout
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedToken,
    });
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────

  async deleteById(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  // ─── UTILITIES ─────────────────────────────────────────────────────────────

  async exists(filter: FilterQuery<UserDocument>): Promise<boolean> {
    const doc = await this.userModel.exists(filter);
    return !!doc;
  }

  async count(filter: FilterQuery<UserDocument> = {}): Promise<number> {
    return this.userModel.countDocuments(filter).exec();
  }
}
