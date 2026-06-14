import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { auth } from "../auth";

export class ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

@Injectable()
export class MeService {
  constructor(private prisma: PrismaService) {}
  getMe(session: UserSession) {
    const { id, name, email, role, emailVerified } = session.user as {
      id: string;
      name: string;
      email: string;
      role?: string;
      emailVerified: boolean;
    };

    return {
      data: { id, name, email, role: role ?? null, emailVerified },
    };
  }

  async changePassword(session: UserSession, body: ChangePasswordDto) {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      throw new BadRequestException("currentPassword and newPassword are required");
    }

    // Use better-auth to change password via account update
    const account = await this.prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "credential",
      },
      select: { id: true },
    });

    if (!account) {
      throw new BadRequestException("No password account found");
    }

    // Delegate to better-auth changePassword endpoint via internal call
    const response = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
      headers: new Headers({
        // Pass session token so better-auth can authenticate the call
        cookie: `better-auth.session_token=${(session as any).session?.token ?? ""}`,
      }),
    });

    return { data: { success: true } };
  }
}
