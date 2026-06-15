import { Controller, Post, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { memoryStorage } from "multer";

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
  @Post()
  @UseInterceptors(
    FilesInterceptor("files", 25, { storage: memoryStorage() }),
  )
  async upload(
    @Session() session: UserSession,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    void session;
    const results = await Promise.all(
      (files ?? []).map(async (file) => {
        const ext = file.originalname.split(".").pop() ?? "jpg";
        const key = `vehicles/${randomUUID()}.${ext}`;
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
        return { key, publicUrl: `${PUBLIC_DOMAIN}/${key}` };
      }),
    );
    return results;
  }
}
