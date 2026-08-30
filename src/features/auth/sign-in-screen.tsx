"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { z } from "zod";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DASHBOARD_PATH, useSession, useSignIn } from "@/features/auth/session";
import { ApiError } from "@/lib/api/client";
import { useMotionTokens } from "@/lib/motion";
import { cn } from "@/lib/utils";

const schema = z.object({
  username: z.string().trim().min(1, "Enter your username."),
  password: z.string().min(1, "Enter your password."),
});

type FormValues = z.infer<typeof schema>;

function SignInPanel() {
  const tokens = useMotionTokens();
  const layers = [
    { y: 300, width: 300 },
    { y: 230, width: 236 },
    { y: 160, width: 172 },
    { y: 90, width: 108 },
  ];
  return (
    <div className="relative hidden overflow-hidden bg-brand-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <svg viewBox="0 0 400 400" className="absolute top-1/2 right-0 h-auto w-[78%] max-w-xl -translate-y-[62%]" aria-hidden="true">
        {layers.map((layer, index) => (
          <motion.rect
            key={layer.y}
            x={40}
            y={layer.y}
            width={layer.width}
            height={44}
            rx={8}
            className={index === layers.length - 1 ? "fill-brand-400" : "fill-brand-300/25"}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: tokens.slow, delay: index * tokens.layerStagger * 2, ease: tokens.easeEmphasized }}
          />
        ))}
      </svg>
      <p className="relative text-caption uppercase text-brand-300">Strata</p>
      <div className="relative max-w-md">
        <p className="text-h2 text-white">Every layer scored from the parts up, with the path back to each one.</p>
      </div>
    </div>
  );
}

export function SignInScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { hydrated, isAuthenticated } = useSession();
  const signIn = useSignIn();
  const [showPassword, setShowPassword] = useState(false);
  const errorId = useId();
  const expired = params.get("code") === "401";
  const next = params.get("next");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (hydrated && isAuthenticated) router.replace(next || DASHBOARD_PATH);
  }, [hydrated, isAuthenticated, next, router]);

  const failure = signIn.error;
  const failureMessage =
    failure instanceof ApiError && failure.status === 401
      ? "That username and password do not match."
      : failure instanceof ApiError && failure.status >= 500
        ? "The service is not responding right now."
        : failure
          ? failure.message
          : null;

  const onSubmit = (values: FormValues) => {
    signIn.mutate(values, {
      onSuccess: () => {
        if (next) router.replace(next);
      },
    });
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Strata home" className="rounded-sm">
            <Wordmark size={28} />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="flex w-full max-w-sm flex-col gap-6"
            aria-describedby={failureMessage ? errorId : undefined}
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-h1">Welcome back</h1>
              <p className="text-body text-foreground-muted">Sign in to open your projects.</p>
            </div>
            {expired && !failureMessage ? (
              <p className="rounded-sm bg-accent px-3 py-2 text-body-sm text-accent-foreground" role="status">
                Your session has ended. Sign in again to continue.
              </p>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                aria-invalid={form.formState.errors.username ? true : undefined}
                aria-describedby={form.formState.errors.username ? "username-error" : undefined}
                {...form.register("username")}
              />
              {form.formState.errors.username ? (
                <p id="username-error" className="text-body-sm text-danger">
                  {form.formState.errors.username.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10"
                  aria-invalid={form.formState.errors.password ? true : undefined}
                  aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                  {...form.register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-0.5 right-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {form.formState.errors.password ? (
                <p id="password-error" className="text-body-sm text-danger">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            {failureMessage ? (
              <p id={errorId} role="alert" className={cn("rounded-sm bg-danger/10 px-3 py-2 text-body-sm text-danger")}>
                {failureMessage}
              </p>
            ) : null}
            <Button type="submit" size="lg" loading={signIn.isPending} className="w-full">
              <LogIn /> Sign in
            </Button>
          </form>
        </div>
      </div>
      <SignInPanel />
    </main>
  );
}
