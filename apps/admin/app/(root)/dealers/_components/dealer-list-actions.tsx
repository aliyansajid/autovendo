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
  Eye,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { unbanUser } from "@/app/actions/dealer.actions";
import {
  useSession,
  impersonateUser,
  stopImpersonating,
} from "@/lib/api/auth-client";
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
  const { data: session } = useSession();
  const isImpersonating = !!session?.session?.impersonatedBy;

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleUnbanUser = () => {
    startTransition(async () => {
      const result = await unbanUser(dealerId);
      if (result.success) {
        toast.success(result.message || "Operation successful");
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  const handleImpersonate = async () => {
    const result = await impersonateUser(userId);
    if (result.error) {
      toast.error(
        (result.error as { message?: string })?.message ?? "Failed to impersonate",
      );
      return;
    }
    toast.success("Now impersonating user");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autovendo.ch";
    window.location.href = `${baseUrl}/en/dashboard`;
  };

  const handleStopImpersonating = async () => {
    const result = await stopImpersonating();
    if (result.error) {
      toast.error("Failed to stop impersonating");
      return;
    }
    toast.success("Stopped impersonating");
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
            <Link href={`/dealers/${dealerId}`}>
              <Eye className="size-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dealers/${dealerId}#sessions`}>
              <Activity className="size-4" />
              Manage Sessions
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dealers/${dealerId}/edit`}>
              <Pencil className="size-4" />
              Edit Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {isImpersonating ? (
              <DropdownMenuItem onSelect={handleStopImpersonating}>
                <UserMinus className="size-4" />
                Stop Impersonating
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={handleImpersonate}>
                <UserRoundSearch className="size-4" />
                Impersonate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setIsRoleDialogOpen(true)}>
              <ShieldAlert className="size-4" />
              Set Role
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsPasswordDialogOpen(true)}>
              <KeyRound className="size-4" />
              Change Password
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {isBanned ? (
            <DropdownMenuItem
              className="text-green-500 focus:text-green-600"
              onSelect={handleUnbanUser}
            >
              <UserCheck className="size-4" />
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setIsBanDialogOpen(true)}
            >
              <UserX className="size-4" />
              Ban User
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            Remove Dealer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleDialog
        dealerId={dealerId}
        currentRole={currentRole}
        isOpen={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
      />

      <PasswordDialog
        dealerId={dealerId}
        userId={userId}
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />

      <BanDialog
        dealerId={dealerId}
        isOpen={isBanDialogOpen}
        onOpenChange={setIsBanDialogOpen}
      />

      <DeleteAlertDialog
        dealerId={dealerId}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
