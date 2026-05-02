import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessModule } from '../business/business.module';
import { Customer, CustomerSchema } from './customer.schema';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerDao } from './dao/customer.dao';

@Module({
  imports: [
    BusinessModule,
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomerDao, CustomersService],
  exports: [CustomerDao, CustomersService],
})
export class CustomersModule {}
