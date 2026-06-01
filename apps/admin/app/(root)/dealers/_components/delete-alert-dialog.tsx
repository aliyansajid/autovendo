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
import { removeUser } from "@/lib/api/dealers";
import { Spinner } from "@repo/ui/src/components/spinner";

interface DeleteAlertDialogProps {
  dealerId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAlertDialog({
  dealerId,
  isOpen,
  onOpenChange,
}: DeleteAlertDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDeleteUser = () => {
    startTransition(async () => {
      const result = await removeUser(dealerId);
      if (result.success) {
        toast.success("Success");
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
