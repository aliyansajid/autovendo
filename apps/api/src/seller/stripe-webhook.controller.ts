import { Controller, Post, Req, Headers, HttpCode } from "@nestjs/common";
import type { Request } from "express";
import { SellerService } from "./seller.service";

@Controller("api/seller")
export class StripeWebhookController {
  constructor(private readonly sellerService: SellerService) {}

  @Post("stripe/webhook")
  @HttpCode(200)
  handleListingWebhook(
    @Req() req: Request,
    @Headers("stripe-signature") signature: string,
  ) {
    const rawBody: Buffer = (req as any).rawBody ?? req.body;
    return this.sellerService.handleListingWebhook(rawBody, signature);
  }
}
