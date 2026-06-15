import { Controller, Post, Body } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumRequired: false,
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;

@Controller("upload")
export class UploadController {
  @Post("presign")
  async presign(
    @Session() session: UserSession,
    @Body() body: { files: { name: string; type: string }[] },
  ) {
    void session;
    const results = await Promise.all(
      body.files.map(async (file) => {
        const ext = file.name.split(".").pop() ?? "jpg";
        const key = `vehicles/${randomUUID()}.${ext}`;
        const command = new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          ContentType: file.type,
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 300 });
        return { url, key, publicUrl: `${PUBLIC_DOMAIN}/${key}` };
      }),
    );
    return results;
  }
}
