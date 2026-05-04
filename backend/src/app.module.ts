import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BusinessModule } from './modules/business/business.module';
import { CustomersModule } from './modules/customers/customers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { UploadModule } from './modules/upload/upload.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CustomerProfilesModule } from './modules/customer-profiles/customer-profiles.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';
import { ServiceDiscoveryModule } from './modules/service-discovery/service-discovery.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { CustomerEventsModule } from './modules/customer-events/customer-events.module';

@Module({
  imports: [
    // Config module — loads .env, available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection via Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        // Mongoose 7+ options
        autoIndex: true,
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    BusinessModule,
    CustomersModule,
    CustomerProfilesModule,
    BookingsModule,
    UploadModule,
    PaymentsModule,
    ReviewsModule,
    ServiceDiscoveryModule,
    CustomerEventsModule,
    RecommendationsModule,
    AdminModule,
  ],
})
export class AppModule {}
