import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.schema';
import { CustomerProfilesService } from './customer-profiles.service';
import { UpdateCustomerProfileDto } from './dto/customer-profile.dto';

@Controller('customer-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class CustomerProfilesController {
  constructor(
    private readonly customerProfilesService: CustomerProfilesService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.customerProfilesService.getMyProfile(user.sub);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.customerProfilesService.updateMyProfile(user.sub, dto);
  }
}
