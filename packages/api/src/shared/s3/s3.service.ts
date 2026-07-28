import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const IPikslotS3Service = Symbol('IPikslotS3Service');

export interface PikslotS3Service {
  getPresignedUploadUrl(params: {
    filename: string;
    contentType: string;
    path: string;
  }): Promise<string>;
  getPresignedDownloadUrl(key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  extractKeyFromUrl(value: string): string;
}

@Injectable()
export class PikslotS3ServiceImplementation
  implements PikslotS3Service, OnModuleInit
{
  private s3: S3Client;
  private readonly logger: Logger = new Logger(
    PikslotS3ServiceImplementation.name,
  );

  constructor(private readonly configService: ConfigService<Env, true>) {}

  async getPresignedUploadUrl({
    filename,
    contentType,
    path,
  }: {
    filename: string;
    contentType: string;
    path: string;
  }): Promise<string> {
    const key = `${path}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.configService.get('S3_BUCKET_NAME', { infer: true }),
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    if (!key) return '';

    const command = new GetObjectCommand({
      Bucket: this.configService.get('S3_BUCKET_NAME', { infer: true }),
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  extractKeyFromUrl(value: string): string {
    if (!/^https?:\/\//i.test(value)) return value;

    const bucket = this.configService.get('S3_BUCKET_NAME', { infer: true });
    const forcePathStyle = this.configService.get('S3_FORCED_PATH_STYLE', {
      infer: true,
    });
    const path = decodeURIComponent(new URL(value).pathname);

    if (forcePathStyle && path.startsWith(`/${bucket}/`)) {
      return path.slice(`/${bucket}/`.length);
    }

    return path.replace(/^\//, '');
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME', { infer: true }),
        Key: key,
      }),
    );
  }

  async onModuleInit(): Promise<void> {
    if (!this.configService.get<boolean>('S3_ENABLED')) return;

    this.s3 = new S3Client({
      endpoint: this.configService.get('S3_HOST', { infer: true }),
      region: this.configService.get('S3_REGION', { infer: true }), // RustFS ignores this, but required by AWS SDK
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY', { infer: true }),
        secretAccessKey: this.configService.get('S3_SECRET_KEY', {
          infer: true,
        }),
      },
      forcePathStyle: this.configService.get('S3_FORCED_PATH_STYLE', {
        infer: true,
      }), // Required for S3-compatible storage like RustFS
    });

    try {
      await this.s3.send(
        new CreateBucketCommand({
          Bucket: this.configService.get('S3_BUCKET_NAME', { infer: true }),
        }),
      );

      await this.s3.send(
        new PutBucketCorsCommand({
          Bucket: this.configService.get('S3_BUCKET_NAME', { infer: true }),
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: ['*'],
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'DELETE', 'HEAD'],
              },
            ],
          },
        }),
      );

      this.logger.log('S3 connected successfully');
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'BucketAlreadyExists' ||
          error.name === 'BucketAlreadyOwnedByYou')
      ) {
        this.logger.log('S3 connected successfully');
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`S3 connection failed: ${message}`);
    }
  }
}
