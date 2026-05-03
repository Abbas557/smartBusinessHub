import { IsBoolean, IsEnum } from 'class-validator';
import { ReviewStatus } from '../../reviews/review.schema';

export class VerifyBusinessDto {
  @IsBoolean()
  isVerified: boolean;
}

export class ModerateReviewDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}
