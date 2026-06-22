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
 * Uploads a batch of images. If any file fails (e.g. a bad-bytes rejection), the
 * ones that already succeeded are deleted so a partial batch never leaks orphans.
 */
export async function uploadImages(
  files: { buffer: Buffer }[],
  prefix: string,
): Promise<{ key: string; publicUrl: string }[]> {
  const results = await Promise.allSettled(
    files.map((f) => uploadImage(f, prefix)),
  );
  const ok = results.filter(
    (r): r is PromiseFulfilledResult<{ key: string; publicUrl: string }> =>
      r.status === "fulfilled",
  );
  const failed = results.find((r) => r.status === "rejected");
  if (failed) {
    await deleteImages(ok.map((r) => r.value.key));
    throw (failed as PromiseRejectedResult).reason;
  }
  return ok.map((r) => r.value);
}

// Resolves a stored image value — a bare R2 key (vehicle images) OR a full public
// URL (profile images) — to the object key we own. Returns null for empty values
// or external URLs (e.g. an OAuth avatar) so we never delete something not ours.
function toOwnedKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const prefix = `${PUBLIC_DOMAIN}/`;
  if (value.startsWith(prefix)) return value.slice(prefix.length) || null;
  if (/^https?:\/\//i.test(value)) return null;
  return value.replace(/^\/+/, "") || null;
}

/**
 * Best-effort delete of an image we previously stored (key or own-domain URL).
 * External URLs are left alone, and failures are swallowed — a lingering old
 * image must never fail the request.
 */
export async function deleteImage(
  value: string | null | undefined,
): Promise<void> {
  const key = toOwnedKey(value);
  if (!key) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    console.error(`Failed to delete R2 object ${key}:`, err);
  }
}

/** Best-effort bulk delete (e.g. all images of a vehicle being removed). */
export async function deleteImages(
  values: (string | null | undefined)[],
): Promise<void> {
  await Promise.all(values.map((v) => deleteImage(v)));
}
