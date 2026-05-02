"use client";

import { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Button } from "@repo/ui/components/button";
import {
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  UserCheck,
  UserX,
  KeyRound,
  Trash2,
  UserRoundSearch,
  UserMinus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { unbanUser } from "@/app/actions/dealer.actions";
import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";
import { RoleDialog } from "./role-dialog";
import { PasswordDialog } from "./password-dialog";
import { BanDialog } from "./ban-dialog";
import { DeleteAlertDialog } from "./delete-alert-dialog";

interface DealerListActionsProps {
  dealerId: string;
  userId: string;
  isBanned?: boolean;
  currentRole?: string;
}

export function DealerListActions({
  dealerId,
  userId,
  isBanned,
  currentRole = "user",
}: DealerListActionsProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isImpersonating = !!session?.session?.impersonatedBy;

  // Dialog Visibility States
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleUnbanUser = () => {
    startTransition(async () => {
      const result = await unbanUser(userId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleImpersonate = async () => {
    await authClient.admin.impersonateUser(
      {
        userId: userId,
      },
      {
        onSuccess: () => {
          toast.success("Now impersonating user");
          const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "https://autovendo.ch";
          const locale = window.location.pathname.split("/")[1] || "de";
          window.location.href = `${baseUrl}/${locale}/dashboard`;
        },
        onError: (ctx: { error: { message: string } }) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const handleStopImpersonating = async () => {
    await authClient.admin.stopImpersonating(undefined, {
      onSuccess: () => {
        toast.success("Stopped impersonating");
        router.refresh();
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href={`/dealers/${dealerId}/edit`} className="cursor-pointer">
              <Pencil className="mr-2 size-4" />
              Edit Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {isImpersonating ? (
              <DropdownMenuItem onSelect={handleStopImpersonating}>
                <UserMinus className="mr-2 size-4" />
                Stop Impersonating
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={handleImpersonate}>
                <UserRoundSearch className="mr-2 size-4" />
                Impersonate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setIsRoleDialogOpen(true)}>
              <ShieldAlert className="mr-2 size-4" />
              Set Role
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsPasswordDialogOpen(true)}>
              <KeyRound className="mr-2 size-4" />
              Change Password
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {isBanned ? (
            <DropdownMenuItem
              className="text-green-600 focus:text-green-600"
              onSelect={handleUnbanUser}
            >
              <UserCheck className="mr-2 size-4" />
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setIsBanDialogOpen(true)}
            >
              <UserX className="mr-2 size-4" />
              Ban User
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive font-medium"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 size-4" />
            Remove Dealer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modularized Dialogs */}
      <RoleDialog
        userId={userId}
        currentRole={currentRole}
        isOpen={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
      />

      <PasswordDialog
        userId={userId}
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />

      <BanDialog
        userId={userId}
        isOpen={isBanDialogOpen}
        onOpenChange={setIsBanDialogOpen}
      />

      <DeleteAlertDialog
        userId={userId}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
