import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ServiceCategory,
  ServiceCategoryDocument,
  ServiceCollection,
  ServiceCollectionDocument,
} from '../service-discovery.schema';

@Injectable()
export class ServiceDiscoveryDao {
  constructor(
    @InjectModel(ServiceCategory.name)
    private readonly serviceCategoryModel: Model<ServiceCategoryDocument>,
    @InjectModel(ServiceCollection.name)
    private readonly serviceCollectionModel: Model<ServiceCollectionDocument>,
  ) {}

  async countCategories(): Promise<number> {
    return this.serviceCategoryModel.countDocuments().exec();
  }

  async countCollections(): Promise<number> {
    return this.serviceCollectionModel.countDocuments().exec();
  }

  async insertCategories(data: Partial<ServiceCategory>[]): Promise<void> {
    await this.serviceCategoryModel.insertMany(data, { ordered: false });
  }

  async insertCollections(data: Partial<ServiceCollection>[]): Promise<void> {
    await this.serviceCollectionModel.insertMany(data, { ordered: false });
  }

  async findActiveCategories(): Promise<ServiceCategoryDocument[]> {
    return this.serviceCategoryModel
      .find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .exec();
  }

  async findFeaturedCollections(): Promise<ServiceCollectionDocument[]> {
    return this.serviceCollectionModel
      .find({ isActive: true, isFeatured: true })
      .sort({ displayOrder: 1, title: 1 })
      .exec();
  }

  async findCollectionBySlug(slug: string): Promise<ServiceCollectionDocument | null> {
    return this.serviceCollectionModel
      .findOne({ slug, isActive: true })
      .exec();
  }
}
