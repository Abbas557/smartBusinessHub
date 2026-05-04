import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.schema';
import { CustomerEventDao } from './dao/customer-event.dao';
import { CustomerEventsService } from './customer-events.service';
import { TrackCustomerEventDto } from './dto/customer-event.dto';

@Controller('customer-events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerEventsController {
  constructor(
    private readonly customerEventsService: CustomerEventsService,
    private readonly customerEventDao: CustomerEventDao,
  ) {}

  @Public()
  @Post('public')
  trackPublic(@Body() dto: TrackCustomerEventDto) {
    return this.customerEventsService.trackPublicEvent(dto);
  }

  @Roles(Role.CUSTOMER)
  @Post('me')
  trackMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TrackCustomerEventDto,
  ) {
    return this.customerEventsService.trackUserEvent(user.sub, dto);
  }

  @Roles(Role.CUSTOMER)
  @Get('me/recent')
  getRecent(@CurrentUser() user: JwtPayload) {
    return this.customerEventDao.findRecentForUser(user.sub);
  }
}
