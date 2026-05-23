import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  accountId: string;
  bucket: string;
  publicDomain?: string;
}

export class StorageService {
  private client: S3Client;
  private bucket: string;
  private publicDomain?: string;

  constructor(config: StorageConfig) {
    this.bucket = config.bucket;
    this.publicDomain = config.publicDomain;
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.eu.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Generates a presigned URL for uploading a file directly to R2.
   */
  async getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Generates a signed URL for viewing/downloading a private file.
   */
  async getDownloadUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Deletes a file from the R2 bucket.
   */
  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    return true;
  }

  /**
   * Returns the public URL of a file if a public domain is configured.
   */
  getPublicUrl(key: string) {
    if (!this.publicDomain) {
      throw new Error("Public domain is not configured for storage.");
    }
    const domain = this.publicDomain.startsWith("http")
      ? this.publicDomain
      : `https://${this.publicDomain}`;
    return `${domain}/${key}`;
  }

  /**
   * Helper to format upload paths for any user (dealer or seller).
   */
  static formatPath(
    userId: string,
    type: "branding" | "profiles" | "listing",
    filename: string,
    subfolder?: string,
  ) {
    const timestamp = Math.floor(Date.now() / 1000);
    const sanitizedName = filename.replace(/\s+/g, "-").toLowerCase();
    const subPath = subfolder ? `/${subfolder}` : "";
    return `${userId}/${type}${subPath}/${timestamp}_${sanitizedName}`;
  }

}
