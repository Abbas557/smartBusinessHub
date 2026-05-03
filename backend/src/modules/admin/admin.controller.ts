import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.schema';
import { AdminService } from './admin.service';
import { ModerateReviewDto, VerifyBusinessDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('users')
  findUsers() {
    return this.adminService.findUsers();
  }

  @Get('businesses')
  findBusinesses() {
    return this.adminService.findBusinesses();
  }

  @Get('bookings')
  findBookings() {
    return this.adminService.findBookings();
  }

  @Get('payments')
  findPayments() {
    return this.adminService.findPayments();
  }

  @Get('reviews')
  findReviews() {
    return this.adminService.findReviews();
  }

  @Patch('businesses/:id/verification')
  verifyBusiness(@Param('id') id: string, @Body() dto: VerifyBusinessDto) {
    return this.adminService.verifyBusiness(id, dto.isVerified);
  }

  @Patch('reviews/:id/status')
  moderateReview(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.adminService.setReviewStatus(id, dto.status);
  }
}
