import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { BusinessService } from './business.service';

@Public()
@Controller('business/public')
export class PublicBusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  listPublicProfiles(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.businessService.listPublicProfiles({ search, category, city });
  }

  @Get(':slug')
  getPublicProfile(@Param('slug') slug: string) {
    return this.businessService.getPublicProfile(slug);
  }
}
