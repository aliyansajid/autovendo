"use client";

import { useState } from "react";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/src/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/src/components/dropdown-menu";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ShieldAlert,
  UserRoundSearch,
  Ban,
  Unlock,
  KeyRound,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  userRole: string;
  isBanned: boolean;
}

export function UserActions({ userId, userRole, isBanned }: UserActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleImpersonate = async () => {
    setIsPending(true);
    const { error } = await authClient.admin.impersonateUser({
      userId,
    });

    if (error) {
      toast.error(error.message || "Failed to impersonate user");
      setIsPending(false);
      return;
    }

    toast.success("Impersonation started. Redirecting...");
    // Redirect to the dealer app dashboard
    window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
  };

  const handleBanToggle = async () => {
    setIsPending(true);
    if (isBanned) {
      const { error } = await authClient.admin.unbanUser({ userId });
      if (error) toast.error(error.message);
      else {
        toast.success("User unbanned successfully");
        router.refresh();
      }
    } else {
      const { error } = await authClient.admin.banUser({
        userId,
        banReason: "Administrator manual ban",
      });
      if (error) toast.error(error.message);
      else {
        toast.success("User banned successfully");
        router.refresh();
      }
    }
    setIsPending(false);
  };

  const handleSetRole = async (newRole: "user" | "admin") => {
    setIsPending(true);
    const { error } = await authClient.admin.setRole({
      userId,
      role: newRole,
    });

    if (error) toast.error(error.message);
    else {
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    }
    setIsPending(false);
  };

  const handleResetPassword = async () => {
    const newPassword = Math.random().toString(36).slice(-8);
    const confirmed = window.confirm(
      `Reset password to: ${newPassword}? Please copy this before confirming.`,
    );

    if (!confirmed) return;

    setIsPending(true);
    const { error } = await authClient.admin.setUserPassword({
      userId,
      newPassword,
    });

    if (error) toast.error(error.message);
    else {
      toast.success("Password reset successfully");
    }
    setIsPending(false);
  };

  const handleRemoveUser = async () => {
    if (
      !window.confirm(
        "ARE YOU SURE? This will permanently delete this user account. This cannot be undone.",
      )
    ) {
      return;
    }

    setIsPending(true);
    const { error } = await authClient.admin.removeUser({ userId });
    if (error) toast.error(error.message);
    else {
      toast.success("User removed successfully");
      router.push("/dealers");
    }
    setIsPending(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleImpersonate}
        disabled={isPending}
      >
        <UserRoundSearch />
        Impersonate
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleBanToggle}
            className={isBanned ? "text-green-600" : "text-destructive"}
          >
            {isBanned ? (
              <>
                <Unlock /> Unban User
              </>
            ) : (
              <>
                <Ban /> Ban User
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleResetPassword}>
            <KeyRound />
            Reset Password
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Permissions</DropdownMenuLabel>

          {userRole === "admin" ? (
            <DropdownMenuItem onClick={() => handleSetRole("user")}>
              <ShieldAlert />
              Demote to User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleSetRole("admin")}>
              <ShieldCheck />
              Promote to Admin
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleRemoveUser}
            className="text-destructive"
          >
            <Trash2 />
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
