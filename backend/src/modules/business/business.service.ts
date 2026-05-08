import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import slugify from 'slugify';
import { BusinessDao } from './dao/business.dao';
import {
  CreateBusinessDto,
  UpdateBusinessDto,
  CreateServiceDto,
  UpdateServiceDto,
  BusinessHoursDto,
} from './dto/business.dto';
import { BusinessDocument } from './business.schema';

@Injectable()
export class BusinessService {
  constructor(private readonly businessDao: BusinessDao) {}

  // ─── CREATE BUSINESS ───────────────────────────────────────────────────────

  async create(
    ownerId: string,
    dto: CreateBusinessDto,
  ): Promise<BusinessDocument> {
    // One business per owner
    const existing = await this.businessDao.findByOwnerId(ownerId);
    if (existing) {
      throw new ConflictException(
        'You already have a business. Update it instead.',
      );
    }

    const slug = await this.generateUniqueSlug(dto.name);
    const data = this.prepareBusinessPayload(dto);

    return this.businessDao.create({
      ownerId: new Types.ObjectId(ownerId) as any,
      slug,
      ...data,
    });
  }

  // ─── GET MY BUSINESS ───────────────────────────────────────────────────────

  async getMyBusiness(ownerId: string): Promise<BusinessDocument> {
    const business = await this.businessDao.findByOwnerId(ownerId);
    if (!business) {
      throw new NotFoundException(
        'No business found. Create one to get started.',
      );
    }
    return business;
  }

  // ─── UPDATE BUSINESS ───────────────────────────────────────────────────────

  async updateMyBusiness(
    ownerId: string,
    dto: UpdateBusinessDto,
  ): Promise<BusinessDocument> {
    const business = await this.businessDao.findByOwnerId(ownerId);
    if (!business) throw new NotFoundException('Business not found');

    const updated = await this.businessDao.updateByOwnerId(
      ownerId,
      this.prepareBusinessPayload(dto),
    );
    return updated;
  }

  // ─── PUBLIC PROFILE ────────────────────────────────────────────────────────

  async getPublicProfile(slug: string): Promise<BusinessDocument> {
    const business = await this.businessDao.findBySlug(slug);
    if (!business || !business.isPublished) {
      throw new NotFoundException('Business not found or not yet published');
    }
    return business;
  }

  async listPublicProfiles(query: {
    search?: string;
    category?: string;
    city?: string;
    area?: string;
    pincode?: string;
    placeId?: string;
    lat?: string;
    lng?: string;
    radiusKm?: string;
    sort?: string;
  }): Promise<BusinessDocument[]> {
    const filter: Record<string, any> = {};

    if (query.category && query.category !== 'all') {
      const categories = query.category
        .split(',')
        .map((category) => category.trim())
        .filter(Boolean);

      if (categories.length > 1) {
        filter.category = { $in: categories };
      } else if (categories.length === 1) {
        filter.category = categories[0];
      }
    }

    if (query.city) {
      filter.city = { $regex: query.city, $options: 'i' };
    }

    if (query.area) {
      filter.area = { $regex: query.area, $options: 'i' };
    }

    if (query.pincode) {
      filter.pincode = query.pincode;
    }

    if (query.search) {
      const search = { $regex: query.search, $options: 'i' };
      filter.$or = [
        { name: search },
        { description: search },
        { city: search },
        { area: search },
        { 'services.name': search },
        { 'services.description': search },
      ];
    }

    const lat = this.parseCoordinate(query.lat);
    const lng = this.parseCoordinate(query.lng);
    const sort = this.parsePublicSort(query.sort);
    if (lat !== null && lng !== null) {
      return this.businessDao.findPublishedNearby({
        filter,
        lat,
        lng,
        radiusKm: this.parseRadiusKm(query.radiusKm),
        sort,
      }) as any;
    }

    return this.businessDao.findPublished(
      filter,
      sort === 'nearest' ? 'most-booked' : sort,
    );
  }

  async getPublicProfileById(id: string): Promise<BusinessDocument> {
    const business = await this.businessDao.findById(id);
    if (!business || !business.isPublished) {
      throw new NotFoundException('Business not found or not yet published');
    }
    return business;
  }

  // ─── PUBLISH / UNPUBLISH ───────────────────────────────────────────────────

