"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";

export type UpgradeTrigger = "limit" | "publish" | "export" | "outreach" | "regenerate";

const TITLES: Record<UpgradeTrigger, string> = {
  limit: "You've used your free site for this month.",
  publish: "Live links are part of Pro.",
  export: "Downloading code is part of Pro.",
  outreach: "Message drafts are part of Pro.",
  regenerate: "You've used the free rewrites for this site.",
};

const BENEFITS = [
  "Build as many sites as you need, every month.",
  "Share live links with no SiteForge badge.",
  "Download the code and draft WhatsApp or email messages.",
];

export function upgradeHref(trigger: UpgradeTrigger, next: string) {
  return `/pricing?${new URLSearchParams({ from: trigger, next })}`;
}

type UpgradeDialogProps = {
  trigger: UpgradeTrigger | null;
  onClose: () => void;
  price: string;
  /** Where to come back to after checkout, including what to resume. */
  next: string;
};

export function UpgradeDialog({ trigger, onClose, price, next }: UpgradeDialogProps) {
  const router = useRouter();
  return (
    <Dialog
      open={Boolean(trigger)}
      onClose={onClose}
      title={trigger ? TITLES[trigger] : ""}
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            Not now
          </Button>
          <Button onClick={() => trigger && router.push(upgradeHref(trigger, next))}>Upgrade to Pro</Button>
        </>
      }
    >
      <ul className="flex flex-col gap-3">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex gap-3 text-base text-text">
            <Icon name="check" className="mt-[2px] text-accent" />
            {benefit}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-base text-text">
        <span className="text-xl">{price}</span> <span className="text-text-2">a month. Cancel anytime.</span>
      </p>
    </Dialog>
  );
}
