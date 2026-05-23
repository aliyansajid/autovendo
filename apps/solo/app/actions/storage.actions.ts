"use server";

import { storage } from "@/lib/helpers/storage";
import { StorageService } from "@repo/storage";

/**
 * Request a presigned URL to upload a file directly to R2.
 */
export async function getPresignedUploadUrl({
  sellerId,
  type,
  filename,
  contentType,
}: {
  sellerId: string;
  type: "branding" | "profiles" | "listing";
  filename: string;
  contentType: string;
}) {
  const key = StorageService.formatPath(
    sellerId,
    type,
    filename,
  );

  try {
    const uploadUrl = await storage.getUploadUrl(key, contentType);
    return {
      success: true,
      uploadUrl,
      key,
      publicUrl: storage.getPublicUrl(key),
    };
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    return { success: false, error: "Failed to generate upload URL" };
  }
}
