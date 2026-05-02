"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { deletePlan } from "@/app/actions/plan.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { Spinner } from "@repo/ui/src/components/spinner";

export function DeletePlanButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  async function onDelete() {
    startTransition(async () => {
      try {
        const result = await deletePlan(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the plan. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner />
                Deleting...
              </>
            ) : (
              "Delete Plan"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
