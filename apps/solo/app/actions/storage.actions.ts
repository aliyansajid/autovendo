"use server";

import { storage } from "@/lib/helpers/storage";
import { StorageService } from "@repo/storage";
import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { headers } from "next/headers";

const ALLOWED_TYPES = ["branding", "profiles", "listing"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

const ALLOWED_CONTENT_TYPES: Record<AllowedType, RegExp> = {
  profiles: /^image\/(jpeg|png|webp|gif)$/,
  branding: /^image\/(jpeg|png|webp|gif|svg\+xml)$/,
  listing: /^image\/(jpeg|png|webp|gif)$/,
};

const MAX_FILENAME_LENGTH = 200;

export async function getPresignedUploadUrl({
  sellerId,
  type,
  filename,
  contentType,
}: {
  sellerId: string;
  type: AllowedType;
  filename: string;
  contentType: string;
}) {
  // Session check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Unauthorized" };

  // Verify the sellerId belongs to the authenticated user
  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!seller || seller.id !== sellerId) {
    return { success: false, error: "Forbidden" };
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(type)) {
    return { success: false, error: "Invalid upload type" };
  }

  // Validate content type for the given upload type
  if (!ALLOWED_CONTENT_TYPES[type].test(contentType)) {
    return { success: false, error: "Invalid file type" };
  }

  // Sanitize filename — strip path traversal, limit length
  const safeFilename = filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, MAX_FILENAME_LENGTH);

  if (!safeFilename) {
    return { success: false, error: "Invalid filename" };
  }

  const key = StorageService.formatPath(sellerId, type, safeFilename);

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
