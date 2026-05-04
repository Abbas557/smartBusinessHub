import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BusinessService } from '../business/business.service';
import { CustomersService } from '../customers/customers.service';
import { MailService } from '../mail/mail.service';
import { CustomerEventsService } from '../customer-events/customer-events.service';
import { CustomerEventType } from '../customer-events/customer-event.schema';
import {
  BookingDocument,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from './booking.schema';
import { BookingDao } from './dao/booking.dao';
import { CreateBookingDto, SlotQueryDto } from './dto/booking.dto';

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingDao: BookingDao,
    private readonly businessService: BusinessService,
    private readonly customersService: CustomersService,
    private readonly mailService: MailService,
    private readonly customerEventsService: CustomerEventsService,
  ) {}

  async createPublicBooking(dto: CreateBookingDto): Promise<BookingDocument> {
    return this.createBooking(dto);
  }

  async createCustomerBooking(
    customerUserId: string,
    dto: CreateBookingDto,
  ): Promise<BookingDocument> {
    return this.createBooking(dto, customerUserId);
  }

  private async createBooking(
    dto: CreateBookingDto,
    customerUserId?: string,
  ): Promise<BookingDocument> {
    const business = await this.businessService.getPublicProfileById(
      dto.businessId,
    );
    const service = business.services.find(
      (item) => item['_id'].toString() === dto.serviceId && item.isActive,
    );
    if (!service) throw new NotFoundException('Service not found');

    const bookingDate = this.parseDate(dto.date);
    const slots = await this.getSlots({
      businessId: dto.businessId,
      serviceId: dto.serviceId,
      date: dto.date,
    });
    const slot = slots.find((item) => item.startTime === dto.startTime);
    if (!slot?.available) {
      throw new BadRequestException('Selected time slot is unavailable');
    }

    const conflict = await this.bookingDao.findSlotConflict({
      businessId: dto.businessId,
      date: bookingDate,
      startTime: dto.startTime,
    });
    if (conflict) {
      throw new BadRequestException('Selected time slot is already booked');
    }

    const customer = await this.customersService.findOrCreateFromBooking({
      businessId: business.id,
      name: dto.customerName,
      email: dto.customerEmail,
      phone: dto.customerPhone,
      bookingDate,
    });

    const booking = await this.bookingDao.create({
      businessId: new Types.ObjectId(business.id) as any,
      customerId: new Types.ObjectId(customer.id) as any,
      customerUserId: customerUserId
        ? (new Types.ObjectId(customerUserId) as any)
        : null,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail.toLowerCase(),
      customerPhone: dto.customerPhone,
      serviceId: dto.serviceId,
      serviceName: service.name,
      servicePrice: service.price,
      date: bookingDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes: dto.notes,
      status: BookingStatus.PENDING,
      paymentMethod: dto.paymentMethod || PaymentMethod.PAY_LATER,
      paymentStatus:
        dto.paymentMethod === PaymentMethod.DEMO_CARD
          ? PaymentStatus.PENDING
          : PaymentStatus.UNPAID,
    });

    await this.businessService.incrementBookingCount(business.id);
    if (customerUserId) {
      await this.customerEventsService.recordSystemEvent(customerUserId, {
        eventType: CustomerEventType.BOOKING_CREATED,
        businessId: business.id,
        businessSlug: business.slug,
        serviceId: dto.serviceId,
        serviceName: service.name,
        category: business.category,
        city: business.city,
        area: business.area,
        pincode: business.pincode,
        metadata: {
          bookingId: booking.id,
          paymentMethod: booking.paymentMethod,
          servicePrice: booking.servicePrice,
        },
      });
    }
    await this.mailService.sendBookingConfirmation({ business, booking });
    return booking;
  }

  async findForOwner(ownerId: string): Promise<BookingDocument[]> {
    const business = await this.businessService.getMyBusiness(ownerId);
    return this.bookingDao.findByBusiness(business.id);
  }

  async findForCustomer(customerUserId: string): Promise<BookingDocument[]> {
    return this.bookingDao.findByCustomerUser(customerUserId);
  }

  async findAllForAdmin(): Promise<BookingDocument[]> {
    return this.bookingDao.findAll();
  }

  async findPublicById(bookingId: string): Promise<BookingDocument | null> {
    return this.bookingDao.findById(bookingId);
  }

  async cancelForCustomer(
    customerUserId: string,
    bookingId: string,
    reason?: string,
  ): Promise<BookingDocument> {
    const booking = await this.bookingDao.findByIdAndCustomerUser(
      bookingId,
      customerUserId,
    );
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === BookingStatus.CANCELLED) return booking;
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled');
    }

    const updated = await this.bookingDao.updateById(bookingId, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: reason,
    });
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async rescheduleForCustomer(
    customerUserId: string,
    bookingId: string,
    params: { date: string; startTime: string },
  ): Promise<BookingDocument> {
    const booking = await this.bookingDao.findByIdAndCustomerUser(
      bookingId,
      customerUserId,
    );
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cancelled bookings cannot be rescheduled');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be rescheduled');
    }

    const bookingDate = this.parseDate(params.date);
    const slots = await this.getSlots({
      businessId: booking.businessId.toString(),
      serviceId: booking.serviceId,
      date: params.date,
    });
    const slot = slots.find((item) => item.startTime === params.startTime);
    if (!slot?.available) {
      throw new BadRequestException('Selected time slot is unavailable');
    }

    const conflict = await this.bookingDao.findSlotConflict({
      businessId: booking.businessId.toString(),
      date: bookingDate,
      startTime: params.startTime,
    });
    if (conflict && conflict.id !== booking.id) {
      throw new BadRequestException('Selected time slot is already booked');
    }

    const updated = await this.bookingDao.updateById(bookingId, {
      date: bookingDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: BookingStatus.PENDING,
      rescheduledFrom: {
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
    });
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async findOneForOwner(
    ownerId: string,
    bookingId: string,
  ): Promise<BookingDocument> {
    const business = await this.businessService.getMyBusiness(ownerId);
    const booking = await this.bookingDao.findById(bookingId);
    if (!booking || booking.businessId.toString() !== business.id) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateStatusForOwner(
    ownerId: string,
    bookingId: string,
    status: BookingStatus,
  ): Promise<BookingDocument> {
    await this.findOneForOwner(ownerId, bookingId);
    const updated = await this.bookingDao.updateById(bookingId, { status });
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async markPaid(params: {
    bookingId: string;
    paymentId: string;
    paymentMethod: PaymentMethod;
  }): Promise<BookingDocument> {
    const updated = await this.bookingDao.updateById(params.bookingId, {
      paymentId: params.paymentId,
      paymentMethod: params.paymentMethod,
      paymentStatus: PaymentStatus.PAID,
    });
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async deleteForOwner(
    ownerId: string,
    bookingId: string,
  ): Promise<{ message: string }> {
    await this.findOneForOwner(ownerId, bookingId);
    await this.bookingDao.deleteById(bookingId);
    return { message: 'Booking deleted' };
  }

  async getSlots(query: SlotQueryDto) {
    const business = await this.businessService.getPublicProfileById(
      query.businessId,
    );
    const service = business.services.find(
      (item) => item['_id'].toString() === query.serviceId && item.isActive,
    );
    if (!service) throw new NotFoundException('Service not found');

    const date = this.parseDate(query.date);
    const dayHours = business.hours?.[DAY_KEYS[date.getDay()]];
    if (!dayHours || dayHours.isClosed) return [];

    const open = this.toMinutes(dayHours.open || '09:00');
    const close = this.toMinutes(dayHours.close || '18:00');
    const duration = service.durationMinutes;
    if (close <= open || duration <= 0) return [];

    const bookings = await this.bookingDao.findByBusinessAndDate(
      business.id,
      date,
    );
    const bookedIntervals = bookings.map((booking) => ({
      start: this.toMinutes(booking.startTime),
      end: this.toMinutes(booking.endTime),
    }));

    const slots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
    }> = [];

    for (let cursor = open; cursor + duration <= close; cursor += duration) {
      const startTime = this.fromMinutes(cursor);
      const end = cursor + duration;
      const hasOverlap = bookedIntervals.some(
        (booking) => cursor < booking.end && end > booking.start,
      );
      slots.push({
        startTime,
        endTime: this.fromMinutes(end),
        available: !hasOverlap,
      });
    }

    return slots;
  }

  private parseDate(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid booking date');
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private fromMinutes(value: number): string {
    const hours = Math.floor(value / 60).toString().padStart(2, '0');
    const minutes = (value % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
