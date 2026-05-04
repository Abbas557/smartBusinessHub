import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomerProfile,
  CustomerProfileSchema,
} from './customer-profile.schema';
import { CustomerEventsModule } from '../customer-events/customer-events.module';
import { CustomerProfilesController } from './customer-profiles.controller';
import { CustomerProfilesService } from './customer-profiles.service';
import { CustomerProfileDao } from './dao/customer-profile.dao';

@Module({
  imports: [
    CustomerEventsModule,
    MongooseModule.forFeature([
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),
  ],
  controllers: [CustomerProfilesController],
  providers: [CustomerProfileDao, CustomerProfilesService],
  exports: [CustomerProfileDao, CustomerProfilesService],
})
export class CustomerProfilesModule {}
