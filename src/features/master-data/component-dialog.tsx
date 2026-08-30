"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMasterComponent, listVendors } from "@/features/master-data/api";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

const schema = z.object({
  componentName: z.string().trim().min(1, "Give the part a name.").max(255, "Keep the name under 255 characters."),
  vendorId: z.string().min(1, "Pick the vendor it comes from."),
  serialNumber: z.string().trim().max(100, "Keep the serial under 100 characters."),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = { componentName: "", vendorId: "", serialNumber: "" };
const vendorParams = { page: 1, pageSize: 200, sortBy: "manufacturerName", sortOrder: "asc" as const };

type ComponentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ComponentDialog({ open, onOpenChange }: ComponentDialogProps) {
  const queryClient = useQueryClient();
  const vendors = useQuery({
    queryKey: queryKeys.vendors.list(vendorParams),
    queryFn: () => listVendors(vendorParams),
    enabled: open,
  });
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createMasterComponent({
        componentName: values.componentName,
        vendorId: values.vendorId,
        serialNumber: values.serialNumber || null,
        failureRate: 0,
        cost: null,
        compatibility: null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.masterComponents.all });
      toast.success("Component added", { description: form.getValues("componentName") });
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
      form.setError("componentName", { message: error.message });
    },
  });

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>New component</DialogTitle>
            <DialogDescription>A part in the catalogue that systems can be built from.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="component-name">Component name</Label>
            <Input
              id="component-name"
              autoFocus
              placeholder="Centrifugal pump"
              aria-invalid={errors.componentName ? true : undefined}
              aria-describedby={errors.componentName ? "component-name-error" : undefined}
              {...form.register("componentName")}
            />
            {errors.componentName ? (
              <p id="component-name-error" className="text-body-sm text-danger">
                {errors.componentName.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="component-vendor">Vendor</Label>
              <Controller
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="component-vendor"
                      className="w-full"
                      aria-invalid={errors.vendorId ? true : undefined}
                      aria-describedby={errors.vendorId ? "component-vendor-error" : undefined}
                    >
                      <SelectValue placeholder={vendors.isPending ? "Loading vendors" : "Pick a vendor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(vendors.data?.data ?? []).map((vendor) => (
                        <SelectItem key={vendor.vendorId} value={vendor.vendorId}>
                          {vendor.manufacturerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.vendorId ? (
                <p id="component-vendor-error" className="text-body-sm text-danger">
                  {errors.vendorId.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="component-serial">Serial number</Label>
              <Input id="component-serial" placeholder="NP-100" className="font-mono" {...form.register("serialNumber")} />
              {errors.serialNumber ? <p className="text-body-sm text-danger">{errors.serialNumber.message}</p> : null}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={mutation.isPending}>
              Add component
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
