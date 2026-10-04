"use client";

import { useRouter } from "next/navigation";
import { Menu } from "@/components/ui/Menu";
import { authClient } from "@/lib/auth-client";
import type { Plan } from "@/lib/db/schema";

export function Avatar({ name, size = 32 }: { name: string; size?: 32 | 40 | 64 }) {
  const letter = name.trim().charAt(0).toUpperCase() || "S";
  const text = size === 64 ? "text-2xl" : size === 40 ? "text-base" : "text-sm";
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-flex flex-none items-center justify-center rounded-full bg-[#7b1fa2] font-medium text-white ${text}`}
    >
      {letter}
    </span>
  );
}

export function AccountMenu({ name, email, plan }: { name: string; email: string; plan: Plan }) {
  const router = useRouter();
  return (
    <Menu
      items={[
        {
          kind: "header",
          content: (
            <div className="flex items-center gap-3">
              <Avatar name={name} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{name}</p>
                <p className="truncate text-sm text-text-2">{email}</p>
              </div>
            </div>
          ),
        },
        { kind: "divider" },
        { label: "Account", icon: "account_circle", onSelect: () => router.push("/account") },
        {
          label: "Plan & billing",
          icon: "credit_card",
          onSelect: () => router.push("/account#plan"),
          trailing: <span className="text-sm text-text-2">{plan === "pro" ? "Pro" : "Free"}</span>,
        },
        { kind: "divider" },
        {
          label: "Sign out",
          icon: "logout",
          onSelect: async () => {
            await authClient.signOut();
            router.push("/");
            router.refresh();
          },
        },
      ]}
      trigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label={`Account: ${name}`}
          className="rounded-full p-1 transition-colors duration-200 ease-standard hover:bg-surface-2"
        >
          <Avatar name={name} />
        </button>
      )}
    />
  );
}
