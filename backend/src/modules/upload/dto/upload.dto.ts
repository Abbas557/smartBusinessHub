import { IsIn, IsString, Matches } from 'class-validator';

export class PresignedUploadDto {
  @IsString()
  @Matches(/^image\/(png|jpeg|jpg|webp)$/)
  contentType: string;

  @IsIn(['logo', 'banner'])
  assetType: 'logo' | 'banner';
}
