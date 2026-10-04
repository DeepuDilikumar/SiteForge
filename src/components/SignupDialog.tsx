"use client";

import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Dialog } from "@/components/ui/Dialog";

/**
 * Shown when a signed-out visitor clicks "Build site". The intent travels with the form:
 * after signing up or in, they land straight on the build page for this business.
 */
export function SignupDialog({ business, onClose }: { business: { id: string; name: string } | null; onClose: () => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  return (
    <Dialog
      open={Boolean(business)}
      onClose={onClose}
      title={mode === "signup" ? "Create your free account" : "Sign in to continue"}
      description={
        business ? (
          <>
            {mode === "signup" ? "Create a free account to build a site for " : "Sign in to build a site for "}
            <span className="font-medium text-text">{business.name}</span>.
          </>
        ) : null
      }
    >
      {business ? <AuthForm key={mode} mode={mode} next={`/build/${business.id}`} onModeChange={setMode} /> : null}
    </Dialog>
  );
}
