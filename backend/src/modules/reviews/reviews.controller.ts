import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.schema';
import { CreateReviewDto, ReportReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createForCustomer(user.sub, dto);
  }

  @Get('me')
  @Roles(Role.CUSTOMER)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.reviewsService.findMine(user.sub);
  }

  @Public()
  @Get('business/:businessId')
  findForBusiness(@Param('businessId') businessId: string) {
    return this.reviewsService.findPublishedByBusiness(businessId);
  }

  @Public()
  @Post(':reviewId/report')
  report(
    @Param('reviewId') reviewId: string,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviewsService.reportReview(reviewId, dto.reason);
  }
}
