import { Controller, Get, Param, Query } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { VehiclesService, VehiclesQueryDto } from "./vehicles.service.js";

@Controller("vehicles")
@AllowAnonymous()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findMany(@Query() query: VehiclesQueryDto) {
    return this.vehiclesService.findMany(query);
  }

  @Get("featured")
  findFeatured() {
    return this.vehiclesService.findFeatured();
  }

  @Get(":id/similar")
  findSimilar(@Param("id") id: string) {
    return this.vehiclesService.findSimilar(id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.vehiclesService.findOne(id);
  }
}
