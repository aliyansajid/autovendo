"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";
import {
  CustomFormField,
  FormFieldType,
} from "@repo/ui/src/components/custom-form-field";
import { SelectItem } from "@repo/ui/components/select";
import { toast } from "sonner";
import { banUser } from "@/app/actions/dealer.actions";
import { banSchema } from "@/schema";
import { Spinner } from "@repo/ui/src/components/spinner";

interface BanDialogProps {
  dealerId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BanDialog({ dealerId, isOpen, onOpenChange }: BanDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof banSchema>>({
    resolver: zodResolver(banSchema),
    defaultValues: {
      reason: "",
      expiresIn: "permanent",
    },
  });

  const onSubmit = (values: z.infer<typeof banSchema>) => {
    const expiresInSeconds =
      values.expiresIn === "permanent" ? undefined : parseInt(values.expiresIn);

    startTransition(async () => {
      const result = await banUser({
        dealerId,
        reason: values.reason,
        expiresIn: expiresInSeconds,
      });

      if (result.success) {
        toast.success(result.message);
        form.reset();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Provide a reason and duration for banning this user. They will be
            prevented from logging in and all active sessions will be revoked.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="reason"
              label="Reason for Ban"
              placeholder="e.g. Policy violation, Outstanding balance..."
              disabled={isPending}
            />

            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="expiresIn"
              label="Ban Duration"
              placeholder="Select duration"
              disabled={isPending}
            >
              <SelectItem value="3600">1 Hour</SelectItem>
              <SelectItem value="86400">24 Hours</SelectItem>
              <SelectItem value="604800">7 Days</SelectItem>
              <SelectItem value="2592000">30 Days</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
            </CustomFormField>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner />
                    Banning...
                  </>
                ) : (
                  "Ban User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
