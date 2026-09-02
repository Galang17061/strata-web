"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Copy, MailPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUser, listRoles, type InviteResult } from "@/features/account/api";
import { queryKeys } from "@/lib/query-keys";

type InviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [result, setResult] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);
  const roles = useQuery({ queryKey: queryKeys.users.roles, queryFn: listRoles, enabled: open });
  const invite = useMutation({
    mutationFn: () => inviteUser({ email: email.trim(), roleId }),
    onSuccess: (envelope) => setResult(envelope.data),
  });

  const reset = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setEmail("");
      setRoleId("");
      setResult(null);
      setCopied(false);
      invite.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite by email</DialogTitle>
          <DialogDescription>
            The person receives a link, picks their own username and password, and lands in
            the role you choose here.
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="flex flex-col gap-4">
            <p role="status" className="rounded-sm bg-accent px-3 py-2 text-body-sm text-accent-foreground">
              {result.delivered
                ? "The invitation letter is on its way. You can also hand over the link yourself:"
                : "No mailbox is configured, so nothing was sent. Hand over this link yourself:"}
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={result.inviteUrl} className="font-mono text-caption" />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="Copy the invite link"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.inviteUrl);
                  setCopied(true);
                }}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
            <p className="text-caption text-foreground-muted">Valid for seven days, one use.</p>
            <div className="flex justify-end">
              <Button type="button" onClick={() => reset(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (email.trim() && roleId) invite.mutate();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue placeholder="Pick a role" />
                </SelectTrigger>
                <SelectContent>
                  {(roles.data?.data ?? []).map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {invite.isError ? (
              <p role="alert" className="rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger">
                {invite.error.message}
              </p>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => reset(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={invite.isPending} disabled={!email.trim() || !roleId}>
                <MailPlus /> Send the invitation
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
