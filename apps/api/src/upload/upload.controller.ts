import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import multer from "multer";
import {
  uploadImage,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "../storage/r2";

const MAX_FILES = 25;

@Controller("upload")
export class UploadController {
  @Post()
  @UseInterceptors(
    FilesInterceptor("files", MAX_FILES, {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_FILES },
      fileFilter: (_req, file, cb) => {
        cb(null, file.mimetype in ALLOWED_IMAGE_TYPES);
      },
    }),
  )
  async upload(
    @Session() session: UserSession,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    void session;
    if (!files?.length) {
      throw new BadRequestException("No files uploaded");
    }
    return Promise.all(files.map((file) => uploadImage(file, "vehicles")));
  }
}
