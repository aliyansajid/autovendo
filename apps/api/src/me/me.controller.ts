import { Controller, Get, Post, Body } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { MeService } from "./me.service.js";

export class ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

@Controller("me")
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getMe(@Session() session: UserSession) {
    return this.meService.getMe(session);
  }

  @Post("password")
  changePassword(
    @Session() session: UserSession,
    @Body() body: ChangePasswordDto,
  ) {
    return this.meService.changePassword(session, body);
  }
}
