import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServiceDiscoveryDao } from './dao/service-discovery.dao';
import {
  defaultServiceCategories,
  defaultServiceCollections,
} from './service-discovery.defaults';

@Injectable()
export class ServiceDiscoveryService implements OnModuleInit {
  constructor(private readonly serviceDiscoveryDao: ServiceDiscoveryDao) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaults();
  }

  async getExploreHome() {
    await this.ensureDefaults();
    const [categories, collections] = await Promise.all([
      this.serviceDiscoveryDao.findActiveCategories(),
      this.serviceDiscoveryDao.findFeaturedCollections(),
    ]);

    return { categories, collections };
  }

  async getCollection(slug: string) {
    await this.ensureDefaults();
    return this.serviceDiscoveryDao.findCollectionBySlug(slug);
  }

  private async ensureDefaults(): Promise<void> {
    const [categoryCount, collectionCount] = await Promise.all([
      this.serviceDiscoveryDao.countCategories(),
      this.serviceDiscoveryDao.countCollections(),
    ]);

    if (categoryCount === 0) {
      await this.serviceDiscoveryDao.insertCategories(defaultServiceCategories);
    }

    if (collectionCount === 0) {
      await this.serviceDiscoveryDao.insertCollections(defaultServiceCollections);
    }
  }
}
