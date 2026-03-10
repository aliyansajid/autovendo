import { StorageService } from "@repo/storage";

// Initialize StorageService
export const storage = new StorageService({
  accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  accountId: process.env.R2_ACCOUNT_ID || "",
  bucket: process.env.R2_BUCKET_NAME || "autovendo",
  publicDomain: process.env.R2_PUBLIC_DOMAIN,
});
