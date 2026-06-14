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
  SellerService,
  UpdateSellerProfileDto,
  SellerVehiclesQueryDto,
  CreateSellerVehicleDto,
  UpdateSellerVehicleDto,
} from "./seller.service";

@Controller("seller")
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get("profile")
  getProfile(@Session() session: UserSession) {
    return this.sellerService.getProfile(session);
  }

  @Put("profile")
  updateProfile(
    @Session() session: UserSession,
    @Body() body: UpdateSellerProfileDto,
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
  createVehicle(
    @Session() session: UserSession,
    @Body() body: CreateSellerVehicleDto,
  ) {
    return this.sellerService.createVehicle(session, body);
  }

  @Get("vehicles/:id")
  getVehicle(@Session() session: UserSession, @Param("id") id: string) {
    return this.sellerService.getVehicle(session, id);
  }

  @Put("vehicles/:id")
  updateVehicle(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Body() body: UpdateSellerVehicleDto,
  ) {
    return this.sellerService.updateVehicle(session, id, body);
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
