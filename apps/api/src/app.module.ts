import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "@repo/auth";
import { AppController } from "./app.controller";
import { VehiclesModule } from "./vehicles/vehicles.module";
import { DealersModule } from "./dealers/dealers.module";

@Module({
  imports: [AuthModule.forRoot({ auth }), VehiclesModule, DealersModule],
  controllers: [AppController],
})
export class AppModule {}
