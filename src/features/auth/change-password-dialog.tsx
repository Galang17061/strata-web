"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
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
import { useSession } from "@/features/auth/session";
import { useUiStore } from "@/features/shell/ui-store";
import { ApiError, api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    oldPassword: z.string().min(1, "Enter your current password."),
    passwordNew: z.string().min(8, "Use at least 8 characters."),
    reconfirmPassword: z.string().min(1, "Repeat the new password."),
  })
  .refine((values) => values.passwordNew === values.reconfirmPassword, {
    path: ["reconfirmPassword"],
    message: "The two passwords do not match.",
  });

type FormValues = z.infer<typeof schema>;

export function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(4, score);
}

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];

function StrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password);
  const tone = score <= 1 ? "bg-danger" : score <= 2 ? "bg-warning" : "bg-success";
  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn("h-1 flex-1 rounded-pill bg-border transition-colors", step <= score && tone)}
          />
        ))}
      </div>
      <span className="text-caption text-foreground-muted">{strengthLabels[score]}</span>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ChangePasswordDialog() {
  const open = useUiStore((state) => state.changePasswordOpen);
  const setOpen = useUiStore((state) => state.setChangePasswordOpen);
  const { user } = useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: "", passwordNew: "", reconfirmPassword: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.put(`/User/ChangePassword?UserId=${encodeURIComponent(user?.id ?? "")}`, values),
    onSuccess: () => {
      toast.success("Password changed", { description: "Use the new password next time you sign in." });
      setOpen(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
          if (key in form.getValues()) form.setError(key, { message: messages.join(" ") });
        }
        return;
      }
      form.setError("root", { message: error.message });
    },
  });

  const newPassword = form.watch("passwordNew");
  const errors = form.formState.errors;
  const rootError = useMemo(() => errors.root?.message, [errors.root]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Pick something long that only you would know.</DialogDescription>
          </DialogHeader>
          <Field id="old-password" label="Current password" error={errors.oldPassword?.message}>
            <Input
              id="old-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.oldPassword ? true : undefined}
              aria-describedby={errors.oldPassword ? "old-password-error" : undefined}
              {...form.register("oldPassword")}
            />
          </Field>
          <Field id="new-password" label="New password" error={errors.passwordNew?.message}>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.passwordNew ? true : undefined}
              aria-describedby={errors.passwordNew ? "new-password-error" : undefined}
              {...form.register("passwordNew")}
            />
            <StrengthMeter password={newPassword} />
          </Field>
          <Field id="confirm-password" label="Repeat new password" error={errors.reconfirmPassword?.message}>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.reconfirmPassword ? true : undefined}
              aria-describedby={errors.reconfirmPassword ? "confirm-password-error" : undefined}
              {...form.register("reconfirmPassword")}
            />
          </Field>
          {rootError ? (
            <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
              {rootError}
            </p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={mutation.isPending}>
              Save new password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
