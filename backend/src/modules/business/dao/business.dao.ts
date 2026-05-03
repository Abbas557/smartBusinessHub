import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery, Types } from 'mongoose';
import { Business, BusinessDocument } from '../business.schema';

/**
 * BusinessDao — Data Access Object
 *
 * All Mongoose queries for the Business collection.
 * BusinessService uses this — never imports Model<Business> directly.
 */
@Injectable()
export class BusinessDao {
  constructor(
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
  ) {}

  // ─── CREATE ────────────────────────────────────────────────────────────────

  async create(data: Partial<Business>): Promise<BusinessDocument> {
    const business = new this.businessModel(data);
    return business.save();
  }

  // ─── READ ──────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<BusinessDocument | null> {
    return this.businessModel.findById(id).exec();
  }

  async findByOwnerId(ownerId: string): Promise<BusinessDocument | null> {
    const ownerFilter = Types.ObjectId.isValid(ownerId)
      ? { $in: [new Types.ObjectId(ownerId), ownerId] }
      : ownerId;

    return this.businessModel
      .findOne({ ownerId: ownerFilter })
      .exec();
  }

  async findBySlug(slug: string): Promise<BusinessDocument | null> {
    return this.businessModel.findOne({ slug }).exec();
  }

  // Public published businesses (for search / public pages)
  async findPublished(
    filter: FilterQuery<BusinessDocument> = {},
  ): Promise<BusinessDocument[]> {
    return this.businessModel
      .find({ ...filter, isPublished: true })
      .select('-ownerId') // Don't expose owner in public queries
      .sort({ totalBookings: -1, updatedAt: -1 })
      .exec();
  }

  async findPublishedNearby(params: {
    filter?: FilterQuery<BusinessDocument>;
    lat: number;
    lng: number;
    radiusKm: number;
  }): Promise<Array<BusinessDocument & { distanceMeters?: number; distanceKm?: number }>> {
    const maxDistanceMeters = params.radiusKm * 1000;

    return this.businessModel
      .aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [params.lng, params.lat],
            },
            distanceField: 'distanceMeters',
            spherical: true,
            maxDistance: maxDistanceMeters,
            query: {
              ...params.filter,
              isPublished: true,
              'location.coordinates': { $exists: true, $ne: [] },
            },
          },
        },
        {
          $match: {
            $expr: {
              $lte: [
                '$distanceMeters',
                { $multiply: [{ $ifNull: ['$serviceRadiusKm', 10] }, 1000] },
              ],
            },
          },
        },
        {
          $addFields: {
            distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
          },
        },
        {
          $project: {
            ownerId: 0,
            __v: 0,
          },
        },
        {
          $sort: {
            distanceMeters: 1,
            totalBookings: -1,
            updatedAt: -1,
          },
        },
      ])
      .exec();
  }

  async findAll(
    filter: FilterQuery<BusinessDocument> = {},
  ): Promise<BusinessDocument[]> {
    return this.businessModel.find(filter).exec();
  }

  // ─── UPDATE ────────────────────────────────────────────────────────────────

  async updateById(
    id: string,
    update: UpdateQuery<BusinessDocument>,
  ): Promise<BusinessDocument | null> {
    return this.businessModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
  }

  async updateByOwnerId(
    ownerId: string,
    update: UpdateQuery<BusinessDocument>,
  ): Promise<BusinessDocument | null> {
    const ownerFilter = Types.ObjectId.isValid(ownerId)
      ? { $in: [new Types.ObjectId(ownerId), ownerId] }
      : ownerId;

    return this.businessModel
      .findOneAndUpdate(
        { ownerId: ownerFilter },
        update,
        { new: true },
      )
      .exec();
  }

  // ─── SERVICES (embedded array operations) ──────────────────────────────────

  async addService(
    businessId: string,
    service: Partial<Business['services'][0]>,
  ): Promise<BusinessDocument | null> {
    return this.businessModel
      .findByIdAndUpdate(
        businessId,
        { $push: { services: service } },
        { new: true },
      )
      .exec();
  }

  async updateService(
    businessId: string,
    serviceId: string,
    update: Partial<Business['services'][0]>,
  ): Promise<BusinessDocument | null> {
    // Build dynamic $set for nested array element
    const setFields: Record<string, any> = {};
    Object.keys(update).forEach((key) => {
      setFields[`services.$.${key}`] = (update as any)[key];
    });

    return this.businessModel
      .findOneAndUpdate(
        { _id: businessId, 'services._id': new Types.ObjectId(serviceId) },
        { $set: setFields },
        { new: true },
      )
      .exec();
  }

  async removeService(
    businessId: string,
    serviceId: string,
  ): Promise<BusinessDocument | null> {
    return this.businessModel
      .findByIdAndUpdate(
        businessId,
        { $pull: { services: { _id: new Types.ObjectId(serviceId) } } },
        { new: true },
      )
      .exec();
  }

  // ─── UTILITIES ─────────────────────────────────────────────────────────────

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<BusinessDocument> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const doc = await this.businessModel.exists(filter);
    return !!doc;
  }

  async incrementBookingCount(businessId: string): Promise<void> {
    await this.businessModel.findByIdAndUpdate(businessId, {
      $inc: { totalBookings: 1 },
    });
  }

  async updateRatingSummary(
    businessId: string,
    summary: { averageRating: number; reviewCount: number },
  ): Promise<void> {
    await this.businessModel.findByIdAndUpdate(businessId, {
      $set: summary,
    });
  }

  async deleteByOwnerId(ownerId: string): Promise<void> {
    const ownerFilter = Types.ObjectId.isValid(ownerId)
      ? { $in: [new Types.ObjectId(ownerId), ownerId] }
      : ownerId;

    await this.businessModel.deleteOne({
      ownerId: ownerFilter,
    });
  }
}
