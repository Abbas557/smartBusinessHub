import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHmac, timingSafeEqual } from 'crypto';
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
    private readonly configService: ConfigService,
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

  async findAllForAdmin(): Promise<PaymentDocument[]> {
    return this.paymentModel.find().sort({ createdAt: -1 }).exec();
  }

  async createRazorpayOrder(params: {
    bookingId: string;
  }): Promise<{
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
    bookingId: string;
  }> {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      throw new ServiceUnavailableException(
        'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }

    const booking = await this.bookingsService.findPublicById(params.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking is already paid');
    }

    const amount = Math.round((booking.servicePrice || 0) * 100);
    if (amount <= 0) {
      throw new BadRequestException('Booking amount must be greater than zero');
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `booking_${booking.id}`,
        notes: {
          bookingId: booking.id,
          businessId: booking.businessId.toString(),
        },
      }),
    });

    const order = await response.json();
    if (!response.ok) {
      throw new BadRequestException(
        order?.error?.description || 'Unable to create Razorpay order',
      );
    }

    await new this.paymentModel({
      bookingId: new Types.ObjectId(booking.id),
      businessId: booking.businessId,
      amount: booking.servicePrice || 0,
      currency: 'INR',
      provider: PaymentProvider.RAZORPAY,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.CARD,
      reference: order.id,
    }).save();

    return {
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.id,
    };
  }

  async verifyRazorpayPayment(params: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ payment: PaymentDocument; bookingId: string }> {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      throw new ServiceUnavailableException('Razorpay is not configured');
    }

    const booking = await this.bookingsService.findPublicById(params.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    const expected = createHmac('sha256', keySecret)
      .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
      .digest('hex');
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(params.razorpaySignature);
    if (
      expectedBuffer.length !== actualBuffer.length ||
      !timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    const payment = await this.paymentModel
      .findOneAndUpdate(
        {
          bookingId: new Types.ObjectId(booking.id),
          provider: PaymentProvider.RAZORPAY,
          reference: params.razorpayOrderId,
        },
        {
          $set: {
            status: PaymentStatus.PAID,
            providerPaymentId: params.razorpayPaymentId,
            providerSignature: params.razorpaySignature,
            method: PaymentMethod.CARD,
          },
        },
        { new: true },
      )
      .exec();
    if (!payment) throw new NotFoundException('Payment order not found');

    await this.bookingsService.markPaid({
      bookingId: booking.id,
      paymentId: payment.id,
      paymentMethod: PaymentMethod.CARD,
    });

    return { payment, bookingId: booking.id };
  }
}
