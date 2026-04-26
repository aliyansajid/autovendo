"use server";

import { storage } from "@/lib/helpers/storage";

/**
 * Request a presigned URL to upload a file directly to R2.
 */
export async function getPresignedUploadUrl({
  sellerId,
  fileName,
  contentType,
}: {
  sellerId: string;
  fileName: string;
  contentType: string;
}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const sanitizedName = fileName.replace(/\s+/g, "-").toLowerCase();
  const key = `sellers/${sellerId}/profiles/${timestamp}_${sanitizedName}`;

  try {
    const uploadUrl = await storage.getUploadUrl(key, contentType);
    return { uploadUrl, key, publicUrl: storage.getPublicUrl(key) };
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}
