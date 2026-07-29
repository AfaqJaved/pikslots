import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import type { Env } from '../../src/shared/config/env';

export interface TestS3Client {
  client: S3Client;
  bucket: string;
}

/** Builds a raw S3 client from the real ConfigService, for setting up/verifying objects directly against RustFS. */
export function createTestS3Client(
  configService: ConfigService<Env, true>,
): TestS3Client {
  const bucket = configService.get('S3_BUCKET_NAME', { infer: true });
  const client = new S3Client({
    endpoint: configService.get('S3_HOST', { infer: true }),
    region: configService.get('S3_REGION', { infer: true }),
    credentials: {
      accessKeyId: configService.get('S3_ACCESS_KEY', { infer: true }),
      secretAccessKey: configService.get('S3_SECRET_KEY', { infer: true }),
    },
    forcePathStyle: configService.get('S3_FORCED_PATH_STYLE', {
      infer: true,
    }),
  });
  return { client, bucket };
}

export async function putRealObject(
  { client, bucket }: TestS3Client,
  key: string,
  body: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }),
  );
}

export async function s3ObjectExists(
  { client, bucket }: TestS3Client,
  key: string,
): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (cause) {
    const name = (cause as { name?: string })?.name;
    const status = (cause as { $metadata?: { httpStatusCode?: number } })
      ?.$metadata?.httpStatusCode;
    if (name === 'NotFound' || status === 404) return false;
    throw cause;
  }
}

export async function deleteS3Object(
  { client, bucket }: TestS3Client,
  key: string,
): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
