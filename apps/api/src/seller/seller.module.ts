import { Module } from "@nestjs/common";
import { SellerController } from "./seller.controller";
import { StripeWebhookController } from "./stripe-webhook.controller";
import { SellerService } from "./seller.service";

@Module({
  controllers: [SellerController, StripeWebhookController],
  providers: [SellerService],
})
export class SellerModule {}
