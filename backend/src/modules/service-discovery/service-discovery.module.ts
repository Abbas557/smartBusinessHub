import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceDiscoveryDao } from './dao/service-discovery.dao';
import { ServiceDiscoveryController } from './service-discovery.controller';
import {
  ServiceCategory,
  ServiceCategorySchema,
  ServiceCollection,
  ServiceCollectionSchema,
} from './service-discovery.schema';
import { ServiceDiscoveryService } from './service-discovery.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceCategory.name, schema: ServiceCategorySchema },
      { name: ServiceCollection.name, schema: ServiceCollectionSchema },
    ]),
  ],
  controllers: [ServiceDiscoveryController],
  providers: [ServiceDiscoveryDao, ServiceDiscoveryService],
  exports: [ServiceDiscoveryDao, ServiceDiscoveryService],
})
export class ServiceDiscoveryModule {}
