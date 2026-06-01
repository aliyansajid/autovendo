import { StorageService } from "@repo/storage";

// Dealer / AutoVendo bucket
export const storage = new StorageService({
  accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  accountId: process.env.R2_ACCOUNT_ID || "",
  bucket: process.env.R2_BUCKET_NAME || "autovendo-ch-assets",
  publicDomain: process.env.R2_PUBLIC_DOMAIN,
});

// Seller / AutoSolo bucket
export const soloStorage = new StorageService({
  accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  accountId: process.env.R2_ACCOUNT_ID || "",
  bucket: process.env.SOLO_R2_BUCKET_NAME || "autosolo-ch-assets",
  publicDomain: process.env.SOLO_R2_PUBLIC_DOMAIN || "https://cdn.autosolo.ch",
});
