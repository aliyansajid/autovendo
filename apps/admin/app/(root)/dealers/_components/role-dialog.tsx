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
import { setRole } from "@/lib/api/dealers";
import { roleSchema } from "@/schema";
import { Spinner } from "@repo/ui/src/components/spinner";

interface RoleDialogProps {
  dealerId: string;
  currentRole: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleDialog({
  dealerId,
  currentRole,
  isOpen,
  onOpenChange,
}: RoleDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role: currentRole as "user" | "admin",
    },
  });

  const onSubmit = (values: z.infer<typeof roleSchema>) => {
    startTransition(async () => {
      const result = await setRole({
        dealerId,
        role: values.role,
      });

      if (result.success) {
        toast.success("Success");
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
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Select the new role for this user. This will change their
            permissions immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="role"
              label="Role"
              placeholder="Select a role"
              disabled={isPending}
            >
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner />
                    Updating...
                  </>
                ) : (
                  "Update Role"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
