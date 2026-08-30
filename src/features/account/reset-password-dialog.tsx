"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/features/account/api";
import type { User } from "@/features/account/types";
import { passwordStrength } from "@/features/auth/change-password-dialog";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    passwordNew: z.string().min(8, "Use at least 8 characters."),
    reconfirmPassword: z.string().min(1, "Repeat the new password."),
  })
  .refine((values) => values.passwordNew === values.reconfirmPassword, {
    path: ["reconfirmPassword"],
    message: "The two passwords do not match.",
  });

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = { passwordNew: "", reconfirmPassword: "" };
const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];

type ResetPasswordDialogProps = {
  user: User | null;
  onOpenChange: (open: boolean) => void;
};

export function ResetPasswordDialog({ user, onOpenChange }: ResetPasswordDialogProps) {
  const open = user !== null;
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues, mode: "onBlur" });

  useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => resetPassword(user?.id ?? "", values),
    onSuccess: () => {
      toast.success("Password replaced", { description: `${user?.fullName} signs in with the new one from now on.` });
      onOpenChange(false);
    },
    onError: (error) => form.setError("passwordNew", { message: error.message }),
  });

  const errors = form.formState.errors;
  const password = form.watch("passwordNew");
  const score = passwordStrength(password);
  const tone = score <= 1 ? "bg-danger" : score <= 2 ? "bg-warning" : "bg-success";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Set a new password</DialogTitle>
            <DialogDescription>
              {user ? `${user.fullName} will not be asked for the old one.` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              type="password"
              autoFocus
              autoComplete="new-password"
              aria-invalid={errors.passwordNew ? true : undefined}
              aria-describedby={errors.passwordNew ? "reset-password-error" : "reset-password-strength"}
              {...form.register("passwordNew")}
            />
            {errors.passwordNew ? (
              <p id="reset-password-error" className="text-body-sm text-danger">
                {errors.passwordNew.message}
              </p>
            ) : null}
            <div id="reset-password-strength" className="flex flex-col gap-1.5" aria-live="polite">
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={cn("h-1 flex-1 rounded-pill bg-border transition-colors duration-(--dur-base)", step <= score && tone)}
                  />
                ))}
              </div>
              <p className="text-caption text-foreground-muted normal-case">{password ? strengthLabels[score] : "At least 8 characters."}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-password-again">Repeat it</Label>
            <Input
              id="reset-password-again"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.reconfirmPassword ? true : undefined}
              aria-describedby={errors.reconfirmPassword ? "reset-password-again-error" : undefined}
              {...form.register("reconfirmPassword")}
            />
            {errors.reconfirmPassword ? (
              <p id="reset-password-again-error" className="text-body-sm text-danger">
                {errors.reconfirmPassword.message}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={mutation.isPending}>
              Replace password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
