"use client";

import { useMutation } from "@tanstack/react-query";
import { MailQuestion } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/features/auth/api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const ask = useMutation({ mutationFn: () => forgotPassword(email.trim()) });

  if (ask.isSuccess) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p role="status" className="rounded-sm bg-accent px-3 py-2 text-body-sm text-accent-foreground">
          {ask.data}
        </p>
        <p className="text-body-sm text-foreground-muted">
          The letter works once and only for the next hour. Nothing arrived? Check the
          address, look in spam, or ask your administrator.
        </p>
        <Link href="/sign-in" className="rounded-sm text-body-sm underline underline-offset-4 hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (email.trim()) ask.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      {ask.isError ? (
        <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
          {ask.error.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={ask.isPending} disabled={!email.trim()}>
        <MailQuestion /> Send the reset letter
      </Button>
      <Link href="/sign-in" className="rounded-sm text-body-sm text-foreground-muted underline-offset-4 hover:text-foreground hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}
