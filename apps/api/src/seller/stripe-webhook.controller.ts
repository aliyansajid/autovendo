import { Controller, Post, Req, Headers, HttpCode } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { Request } from "express";
import { SellerService } from "./seller.service";

// Stripe drives the request volume here, not users — exempt from rate limiting.
@SkipThrottle()
@Controller("api/seller")
export class StripeWebhookController {
  constructor(private readonly sellerService: SellerService) {}

  // Stripe calls this endpoint with no session — authentication is the webhook
  // signature, verified in handleListingWebhook via stripe.webhooks.constructEvent.
  @Post("stripe/webhook")
  @AllowAnonymous()
  @HttpCode(200)
  handleListingWebhook(
    @Req() req: Request,
    @Headers("stripe-signature") signature: string,
  ) {
    const rawBody: Buffer = (req as any).rawBody ?? req.body;
    return this.sellerService.handleListingWebhook(rawBody, signature);
  }
}
