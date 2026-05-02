import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PaymentMethod,
  PaymentStatus,
} from '../bookings/booking.schema';
import { BookingsService } from '../bookings/bookings.service';
import { Payment, PaymentDocument, PaymentProvider } from './payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly bookingsService: BookingsService,
  ) {}

  async createDemoPayment(params: {
    bookingId: string;
    method?: PaymentMethod;
  }): Promise<{ payment: PaymentDocument; checkoutMode: string }> {
    const booking = await this.bookingsService.findPublicById(params.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking is already paid');
    }

    const method = params.method || PaymentMethod.DEMO_CARD;
    const payment = await new this.paymentModel({
      bookingId: new Types.ObjectId(booking.id),
      businessId: booking.businessId,
      amount: booking.servicePrice || 0,
      currency: 'INR',
      provider: PaymentProvider.DEMO,
      status: PaymentStatus.PAID,
      method,
      reference: `DEMO-${Date.now()}-${booking.id.slice(-6)}`,
    }).save();

    await this.bookingsService.markPaid({
      bookingId: booking.id,
      paymentId: payment.id,
      paymentMethod: method,
    });

    return { payment, checkoutMode: 'demo' };
  }
}
