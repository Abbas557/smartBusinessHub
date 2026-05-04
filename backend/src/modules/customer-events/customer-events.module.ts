import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerEventDao } from './dao/customer-event.dao';
import { CustomerEvent, CustomerEventSchema } from './customer-event.schema';
import { CustomerEventsController } from './customer-events.controller';
import { CustomerEventsService } from './customer-events.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerEvent.name, schema: CustomerEventSchema },
    ]),
  ],
  controllers: [CustomerEventsController],
  providers: [CustomerEventDao, CustomerEventsService],
  exports: [CustomerEventDao, CustomerEventsService],
})
export class CustomerEventsModule {}
