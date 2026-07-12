import { Global, Module } from '@nestjs/common';
import {
  IPikslotS3Service,
  PikslotS3ServiceImplementation,
} from './s3.service';
import { S3Controller } from './s3.controller';

@Global()
@Module({
  controllers: [S3Controller],
  providers: [
    { provide: IPikslotS3Service, useClass: PikslotS3ServiceImplementation },
  ],
  exports: [
    { provide: IPikslotS3Service, useClass: PikslotS3ServiceImplementation },
  ],
})
export class PikslotS3Module {}
