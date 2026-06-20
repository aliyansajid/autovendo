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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import multer from "multer";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../storage/r2";
import {
  DealerService,
  DealerVehiclesQueryDto,
  CreateCheckoutSessionDto,
} from "./dealer.service";
import { ZodValidationPipe } from "../validation/zod-validation.pipe";
import {
  createVehicleSchema,
  updateVehicleSchema,
  type VehicleCreateInput,
  type VehicleUpdateInput,
} from "../validation/vehicle.validation";
import {
  dealerProfileSchema,
  type DealerProfileInput,
} from "../validation/profile.validation";

@Controller("dealer")
export class DealerController {
  constructor(private readonly dealerService: DealerService) {}

  @Get("profile")
  getProfile(@Session() session: UserSession) {
    return this.dealerService.getProfile(session);
  }

  @Put("profile")
  updateProfile(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(dealerProfileSchema)) body: DealerProfileInput,
  ) {
    return this.dealerService.updateProfile(session, body);
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
  createVehicle(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(createVehicleSchema)) body: VehicleCreateInput,
  ) {
    return this.dealerService.createVehicle(session, body);
  }

  @Get("vehicles/:id")
  getVehicle(@Session() session: UserSession, @Param("id") id: string) {
    return this.dealerService.getVehicle(session, id);
  }

  @Put("vehicles/:id")
  updateVehicle(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateVehicleSchema)) body: VehicleUpdateInput,
  ) {
    return this.dealerService.updateVehicle(session, id, body);
  }

  @Delete("vehicles/:id")
  deleteVehicle(@Session() session: UserSession, @Param("id") id: string) {
    return this.dealerService.deleteVehicle(session, id);
  }

  @Get("subscription")
  getSubscription(@Session() session: UserSession) {
    return this.dealerService.getSubscription(session);
  }

  @Post("subscription")
  createCheckoutSession(
    @Session() session: UserSession,
    @Body() body: CreateCheckoutSessionDto,
  ) {
    return this.dealerService.createCheckoutSession(session, body);
  }

  @Post("subscription/portal")
  createBillingPortalSession(@Session() session: UserSession) {
    return this.dealerService.createBillingPortalSession(session);
  }
}
