"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { createVendor, updateVendor } from "@/features/master-data/api";
import { LogoDropZone } from "@/features/master-data/logo-drop-zone";
import type { Vendor } from "@/features/master-data/types";
import { ApiError } from "@/lib/api/client";
import { filesUrl } from "@/lib/files-url";
import { queryKeys } from "@/lib/query-keys";

const schema = z.object({
  manufacturerName: z.string().trim().min(1, "Give the vendor a name.").max(255, "Keep the name under 255 characters."),
  validUntil: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function valuesOf(vendor: Vendor | null | undefined): FormValues {
  return {
    manufacturerName: vendor?.manufacturerName ?? "",
    validUntil: vendor?.validUntil ? vendor.validUntil.slice(0, 10) : "",
  };
}

type VendorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
};

export function VendorDialog({ open, onOpenChange, vendor }: VendorDialogProps) {
  const queryClient = useQueryClient();
  const editing = Boolean(vendor);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: valuesOf(vendor),
    mode: "onBlur",
  });
  const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      form.reset(valuesOf(vendor));
      setLogo(null);
    }
  }, [open, vendor, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      vendor ? updateVendor(vendor.vendorId, { ...values, logo }) : createVendor({ ...values, logo }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast.success(editing ? "Vendor updated" : "Vendor added", { description: form.getValues("manufacturerName") });
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
            <DialogTitle>{editing ? "Edit vendor" : "New vendor"}</DialogTitle>
            <DialogDescription>
              {editing ? "Change what is known about this maker." : "A vendor is the maker a part in the catalogue comes from."}
            </DialogDescription>
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vendor-valid-until">Valid until</Label>
            <Input id="vendor-valid-until" type="date" className="font-mono tabular-nums sm:max-w-48" {...form.register("validUntil")} />
            <p className="text-caption text-foreground-muted normal-case">Leave it empty if the agreement has no end date.</p>
          </div>
          <LogoDropZone file={logo} onFileChange={setLogo} currentUrl={filesUrl(vendor?.logoImage)} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? "Save changes" : "Add vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
