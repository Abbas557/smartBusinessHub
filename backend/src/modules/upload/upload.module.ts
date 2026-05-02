import { Module } from '@nestjs/common';
import { BusinessModule } from '../business/business.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [BusinessModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
