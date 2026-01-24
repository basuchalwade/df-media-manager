
import { Client } from 'minio';
import { config } from '../config/env';
import { Buffer } from 'buffer';

// Define interface compatible with Multer's file object
export interface UploadedFile {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class StorageService {
  private client: Client;

  constructor() {
    this.client = new Client({
      endPoint: config.s3.endPoint,
      port: config.s3.port,
      useSSL: config.s3.useSSL,
      accessKey: config.s3.accessKey,
      secretKey: config.s3.secretKey,
    });
    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(config.s3.bucket);
    if (!exists) {
      await this.client.makeBucket(config.s3.bucket, 'us-east-1');
      // Set public policy for read access
      const policy = {
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${config.s3.bucket}/*`]
        }]
      };
      await this.client.setBucketPolicy(config.s3.bucket, JSON.stringify(policy));
    }
  }

  async uploadFile(file: UploadedFile): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    await this.client.putObject(config.s3.bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype
    });
    
    // Construct public URL (assuming local MinIO setup for dev)
    const protocol = config.s3.useSSL ? 'https' : 'http';
    return `${protocol}://${config.s3.endPoint}:${config.s3.port}/${config.s3.bucket}/${fileName}`;
  }
}