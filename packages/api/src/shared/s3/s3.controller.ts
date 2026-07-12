import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { IPikslotS3Service, type PikslotS3Service } from './s3.service';
import { GetPresignedUploadUrlDto } from './dto/get.presigned.upload.url.dto';
import { GetPresignedUploadUrlDocs } from './docs/s3.controller.docs';
import { S3_ENDPOINTS } from '@pikslots/shared';
import type { PresignedUrlResponse } from '@pikslots/shared';

@ApiTags('S3 Storage')
@Controller('')
export class S3Controller {
  constructor(
    @Inject(IPikslotS3Service) private readonly s3Service: PikslotS3Service,
  ) {}

  @GetPresignedUploadUrlDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Standard', 'Enhanced', 'Admin')
  @Post(S3_ENDPOINTS.PRESIGNED_UPLOAD)
  async getPresignedUploadUrl(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: GetPresignedUploadUrlDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<PresignedUrlResponse>
  > {
    const url = await this.s3Service.getPresignedUploadUrl({
      filename: dto.filename,
      contentType: dto.contentType,
      path: dto.path,
    });

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<PresignedUrlResponse>(
      { url },
      HttpStatus.OK,
    );
  }
}
