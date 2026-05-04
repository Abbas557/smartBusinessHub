import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { TrackCustomerEventDto } from './dto/customer-event.dto';
import { CustomerEventDao } from './dao/customer-event.dao';
import { CustomerEventDocument } from './customer-event.schema';

@Injectable()
export class CustomerEventsService {
  constructor(private readonly customerEventDao: CustomerEventDao) {}

  async trackPublicEvent(dto: TrackCustomerEventDto): Promise<CustomerEventDocument> {
    return this.trackEvent(null, dto);
  }

  async trackUserEvent(
    userId: string,
    dto: TrackCustomerEventDto,
  ): Promise<CustomerEventDocument> {
    return this.trackEvent(userId, dto);
  }

  async recordSystemEvent(
    userId: string | null,
    dto: TrackCustomerEventDto,
  ): Promise<void> {
    await this.trackEvent(userId, dto);
  }

  private trackEvent(
    userId: string | null,
    dto: TrackCustomerEventDto,
  ): Promise<CustomerEventDocument> {
    return this.customerEventDao.create({
      userId: userId ? (new Types.ObjectId(userId) as any) : null,
      sessionId: dto.sessionId,
      eventType: dto.eventType,
      businessId: dto.businessId
        ? (new Types.ObjectId(dto.businessId) as any)
        : null,
      businessSlug: dto.businessSlug,
      serviceId: dto.serviceId,
      serviceName: dto.serviceName,
      category: dto.category || null,
      collectionSlug: dto.collectionSlug,
      query: dto.query,
      city: dto.city,
      area: dto.area,
      pincode: dto.pincode,
      location: dto.location
        ? {
            type: 'Point',
            coordinates: [dto.location.lng, dto.location.lat],
          }
        : undefined,
      metadata: dto.metadata || {},
    });
  }
}
