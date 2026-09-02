"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInvite, inviteDetail } from "@/features/auth/api";

export function InviteForm() {
  const token = useSearchParams().get("token") ?? "";
  const [userName, setUserName] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [reconfirm, setReconfirm] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ["invite", token],
    queryFn: () => inviteDetail(token),
    enabled: Boolean(token),
    retry: false,
  });
  const accept = useMutation({
    mutationFn: () =>
      acceptInvite({ token, userName: userName.trim(), fullname: fullname.trim(), password, reconfirmPassword: reconfirm }),
  });

  if (!token || detail.isError) {
    return (
      <p role="alert" className="w-full max-w-sm rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
        {detail.error?.message ?? "This invitation link is incomplete. Open the letter again or ask for a new invitation."}
      </p>
    );
  }

  if (detail.isPending) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (accept.isSuccess) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p role="status" className="rounded-sm bg-accent px-3 py-2 text-body-sm text-accent-foreground">
          {accept.data}
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
        if (password.length < 6) {
          setProblem("Pick a password of at least six characters.");
          return;
        }
        if (password !== reconfirm) {
          setProblem("The two passwords do not match.");
          return;
        }
        accept.mutate();
      }}
    >
      <p className="rounded-sm bg-accent px-3 py-2 text-body-sm text-accent-foreground">
        {detail.data.email} joins as {detail.data.roleName}.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-fullname">Full name</Label>
        <Input id="invite-fullname" autoFocus value={fullname} onChange={(event) => setFullname(event.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-username">Username</Label>
        <Input id="invite-username" autoComplete="username" value={userName} onChange={(event) => setUserName(event.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-password">Password</Label>
        <Input
          id="invite-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-reconfirm">Repeat it</Label>
        <Input
          id="invite-reconfirm"
          type="password"
          autoComplete="new-password"
          value={reconfirm}
          onChange={(event) => setReconfirm(event.target.value)}
        />
      </div>
      {problem || accept.isError ? (
        <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
          {problem ?? accept.error?.message}
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        loading={accept.isPending}
        disabled={!userName.trim() || !fullname.trim() || !password || !reconfirm}
      >
        <UserRoundPlus /> Create my account
      </Button>
    </form>
  );
}
