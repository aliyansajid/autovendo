import { Controller, Get } from "@nestjs/common";
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
  UserSession,
} from "@thallesp/nestjs-better-auth";
import { auth } from "@repo/auth";

@Controller()
export class AppController {
  @Get("/api/session")
  @OptionalAuth()
  getSession(@Session() session: UserSession<typeof auth>) {
    if (!session) return { user: null, session: null };
    return { user: session.user, session: session.session };
  }

  @Get("/health")
  @AllowAnonymous()
  health() {
    return { status: "ok" };
  }
}
