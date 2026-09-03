"use client";

import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type Envelope } from "@/lib/api/client";

const categories = [
  { value: "bug", label: "Something is broken" },
  { value: "idea", label: "An idea for the product" },
  { value: "question", label: "A question" },
];

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const pathname = usePathname();
  const [category, setCategory] = useState("idea");
  const [message, setMessage] = useState("");
  const send = useMutation({
    mutationFn: () =>
      api.post<Envelope<null>>("/Feedback", { category, message: message.trim(), page: pathname ?? "" }),
    onSuccess: (envelope) => {
      onOpenChange(false);
      setMessage("");
      toast.success("Note sent", { description: envelope.message });
    },
    onError: (error) => toast.error("The note could not be sent", { description: error.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write to the builders</DialogTitle>
          <DialogDescription>
            Bugs, ideas, questions - every note lands with the people who make Strata,
            along with the page you are on.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (message.trim()) send.mutate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feedback-category">What kind of note is it?</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="feedback-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feedback-message">The note</Label>
            <textarea
              id="feedback-message"
              rows={5}
              maxLength={2000}
              autoFocus
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-sm border border-border bg-surface-sunken px-3 py-2 text-body text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-foreground-subtle focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Say it the way you would to a colleague."
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={send.isPending} disabled={!message.trim()}>
              <Send /> Send the note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
