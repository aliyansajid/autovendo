/**
 * Shared Cloudflare R2 (S3-compatible) client and image upload helper.
 * Both vehicle images (`/upload`) and dealer branding images
 * (`/dealer/profile/image`) go through the API and are written here, so all
 * image bytes are validated (magic bytes) and stored with a server-chosen key.
 */
import { BadRequestException } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: "auto",
  endpoint:
    process.env.R2_ENDPOINT ??
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB per image

// Accepted image types → canonical extension. The stored content-type and
// extension are derived from this map, never from the client filename.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Magic-byte signatures so we trust the bytes, not the declared mimetype.
export function detectImageType(buf: Buffer): string | null {
  if (
    buf.length >= 8 &&
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Validates the file's actual bytes and uploads it to R2 under `<prefix>/<uuid>.<ext>`.
 * Returns the storage key and the public CDN URL.
 */
export async function uploadImage(
  file: { buffer: Buffer },
  prefix: string,
): Promise<{ key: string; publicUrl: string }> {
  const detected = detectImageType(file.buffer);
  if (!detected || !(detected in ALLOWED_IMAGE_TYPES)) {
    throw new BadRequestException("Only PNG, JPEG and WEBP images are allowed");
  }

  const ext = ALLOWED_IMAGE_TYPES[detected];
  const key = `${prefix}/${randomUUID()}.${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: detected,
    }),
  );

  return { key, publicUrl: `${PUBLIC_DOMAIN}/${key}` };
}

/**
 * Best-effort delete of an image we previously stored. Only objects served from
 * our own public domain are touched (external/OAuth avatar URLs are left alone),
 * and failures are swallowed — a lingering old image must never fail the request.
 */
export async function deleteImage(
  publicUrl: string | null | undefined,
): Promise<void> {
  if (!publicUrl) return;
  const prefix = `${PUBLIC_DOMAIN}/`;
  if (!publicUrl.startsWith(prefix)) return;
  const key = publicUrl.slice(prefix.length);
  if (!key) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    console.error(`Failed to delete R2 object ${key}:`, err);
  }
}
