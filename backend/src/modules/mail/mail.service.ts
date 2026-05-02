import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { BusinessDocument } from '../business/business.schema';
import { BookingDocument } from '../bookings/booking.schema';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly ses: SESClient;

  constructor(private readonly configService: ConfigService) {
    this.ses = new SESClient({
      region: this.configService.get<string>('AWS_REGION') || 'ap-south-1',
    });
  }

  async sendBookingConfirmation(params: {
    business: BusinessDocument;
    booking: BookingDocument;
  }): Promise<void> {
    const from = this.configService.get<string>('AWS_SES_FROM_EMAIL');
    if (!from) {
      this.logger.debug('Skipping SES booking email; AWS_SES_FROM_EMAIL is not configured.');
      return;
    }

    const { business, booking } = params;
    const subject = `Booking request received: ${business.name}`;
    const text = [
      `Hi ${booking.customerName},`,
      '',
      `Your booking request for ${booking.serviceName} at ${business.name} has been received.`,
      `Date: ${booking.date.toISOString().slice(0, 10)}`,
      `Time: ${booking.startTime} - ${booking.endTime}`,
      '',
      'The business owner will confirm your appointment soon.',
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin:0 0 12px">Booking request received</h2>
        <p>Hi ${this.escapeHtml(booking.customerName)},</p>
        <p>Your booking request for <strong>${this.escapeHtml(booking.serviceName)}</strong> at <strong>${this.escapeHtml(business.name)}</strong> has been received.</p>
        <table style="border-collapse:collapse;margin:18px 0">
          <tr><td style="padding:6px 14px 6px 0;color:#64748b">Date</td><td>${booking.date.toISOString().slice(0, 10)}</td></tr>
          <tr><td style="padding:6px 14px 6px 0;color:#64748b">Time</td><td>${booking.startTime} - ${booking.endTime}</td></tr>
        </table>
        <p>The business owner will confirm your appointment soon.</p>
      </div>
    `;

    try {
      await this.ses.send(
        new SendEmailCommand({
          Source: from,
          Destination: { ToAddresses: [booking.customerEmail] },
          Message: {
            Subject: { Data: subject },
            Body: {
              Text: { Data: text },
              Html: { Data: html },
            },
          },
        }),
      );
    } catch (error) {
      this.logger.warn(`SES booking confirmation failed: ${(error as Error).message}`);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
