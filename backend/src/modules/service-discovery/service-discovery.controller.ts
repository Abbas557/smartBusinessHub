import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { ServiceDiscoveryService } from './service-discovery.service';

@Public()
@Controller('service-discovery')
export class ServiceDiscoveryController {
  constructor(private readonly serviceDiscoveryService: ServiceDiscoveryService) {}

  @Get()
  getExploreHome() {
    return this.serviceDiscoveryService.getExploreHome();
  }

  @Get('collections/:slug')
  getCollection(@Param('slug') slug: string) {
    return this.serviceDiscoveryService.getCollection(slug);
  }
}
