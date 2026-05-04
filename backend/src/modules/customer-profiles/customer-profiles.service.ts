import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CustomerProfileDocument } from './customer-profile.schema';
import { CustomerProfileDao } from './dao/customer-profile.dao';
import {
  CustomerEventsService,
} from '../customer-events/customer-events.service';
import { CustomerEventType } from '../customer-events/customer-event.schema';
import {
  CreateCustomerProfileDto,
  UpdateCustomerProfileDto,
} from './dto/customer-profile.dto';

@Injectable()
export class CustomerProfilesService {
  constructor(
    private readonly customerProfileDao: CustomerProfileDao,
    private readonly customerEventsService: CustomerEventsService,
  ) {}

  async createForUser(
    userId: string,
    dto: CreateCustomerProfileDto,
  ): Promise<CustomerProfileDocument> {
    return this.customerProfileDao.create({
      userId: new Types.ObjectId(userId) as any,
      ...this.prepareProfilePayload(dto),
    });
  }

  async getMyProfile(userId: string): Promise<CustomerProfileDocument> {
    const profile = await this.customerProfileDao.findByUserId(userId);
    if (!profile) throw new NotFoundException('Customer profile not found');
    return profile;
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileDocument> {
    const updated = await this.customerProfileDao.updateByUserId(
      userId,
      this.prepareProfilePayload(dto),
    );
    if (!updated) throw new NotFoundException('Customer profile not found');
    return updated;
  }

  async saveBusiness(
    userId: string,
    businessId: string,
  ): Promise<CustomerProfileDocument> {
    const updated = await this.customerProfileDao.addSavedBusiness(
      userId,
      businessId,
    );
    if (!updated) throw new NotFoundException('Customer profile not found');
    await this.customerEventsService.recordSystemEvent(userId, {
      eventType: CustomerEventType.SAVE_BUSINESS,
      businessId,
    });
    return updated;
  }

  async unsaveBusiness(
    userId: string,
    businessId: string,
  ): Promise<CustomerProfileDocument> {
    const updated = await this.customerProfileDao.removeSavedBusiness(
      userId,
      businessId,
    );
    if (!updated) throw new NotFoundException('Customer profile not found');
    await this.customerEventsService.recordSystemEvent(userId, {
      eventType: CustomerEventType.UNSAVE_BUSINESS,
      businessId,
    });
    return updated;
  }

  private prepareProfilePayload<
    T extends CreateCustomerProfileDto | UpdateCustomerProfileDto,
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
}
