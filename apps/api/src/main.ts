import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // Trust the reverse proxy so rate limiting sees the real client IP
  // (X-Forwarded-For) instead of the load balancer's address.
  app.set("trust proxy", 1);

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [
      "http://localhost:3000",
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
