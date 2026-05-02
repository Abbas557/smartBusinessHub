import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.schema';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  SlotQueryDto,
  UpdateBookingStatusDto,
} from './dto/booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.createPublicBooking(dto);
  }

  @Public()
  @Get('slots')
  getSlots(@Query() query: SlotQueryDto) {
    return this.bookingsService.getSlots(query);
  }

  @Get()
  @Roles(Role.BUSINESS_OWNER)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findForOwner(user.sub);
  }

  @Get(':id')
  @Roles(Role.BUSINESS_OWNER)
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookingsService.findOneForOwner(user.sub, id);
  }

  @Patch(':id/status')
  @Roles(Role.BUSINESS_OWNER)
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatusForOwner(user.sub, id, dto.status);
  }

  @Delete(':id')
  @Roles(Role.BUSINESS_OWNER)
  @HttpCode(HttpStatus.OK)
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.bookingsService.deleteForOwner(user.sub, id);
  }
}
