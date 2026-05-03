"use client";

import { useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { toast } from "sonner";
import { removeUser } from "@/app/actions/dealer.actions";
import { Spinner } from "@repo/ui/src/components/spinner";

interface DeleteAlertDialogProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAlertDialog({
  userId,
  isOpen,
  onOpenChange,
}: DeleteAlertDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDeleteUser = () => {
    startTransition(async () => {
      const result = await removeUser(userId);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            account, cancel active Stripe subscriptions, and remove all associated dealer data including vehicles and images.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={"destructive"}
            onClick={(e) => {
              e.preventDefault();
              handleDeleteUser();
            }}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
