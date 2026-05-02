import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BusinessService } from '../business/business.service';
import { Role } from '../users/user.schema';
import { PresignedUploadDto } from './dto/upload.dto';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUSINESS_OWNER)
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly businessService: BusinessService,
  ) {}

  @Post('presigned-url')
  async createPresignedUrl(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PresignedUploadDto,
  ) {
    const business = await this.businessService.getMyBusiness(user.sub);
    return this.uploadService.createPresignedUrl({
      businessId: business.id,
      assetType: dto.assetType,
      contentType: dto.contentType,
    });
  }
}
