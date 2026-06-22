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
  UploadedFiles,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import multer from "multer";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { SellerService, SellerVehiclesQueryDto } from "./seller.service";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../storage/r2";

// One multipart call carries the vehicle data (JSON `data` field) plus up to 25
// new image files. The service uploads them, deletes any removed ones, and writes.
const VehicleImagesInterceptor = FilesInterceptor("images", 25, {
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 25 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype in ALLOWED_IMAGE_TYPES),
});

@Controller("seller")
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get("profile")
  getProfile(@Session() session: UserSession) {
    return this.sellerService.getProfile(session);
  }

  // Accepts the contact fields plus optional name/email; validated in the
  // service (which also proxies the email change to Better Auth).
  @Put("profile")
  updateProfile(
    @Session() session: UserSession,
    @Body() body: Record<string, unknown>,
  ) {
    return this.sellerService.updateProfile(session, body);
  }

  @Get("vehicles")
  listVehicles(
    @Session() session: UserSession,
    @Query() query: SellerVehiclesQueryDto,
  ) {
    return this.sellerService.listVehicles(session, query);
  }

  @Post("vehicles")
  @UseInterceptors(VehicleImagesInterceptor)
  createVehicle(
    @Session() session: UserSession,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.sellerService.createVehicle(session, body, files ?? []);
  }

  @Get("vehicles/:id")
  getVehicle(@Session() session: UserSession, @Param("id") id: string) {
    return this.sellerService.getVehicle(session, id);
  }

  @Put("vehicles/:id")
  @UseInterceptors(VehicleImagesInterceptor)
  updateVehicle(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.sellerService.updateVehicle(session, id, body, files ?? []);
  }

  @Delete("vehicles/:id")
  deleteVehicle(@Session() session: UserSession, @Param("id") id: string) {
    return this.sellerService.deleteVehicle(session, id);
  }

  @Post("listing/checkout")
  createListingCheckout(
    @Session() session: UserSession,
    @Body() body: { vehicleId: string; planId: string; locale: string },
  ) {
    return this.sellerService.createListingCheckout(session, body);
  }

  @Get("billing")
  getBilling(@Session() session: UserSession) {
    return this.sellerService.getBilling(session);
  }

  @Post("billing/portal")
  createBillingPortalSession(@Session() session: UserSession) {
    return this.sellerService.createBillingPortalSession(session);
  }
}
