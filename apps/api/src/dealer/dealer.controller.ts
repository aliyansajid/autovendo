import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common";
import {
  FileInterceptor,
  FileFieldsInterceptor,
  FilesInterceptor,
} from "@nestjs/platform-express";
import multer from "multer";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../storage/r2";
import {
  DealerService,
  DealerVehiclesQueryDto,
} from "./dealer.service";

// One multipart call carries the vehicle data (JSON `data` field) plus up to 25
// new image files. The service uploads them, deletes any removed ones, and writes.
const VehicleImagesInterceptor = FilesInterceptor("images", 25, {
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 25 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype in ALLOWED_IMAGE_TYPES),
});

@Controller("dealer")
export class DealerController {
  constructor(private readonly dealerService: DealerService) {}

  @Get("profile")
  getProfile(@Session() session: UserSession) {
    return this.dealerService.getProfile(session);
  }

  // Accepts JSON (web — image URLs already uploaded) OR multipart/form-data
  // (mobile — sends logo/cover/avatar files + name/email so the API does the
  // R2 upload, the Prisma writes, and the Better Auth email change in one call).
  @Put("profile")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "logo", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
        { name: "avatar", maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
        limits: { fileSize: MAX_IMAGE_BYTES, files: 3 },
        fileFilter: (_req, file, cb) => cb(null, file.mimetype in ALLOWED_IMAGE_TYPES),
      },
    ),
  )
  updateProfile(
    @Session() session: UserSession,
    @Body() body: Record<string, unknown>,
    @UploadedFiles()
    files?: { logo?: Express.Multer.File[]; coverImage?: Express.Multer.File[]; avatar?: Express.Multer.File[] },
  ) {
    return this.dealerService.updateProfile(session, body, files);
  }

  @Post("profile/image")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
      fileFilter: (_req, file, cb) => {
        cb(null, file.mimetype in ALLOWED_IMAGE_TYPES);
      },
    }),
  )
  uploadProfileImage(
    @Session() session: UserSession,
    @UploadedFile() file: Express.Multer.File,
    @Body("type") type: string,
  ) {
    return this.dealerService.uploadProfileImage(session, type, file);
  }

  @Get("vehicles")
  listVehicles(
    @Session() session: UserSession,
    @Query() query: DealerVehiclesQueryDto,
  ) {
    return this.dealerService.listVehicles(session, query);
  }

  @Post("vehicles")
  @UseInterceptors(VehicleImagesInterceptor)
  createVehicle(
    @Session() session: UserSession,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.dealerService.createVehicle(session, body, files ?? []);
  }

  @Get("vehicles/:id")
  getVehicle(@Session() session: UserSession, @Param("id") id: string) {
    return this.dealerService.getVehicle(session, id);
  }

  @Put("vehicles/:id")
  @UseInterceptors(VehicleImagesInterceptor)
  updateVehicle(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.dealerService.updateVehicle(session, id, body, files ?? []);
  }

  @Delete("vehicles/:id")
  deleteVehicle(@Session() session: UserSession, @Param("id") id: string) {
    return this.dealerService.deleteVehicle(session, id);
  }

  @Get("subscription")
  getSubscription(@Session() session: UserSession) {
    return this.dealerService.getSubscription(session);
  }
}
