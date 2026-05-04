import { Module } from '@nestjs/common';
import { BusinessModule } from '../business/business.module';
import { CustomerProfilesModule } from '../customer-profiles/customer-profiles.module';
import { CustomerEventsModule } from '../customer-events/customer-events.module';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [BusinessModule, CustomerProfilesModule, CustomerEventsModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
