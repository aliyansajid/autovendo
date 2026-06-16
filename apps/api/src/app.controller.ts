import { Controller, Get, Post, Body, HttpCode } from "@nestjs/common";
import {
  AllowAnonymous,
  OptionalAuth,
  Session,
} from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { auth } from "./auth";
import React from "react";
import { sendEmail, ContactMessage } from "./transactional";
import { PrismaService } from "./prisma.service";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("/")
  @AllowAnonymous()
  root() {
    return "OK";
  }

  @Get("/plans")
  @AllowAnonymous()
  async getPlans() {
    const plans = await this.prisma.plan.findMany({
      select: {
        name: true,
        description: true,
        price: true,
        limits: true,
        popular: true,
        hasTrial: true,
        trialDays: true,
      },
      orderBy: { price: "asc" },
    });
    return plans;
  }

  @Get("/api/session")
  @OptionalAuth()
  getSession(@Session() session: UserSession<typeof auth>) {
    if (!session) return { user: null, session: null };
    return { user: session.user, session: session.session };
  }

  @Post("/contact")
  @AllowAnonymous()
  @HttpCode(200)
  async contact(
    @Body()
    body: {
      name: string;
      email: string;
      phone: string;
      subject?: string;
      message?: string;
    },
  ) {
    const recipient = process.env.EMAIL_ADMIN ?? "info@autovendo.ch";
    const result = await sendEmail({
      to: recipient,
      subject: body.subject
        ? `[Autovendo] ${body.subject}`
        : `[Autovendo] Neue Kontaktanfrage von ${body.name}`,
      replyTo: body.email,
      template: React.createElement(ContactMessage, {
        name: body.name,
        email: body.email,
        phone: body.phone,
        subject: body.subject,
        message: body.message,
      }),
    });

    if (!result.success) {
      return { ok: false, error: "errorDefault" };
    }

    return { ok: true, message: "success" };
  }
}
