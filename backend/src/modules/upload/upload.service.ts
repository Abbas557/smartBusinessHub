import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'ap-south-1',
    });
  }

  async createPresignedUrl(params: {
    businessId: string;
    assetType: 'logo' | 'banner';
    contentType: string;
  }) {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    if (!bucket) {
      throw new BadRequestException('S3 bucket is not configured');
    }

    const extension = this.extensionFor(params.contentType);
    const key = `businesses/${params.businessId}/${params.assetType}-${randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: params.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = this.publicUrlFor(key);

    return {
      key,
      uploadUrl,
      publicUrl,
      expiresIn: 300,
    };
  }

  private extensionFor(contentType: string): string {
    if (contentType === 'image/png') return 'png';
    if (contentType === 'image/webp') return 'webp';
    if (contentType === 'image/jpeg' || contentType === 'image/jpg') return 'jpg';
    throw new BadRequestException('Unsupported image type');
  }

  private publicUrlFor(key: string): string {
    const cloudFront = this.configService.get<string>('AWS_CLOUDFRONT_URL');
    if (cloudFront) return `${cloudFront.replace(/\/$/, '')}/${key}`;

    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
