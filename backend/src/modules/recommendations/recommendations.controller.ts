import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.schema';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Public()
  @Get('public')
  getPublicRecommendations(
    @Query('city') city?: string,
    @Query('area') area?: string,
    @Query('pincode') pincode?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.recommendationsService.getPublicRecommendations({
      city,
      area,
      pincode,
      lat,
      lng,
      radiusKm,
      sessionId,
    });
  }

  @Roles(Role.CUSTOMER)
  @Get('me')
  getCustomerRecommendations(
    @CurrentUser() user: JwtPayload,
    @Query('city') city?: string,
    @Query('area') area?: string,
    @Query('pincode') pincode?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.recommendationsService.getCustomerRecommendations(user.sub, {
      city,
      area,
      pincode,
      lat,
      lng,
      radiusKm,
      sessionId,
    });
  }
}
