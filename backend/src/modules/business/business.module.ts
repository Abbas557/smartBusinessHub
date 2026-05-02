import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './business.schema';
import { BusinessDao } from './dao/business.dao';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { PublicBusinessController } from './public-business.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [BusinessController, PublicBusinessController],
  providers: [
    BusinessDao,      // DAO — pure DB access
    BusinessService,  // Service — business logic
  ],
  exports: [BusinessDao, BusinessService],
})
export class BusinessModule {}