  async togglePublish(
    ownerId: string,
    publish: boolean,
  ): Promise<BusinessDocument> {
    const business = await this.businessDao.findByOwnerId(ownerId);
    if (!business) throw new NotFoundException('Business not found');

    // Require at least one service before publishing
    if (publish && business.services.length === 0) {
      throw new BadRequestException(
        'Add at least one service before publishing your profile',
      );
    }

    return this.businessDao.updateByOwnerId(ownerId, { isPublished: publish });
  }

  // ─── SERVICES ──────────────────────────────────────────────────────────────

  async addService(
    ownerId: string,
    dto: CreateServiceDto,
  ): Promise<BusinessDocument> {
    const business = await this.businessDao.findByOwnerId(ownerId);
    if (!business) throw new NotFoundException('Business not found');

    return this.businessDao.addService(business.id, dto);
  }

  async updateService(
    ownerId: string,
    serviceId: string,
    dto: UpdateServiceDto,
  ): Promise<BusinessDocument> {
    const business = await this.businessDao.findByOwnerId(ownerId);
    if (!business) throw new NotFoundException('Business not found');

    // Verify service belongs to this business
    const serviceExists = business.services.some(
      (s) => s['_id'].toString() === serviceId,
    );
    if (!serviceExists) throw new NotFoundException('Service not found');

    return this.businessDao.updateService(business.id, serviceId, dto);
  }

  async removeService(
    ownerId: string,
    serviceId: string,
  ): Promise<BusinessDocument> {
    const business = await this.businessDao.findByOwnerId(ownerId);
    if (!business) throw new NotFoundException('Business not found');

    return this.businessDao.removeService(business.id, serviceId);
  }

  async incrementBookingCount(businessId: string): Promise<void> {
    await this.businessDao.incrementBookingCount(businessId);
  }

  async updateRatingSummary(
    businessId: string,
    summary: { averageRating: number; reviewCount: number },
  ): Promise<void> {
    await this.businessDao.updateRatingSummary(businessId, summary);
  }

  async listAllForAdmin(): Promise<BusinessDocument[]> {
    return this.businessDao.findAll();
  }

  async setVerificationForAdmin(
    businessId: string,
    isVerified: boolean,
  ): Promise<BusinessDocument> {
    const updated = await this.businessDao.setVerification(
      businessId,
      isVerified,
    );
    if (!updated) throw new NotFoundException('Business not found');
    return updated;
  }

  // ─── HOURS ─────────────────────────────────────────────────────────────────

  async updateHours(
    ownerId: string,
    dto: BusinessHoursDto,
  ): Promise<BusinessDocument> {
    const business = await this.businessDao.findByOwnerId(ownerId);
    if (!business) throw new NotFoundException('Business not found');

    // Build nested $set update — only update days that were provided
    const hoursUpdate: Record<string, any> = {};
    Object.keys(dto).forEach((day) => {
      const dayData = (dto as any)[day];
      Object.keys(dayData).forEach((field) => {
        hoursUpdate[`hours.${day}.${field}`] = dayData[field];
      });
    });

    return this.businessDao.updateByOwnerId(ownerId, { $set: hoursUpdate });
  }

  // ─── SLUG HELPERS ──────────────────────────────────────────────────────────

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name, { lower: true, strict: true, trim: true });
    let slug = base;
    let counter = 1;

    // Append number if slug already exists: "priya-salon" → "priya-salon-2"
    while (await this.businessDao.slugExists(slug)) {
      slug = `${base}-${counter}`;
      counter++;
    }

    return slug;
  }

  private prepareBusinessPayload<
    T extends CreateBusinessDto | UpdateBusinessDto,
  >(dto: T) {
    const { location, ...rest } = dto;
    if (!location) return rest;

    return {
      ...rest,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
    };
  }

  private parseCoordinate(value?: string): number | null {
    if (value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseRadiusKm(value?: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 25;
    return Math.min(Math.max(parsed, 1), 100);
  }

  private parsePublicSort(
    value?: string,
  ): 'nearest' | 'top-rated' | 'most-booked' {
    if (value === 'top-rated' || value === 'most-booked' || value === 'nearest') {
      return value;
    }
    return 'nearest';
  }
}
