import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./auth";
import { AppController } from "./app.controller";
import { VehiclesModule } from "./vehicles/vehicles.module";
import { DealersModule } from "./dealers/dealers.module";
import { MeModule } from "./me/me.module";
import { DealerModule } from "./dealer/dealer.module";
import { SellerModule } from "./seller/seller.module";
import { UploadModule } from "./upload/upload.module";
import { PrismaModule } from "./prisma.module.js";

@Module({
  imports: [PrismaModule, AuthModule.forRoot({ auth, bodyParser: { rawBody: true } }), VehiclesModule, DealersModule, MeModule, DealerModule, SellerModule, UploadModule],
  controllers: [AppController],
})
export class AppModule {}
