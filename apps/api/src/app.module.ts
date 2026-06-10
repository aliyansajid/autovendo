import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "@repo/auth";
import { AppController } from "./app.controller";
import { VehiclesModule } from "./vehicles/vehicles.module";
import { DealersModule } from "./dealers/dealers.module";
import { MeModule } from "./me/me.module";
import { DealerModule } from "./dealer/dealer.module";
import { SellerModule } from "./seller/seller.module";
import { UploadModule } from "./upload/upload.module";

@Module({
  imports: [AuthModule.forRoot({ auth }), VehiclesModule, DealersModule, MeModule, DealerModule, SellerModule, UploadModule],
  controllers: [AppController],
})
export class AppModule {}
