"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const schema = z.object({
  fullname: z.string().trim().min(1, "Give the person a name.").max(255, "Keep the name under 255 characters."),
  userName: z
    .string()
    .trim()
    .min(3, "A username needs at least 3 characters.")
    .max(50, "Keep the username under 50 characters.")
    .regex(/^[a-z0-9._-]+$/i, "Use letters, digits, dots, dashes or underscores only."),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = { fullname: "", userName: "" };

type UserSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserSheet({ open, onOpenChange }: UserSheetProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const errors = form.formState.errors;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <form onSubmit={form.handleSubmit(() => undefined)} noValidate className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>New person</SheetTitle>
            <SheetDescription>Someone who will sign in to Strata.</SheetDescription>
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
              {errors.fullname ? (
                <p id="user-fullname-error" className="text-body-sm text-danger">
                  {errors.fullname.message}
                </p>
              ) : null}
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
              {errors.userName ? (
                <p id="user-username-error" className="text-body-sm text-danger">
                  {errors.userName.message}
                </p>
              ) : null}
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit">Add person</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
