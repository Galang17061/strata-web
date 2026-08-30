"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createUser, listRoles, updateUser } from "@/features/account/api";
import { roleLabel } from "@/features/account/role-badge";
import type { User } from "@/features/account/types";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

const baseSchema = z.object({
  fullname: z.string().trim().min(1, "Give the person a name.").max(255, "Keep the name under 255 characters."),
  userName: z
    .string()
    .trim()
    .min(3, "A username needs at least 3 characters.")
    .max(50, "Keep the username under 50 characters.")
    .regex(/^[a-z0-9._-]+$/i, "Use letters, digits, dots, dashes or underscores only."),
  email: z.string().trim(),
  password: z.string(),
  roleId: z.string().min(1, "Pick the role they will have."),
});

const createSchema = baseSchema.extend({
  email: z.string().trim().email("Enter an email address that looks right."),
  password: z.string().min(8, "Use at least 8 characters."),
});

type FormValues = z.infer<typeof baseSchema>;

const emptyValues: FormValues = { fullname: "", userName: "", email: "", password: "", roleId: "" };

function valuesOf(user: User | null | undefined): FormValues {
  if (!user) return emptyValues;
  return { fullname: user.fullName, userName: user.userName, email: user.email, password: "", roleId: user.roleId };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-body-sm text-danger">
      {message}
    </p>
  );
}

type UserSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
};

export function UserSheet({ open, onOpenChange, user }: UserSheetProps) {
  const queryClient = useQueryClient();
  const editing = Boolean(user);
  const [showPassword, setShowPassword] = useState(false);
  const roles = useQuery({ queryKey: queryKeys.users.roles, queryFn: listRoles, enabled: open });
  const form = useForm<FormValues>({
    resolver: zodResolver(editing ? baseSchema : createSchema),
    defaultValues: valuesOf(user),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(valuesOf(user));
      setShowPassword(false);
    }
  }, [open, user, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      user
        ? updateUser(user.id, { fullname: values.fullname, userName: values.userName, roleId: values.roleId })
        : createUser(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(editing ? "Person updated" : "Person added", {
        description: editing ? form.getValues("fullname") : `${form.getValues("fullname")} can sign in now.`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          const name = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
          if (name in emptyValues) form.setError(name, { message: messages.join(" ") });
        }
        return;
      }
      form.setError("userName", { message: error.message });
    },
  });

  const errors = form.formState.errors;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit person" : "New person"}</SheetTitle>
            <SheetDescription>
              {editing ? "Change their name, username or role." : "Someone who will sign in to Strata."}
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-fullname">Full name</Label>
              <Input
                id="user-fullname"
                autoFocus
                placeholder="Ada Lovelace"
                autoComplete="off"
                aria-invalid={errors.fullname ? true : undefined}
                aria-describedby={errors.fullname ? "user-fullname-error" : undefined}
                {...form.register("fullname")}
              />
              <FieldError id="user-fullname-error" message={errors.fullname?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-username">Username</Label>
              <Input
                id="user-username"
                placeholder="ada"
                autoComplete="off"
                className="font-mono"
                aria-invalid={errors.userName ? true : undefined}
                aria-describedby={errors.userName ? "user-username-error" : undefined}
                {...form.register("userName")}
              />
              <FieldError id="user-username-error" message={errors.userName?.message} />
            </div>
            {editing ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-email">Email</Label>
                <Input id="user-email" type="email" value={user?.email ?? ""} readOnly aria-readonly className="text-foreground-muted" />
                <p className="text-caption text-foreground-muted normal-case">An email stays as it was given.</p>
              </div>
            ) : null}
            {editing ? null : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-email-new">Email</Label>
                <Input
                  id="user-email-new"
                  type="email"
                  placeholder="ada@example.com"
                  autoComplete="off"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "user-email-error" : undefined}
                  {...form.register("email")}
                />
                <FieldError id="user-email-error" message={errors.email?.message} />
              </div>
            )}
            {editing ? null : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-password">Password</Label>
                <div className="relative">
                  <Input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby={errors.password ? "user-password-error" : "user-password-help"}
                    {...form.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-0.5 right-0.5 z-10"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {errors.password ? (
                  <FieldError id="user-password-error" message={errors.password.message} />
                ) : (
                  <p id="user-password-help" className="text-caption text-foreground-muted normal-case">
                    At least 8 characters. They can change it after signing in.
                  </p>
              )}
            </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-role">Role</Label>
              <Controller
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="user-role"
                      className="w-full"
                      aria-invalid={errors.roleId ? true : undefined}
                      aria-describedby={errors.roleId ? "user-role-error" : undefined}
                    >
                      <SelectValue placeholder={roles.isPending ? "Loading roles" : "Pick a role"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(roles.data?.data ?? []).map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {roleLabel(role.roleName)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError id="user-role-error" message={errors.roleId?.message} />
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? "Save changes" : "Add person"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
