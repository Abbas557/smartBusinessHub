import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BusinessService } from '../business/business.service';
import { CustomerDao } from './dao/customer.dao';
import { CustomerDocument } from './customer.schema';
import { UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customerDao: CustomerDao,
    private readonly businessService: BusinessService,
  ) {}

  async findForOwner(ownerId: string): Promise<CustomerDocument[]> {
    const business = await this.businessService.getMyBusiness(ownerId);
    return this.customerDao.findByBusiness(business.id);
  }

  async findOneForOwner(
    ownerId: string,
    customerId: string,
  ): Promise<CustomerDocument> {
    const business = await this.businessService.getMyBusiness(ownerId);
    const customer = await this.customerDao.findById(customerId);
    if (!customer || customer.businessId.toString() !== business.id) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async updateForOwner(
    ownerId: string,
    customerId: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerDocument> {
    await this.findOneForOwner(ownerId, customerId);
    const updated = await this.customerDao.updateById(customerId, dto);
    if (!updated) throw new NotFoundException('Customer not found');
    return updated;
  }

  async findOrCreateFromBooking(data: {
    businessId: string;
    name: string;
    email: string;
    phone?: string;
    bookingDate: Date;
  }): Promise<CustomerDocument> {
    const existing = await this.customerDao.findByBusinessAndEmail(
      data.businessId,
      data.email,
    );

    if (existing) {
      await this.customerDao.updateById(existing.id, {
        name: data.name,
        phone: data.phone || existing.phone,
      });
      const touched = await this.customerDao.touchBookingStats(
        existing.id,
        data.bookingDate,
      );
      return touched || existing;
    }

    const customer = await this.customerDao.create({
      businessId: new Types.ObjectId(data.businessId) as any,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      totalBookings: 0,
      lastBookingDate: data.bookingDate,
    });

    const touched = await this.customerDao.touchBookingStats(
      customer.id,
      data.bookingDate,
    );
    return touched || customer;
  }
}
