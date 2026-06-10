import { Controller, Post } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";

@Controller("upload")
export class UploadController {
  // TODO: Configure storage (e.g. S3, local disk, Cloudinary) and wire up file handling.
  // Currently returns a stub response because no storage backend is configured yet.
  @Post()
  upload(@Session() session: UserSession) {
    void session; // session required for auth guard — user must be authenticated
    return { url: "" };
  }
}
