import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { DemoPaymentDto } from './dto/payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('demo-checkout')
  @HttpCode(HttpStatus.CREATED)
  createDemoPayment(@Body() dto: DemoPaymentDto) {
    return this.paymentsService.createDemoPayment(dto);
  }
}
