"use server";

import { StorageService } from "@repo/storage";

// Initialize StorageService (In a real app, these should be env vars)
const storage = new StorageService({
  accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  accountId: process.env.R2_ACCOUNT_ID || "",
  bucket: process.env.R2_BUCKET_NAME || "dealers",
  publicDomain: process.env.R2_PUBLIC_DOMAIN,
});

/**
 * Request a presigned URL to upload a file directly to R2.
 */
export async function getPresignedUploadUrl({
  country,
  dealerId,
  type,
  filename,
  contentType,
}: {
  country: string;
  dealerId: string;
  type: "branding" | "profiles" | "listings";
  filename: string;
  contentType: string;
}) {
  const key = StorageService.formatDealerPath(
    country,
    dealerId,
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
