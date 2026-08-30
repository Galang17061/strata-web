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
import { createProject, updateProject } from "@/features/projects/api";
import type { Project } from "@/features/projects/types";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

const schema = z.object({
  projectName: z.string().trim().min(1, "Give the project a name.").max(255, "Keep the name under 255 characters."),
});

type FormValues = z.infer<typeof schema>;

type ProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSaved?: (project: Project | null) => void;
};

export function ProjectDialog({ open, onOpenChange, project, onSaved }: ProjectDialogProps) {
  const queryClient = useQueryClient();
  const editing = Boolean(project);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { projectName: project?.projectName ?? "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) form.reset({ projectName: project?.projectName ?? "" });
  }, [open, project, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      project ? updateProject(project.projectId, values) : createProject(values),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all });
      toast.success(editing ? "Project renamed" : "Project created", {
        description: form.getValues("projectName"),
      });
      onSaved?.(response?.data ?? null);
      onOpenChange(false);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError && error.fieldErrors.ProjectName
          ? error.fieldErrors.ProjectName.join(" ")
          : error.message;
      form.setError("projectName", { message });
    },
  });

  const error = form.formState.errors.projectName?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{editing ? "Rename project" : "New project"}</DialogTitle>
            <DialogDescription>
              {editing ? "Change how this project is called everywhere." : "A project groups the systems you model together."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              autoFocus
              placeholder="Plant A cooling"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "project-name-error" : undefined}
              {...form.register("projectName")}
            />
            {error ? (
              <p id="project-name-error" className="text-body-sm text-danger">
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
              {editing ? "Save name" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
