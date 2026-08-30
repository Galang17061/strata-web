"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { createVendor } from "@/features/master-data/api";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

const schema = z.object({
  manufacturerName: z.string().trim().min(1, "Give the vendor a name.").max(255, "Keep the name under 255 characters."),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = { manufacturerName: "" };

type VendorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VendorDialog({ open, onOpenChange }: VendorDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createVendor(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast.success("Vendor added", { description: form.getValues("manufacturerName") });
      onOpenChange(false);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError && error.fieldErrors.ManufacturerName
          ? error.fieldErrors.ManufacturerName.join(" ")
          : error.message;
      form.setError("manufacturerName", { message });
    },
  });

  const error = form.formState.errors.manufacturerName?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>New vendor</DialogTitle>
            <DialogDescription>A vendor is the maker a part in the catalogue comes from.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vendor-name">Vendor name</Label>
            <Input
              id="vendor-name"
              autoFocus
              placeholder="Northwind Pumps"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "vendor-name-error" : undefined}
              {...form.register("manufacturerName")}
            />
            {error ? (
              <p id="vendor-name-error" className="text-body-sm text-danger">
                {error}
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
              Add vendor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
