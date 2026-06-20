import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { DealersService, DealersQueryDto, DealerVehiclesQueryDto, DealerContactDto } from "./dealers.service";

@Controller("dealers")
@AllowAnonymous()
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @Get()
  findMany(@Query() query: DealersQueryDto) {
    return this.dealersService.findMany(query);
  }

  @Get("featured")
  findFeatured() {
    return this.dealersService.findFeatured();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.dealersService.findOne(id);
  }

  @Get(":id/vehicles")
  findDealerVehicles(
    @Param("id") id: string,
    @Query() query: DealerVehiclesQueryDto,
  ) {
    return this.dealersService.findDealerVehicles(id, query);
  }

  @Post(":id/contact")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  sendContactEmail(
    @Param("id") id: string,
    @Body() body: DealerContactDto,
  ) {
    return this.dealersService.sendContactEmail(id, body);
  }
}
