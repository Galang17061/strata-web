"use client";

import { ImageUp, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const maxLogoBytes = 3 * 1024 * 1024;
const acceptedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp", "image/gif", "image/bmp"];

export function logoProblem(file: File): string | null {
  if (!acceptedTypes.includes(file.type)) return "Pick a PNG, JPG, SVG, WebP, GIF or BMP image.";
  if (file.size > maxLogoBytes) return "Keep the logo under 3 MB.";
  return null;
}

type LogoDropZoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  currentUrl?: string | null;
  label?: string;
};

export function LogoDropZone({ file, onFileChange, currentUrl = null, label = "Logo" }: LogoDropZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const take = (candidate: File | null | undefined) => {
    if (!candidate) return;
    const trouble = logoProblem(candidate);
    setProblem(trouble);
    if (!trouble) onFileChange(candidate);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    take(event.dataTransfer.files?.[0]);
  };

  const shown = preview ?? currentUrl;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption uppercase text-foreground-muted">{label}</span>
      <div
        role="group"
        aria-label={`${label} upload`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex items-center gap-4 rounded-md border border-dashed border-border bg-surface-sunken p-3 transition-colors",
          dragging && "border-primary bg-accent",
        )}
      >
        <span className="inline-flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-surface">
          {shown ? (
            <Image src={shown} alt="" width={64} height={64} unoptimized className="size-full object-contain p-1" />
          ) : (
            <ImageUp className="size-6 text-foreground-subtle" aria-hidden="true" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate text-body-sm text-foreground">
            {file ? file.name : shown ? "Current logo" : "Drop an image here"}
          </p>
          <p className="text-caption text-foreground-muted">PNG, JPG, SVG or WebP up to 3 MB.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              {file || shown ? "Choose another" : "Choose a file"}
            </Button>
            {file ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onFileChange(null);
                  setProblem(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <X /> Remove
              </Button>
            ) : null}
          </div>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptedTypes.join(",")}
          aria-label={`${label} file`}
          className="sr-only"
          onChange={(event) => take(event.target.files?.[0])}
        />
      </div>
      {problem ? <p className="text-body-sm text-danger">{problem}</p> : null}
    </div>
  );
}
