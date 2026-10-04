"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { authClient } from "@/lib/auth-client";

type Mode = "signup" | "login";
type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

type AuthFormProps = {
  mode: Mode;
  next: string;
  onModeChange?: (mode: Mode) => void;
  onSuccess?: () => void;
};

function validate(mode: Mode, values: { name: string; email: string; password: string }): Errors {
  const errors: Errors = {};
  if (mode === "signup" && !values.name.trim()) errors.name = "Enter your name. Business owners will see it in your messages.";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.password.length < 8) errors.password = mode === "signup" ? "Use at least 8 characters." : "Enter your password.";
  return errors;
}

export function AuthForm({ mode, next, onModeChange, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(mode, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setPending(true);
    const result = isSignup
      ? await authClient.signUp.email({ name: values.name.trim(), email: values.email.trim(), password: values.password })
      : await authClient.signIn.email({ email: values.email.trim(), password: values.password });
    if (result.error) {
      setPending(false);
      const code = result.error.code ?? "";
      if (/USER_ALREADY_EXISTS/.test(code)) setErrors({ email: "An account with this email already exists. Sign in instead." });
      else if (/INVALID_EMAIL_OR_PASSWORD|INVALID_PASSWORD|USER_NOT_FOUND/.test(code)) setErrors({ form: "That email and password don't match. Check them and try again." });
      else setErrors({ form: result.error.message || "We couldn't sign you in. Try again." });
      return;
    }
    if (onSuccess) onSuccess();
    router.push(next);
    router.refresh();
  };

  const switchHref = `${isSignup ? "/login" : "/signup"}?next=${encodeURIComponent(next)}`;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {isSignup ? (
        <TextField label="Your name" name="name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />
      ) : null}
      <TextField label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        value={values.password}
        onChange={set("password")}
        error={errors.password}
        hint={isSignup ? "At least 8 characters." : undefined}
      />
      {errors.form ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {errors.form}
        </p>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-4">
        {onModeChange ? (
          <button
            type="button"
            onClick={() => onModeChange(isSignup ? "login" : "signup")}
            className="rounded-full px-1 text-sm font-medium text-accent hover:underline"
          >
            {isSignup ? "Sign in instead" : "Create account"}
          </button>
        ) : (
          <Link href={switchHref} className="rounded-full px-1 text-sm font-medium text-accent hover:underline">
            {isSignup ? "Sign in instead" : "Create account"}
          </Link>
        )}
        <Button type="submit" loading={pending}>
          {isSignup ? "Create account" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
