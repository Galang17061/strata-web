"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/features/auth/api";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [passwordNew, setPasswordNew] = useState("");
  const [reconfirm, setReconfirm] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => resetPassword({ token, passwordNew, reconfirmPassword: reconfirm }),
  });

  if (!token) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
          This link is incomplete. Open the reset letter again, or ask for a fresh one.
        </p>
        <Link href="/forgot-password" className="rounded-sm text-body-sm underline underline-offset-4 hover:text-foreground">
          Ask for a new letter
        </Link>
      </div>
    );
  }

  if (save.isSuccess) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p role="status" className="rounded-sm bg-accent px-3 py-2 text-body-sm text-accent-foreground">
          {save.data}
        </p>
        <Button asChild size="lg">
          <Link href="/sign-in">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setProblem(null);
        if (passwordNew.length < 6) {
          setProblem("Pick a password of at least six characters.");
          return;
        }
        if (passwordNew !== reconfirm) {
          setProblem("The two passwords do not match.");
          return;
        }
        save.mutate();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password-new">New password</Label>
        <Input
          id="reset-password-new"
          type="password"
          autoComplete="new-password"
          autoFocus
          value={passwordNew}
          onChange={(event) => setPasswordNew(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password-confirm">Repeat it</Label>
        <Input
          id="reset-password-confirm"
          type="password"
          autoComplete="new-password"
          value={reconfirm}
          onChange={(event) => setReconfirm(event.target.value)}
        />
      </div>
      {problem || save.isError ? (
        <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
          {problem ?? save.error?.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={save.isPending} disabled={!passwordNew || !reconfirm}>
        <KeyRound /> Set the new password
      </Button>
    </form>
  );
}
