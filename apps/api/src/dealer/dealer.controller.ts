import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import {
  DealerService,
  UpdateDealerProfileDto,
  DealerVehiclesQueryDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateCheckoutSessionDto,
} from "./dealer.service";

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
    @Body() body: UpdateDealerProfileDto,
  ) {
    return this.dealerService.updateProfile(session, body);
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
    @Body() body: CreateVehicleDto,
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
    @Body() body: UpdateVehicleDto,
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
