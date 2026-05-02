import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import {
  CreateBusinessDto,
  UpdateBusinessDto,
  CreateServiceDto,
  UpdateServiceDto,
  BusinessHoursDto,
} from './dto/business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, Roles, Public } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';
import { Role } from '../users/user.schema';

@Controller('business')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUSINESS_OWNER)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  // ─── POST /api/business ──────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessService.create(user.sub, dto);
  }

  // ─── GET /api/business/me ────────────────────────────────────────────────
  @Get('me')
  getMyBusiness(@CurrentUser() user: JwtPayload) {
    return this.businessService.getMyBusiness(user.sub);
  }

  // ─── PATCH /api/business/me ──────────────────────────────────────────────
  @Patch('me')
  updateMyBusiness(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.updateMyBusiness(user.sub, dto);
  }

  // ─── POST /api/business/me/publish ──────────────────────────────────────
  @Post('me/publish')
  @HttpCode(HttpStatus.OK)
  publish(@CurrentUser() user: JwtPayload) {
    return this.businessService.togglePublish(user.sub, true);
  }

  // ─── POST /api/business/me/unpublish ────────────────────────────────────
  @Post('me/unpublish')
  @HttpCode(HttpStatus.OK)
  unpublish(@CurrentUser() user: JwtPayload) {
    return this.businessService.togglePublish(user.sub, false);
  }

  // ─── GET /api/business/public/:slug (PUBLIC) ─────────────────────────────
  @Public()
  @Get('public/:slug')
  getPublicProfile(@Param('slug') slug: string) {
    return this.businessService.getPublicProfile(slug);
  }

  // ─── SERVICES ─────────────────────────────────────────────────────────────

  // POST /api/business/me/services
  @Post('me/services')
  @HttpCode(HttpStatus.CREATED)
  addService(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateServiceDto,
  ) {
    return this.businessService.addService(user.sub, dto);
  }

  // PATCH /api/business/me/services/:serviceId
  @Patch('me/services/:serviceId')
  updateService(
    @CurrentUser() user: JwtPayload,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.businessService.updateService(user.sub, serviceId, dto);
  }

  // DELETE /api/business/me/services/:serviceId
  @Delete('me/services/:serviceId')
  @HttpCode(HttpStatus.OK)
  removeService(
    @CurrentUser() user: JwtPayload,
    @Param('serviceId') serviceId: string,
  ) {
    return this.businessService.removeService(user.sub, serviceId);
  }

  // ─── HOURS ────────────────────────────────────────────────────────────────

  // PATCH /api/business/me/hours
  @Patch('me/hours')
  updateHours(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BusinessHoursDto,
  ) {
    return this.businessService.updateHours(user.sub, dto);
  }
}
