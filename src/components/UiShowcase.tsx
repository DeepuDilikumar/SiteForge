"use client";

import { useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WebsiteBadge } from "@/components/WebsiteBadge";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge, Chip } from "@/components/ui/Chip";
import { Dialog } from "@/components/ui/Dialog";
import { Menu } from "@/components/ui/Menu";
import { SearchBox } from "@/components/ui/SearchBox";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusChip, StatusSelect } from "@/components/ui/StatusSelect";
import { Tabs } from "@/components/ui/Tabs";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { Wordmark } from "@/components/ui/Logo";
import type { LeadStatus } from "@/lib/db/schema";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border py-8">
      <h2 className="mb-4 text-lg font-medium text-text">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

export function UiShowcase() {
  const toast = useToast();
  const [dialog, setDialog] = useState(false);
  const [tab, setTab] = useState<"a" | "b" | "c">("a");
  const [status, setStatus] = useState<LeadStatus>("site_ready");
  const [chip, setChip] = useState(true);

  return (
    <main className="mx-auto max-w-[960px] px-4 py-8">
      <div className="flex items-center justify-between">
        <Wordmark />
        <ThemeToggle initial="light" />
      </div>
      <Block title="Buttons">
        <Button>Primary</Button>
        <Button variant="tonal">Tonal</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
        <Button icon="link">With icon</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button size="lg">Large</Button>
        <IconButton icon="more_vert" label="More" />
      </Block>
      <Block title="Search box">
        <div className="w-full">
          <SearchBox size="hero" onSearch={(what, where) => toast(`Search: ${what} in ${where}`)} />
        </div>
        <div className="w-full max-w-[620px]">
          <SearchBox size="compact" defaultWhat="plumbers" defaultWhere="Kochi" onSearch={(what, where) => toast(`Search: ${what} in ${where}`)} />
        </div>
      </Block>
      <Block title="Chips and badges">
        <Chip selected={chip} onClick={() => setChip(!chip)}>Selectable</Chip>
        <Chip icon="search">Suggestion</Chip>
        <Chip disabled>Disabled</Chip>
        <WebsiteBadge status="none" />
        <WebsiteBadge status="social_only" />
        <WebsiteBadge status="has_site" />
        <Badge tone="success">Success</Badge>
      </Block>
      <Block title="Tabs">
        <Tabs label="Example" value={tab} onChange={setTab} items={[{ id: "a", label: "All", count: 4 }, { id: "b", label: "Site ready", count: 2 }, { id: "c", label: "Won", count: 1 }]} />
      </Block>
      <Block title="Status">
        <StatusSelect value={status} onChange={setStatus} label="Status" />
        <StatusSelect value="won" onChange={() => {}} label="Disabled status" disabled />
        <StatusChip status="contacted" />
        <StatusChip status="lost" />
      </Block>
      <Block title="Menu, dialog, toast">
        <Menu
          align="start"
          items={[
            { label: "Edit text", icon: "edit", onSelect: () => toast("Edit text") },
            { label: "Disabled item", icon: "lock", onSelect: () => {}, disabled: true },
            { kind: "divider" },
            { label: "Unpublish", icon: "link_off", onSelect: () => toast("Unpublish"), danger: true },
          ]}
          trigger={(props) => <Button {...props} variant="outlined" trailingIcon="expand_more">Open menu</Button>}
        />
        <Button variant="tonal" onClick={() => setDialog(true)}>Open dialog</Button>
        <Button variant="tonal" onClick={() => toast("Marked as contacted", { label: "Undo", onClick: () => toast("Undone") })}>Show toast</Button>
        <Dialog
          open={dialog}
          onClose={() => setDialog(false)}
          title="Live links are part of Pro."
          description="Dialogs trap focus, close on Esc and return focus to the trigger."
          actions={<><Button variant="text" onClick={() => setDialog(false)}>Not now</Button><Button onClick={() => setDialog(false)}>Upgrade to Pro</Button></>}
        />
      </Block>
      <Block title="Fields">
        <TextField label="Name" placeholder="Your name" className="w-72" />
        <TextField label="With error" defaultValue="x" error="Use at least 8 characters." className="w-72" />
      </Block>
      <Block title="Skeleton">
        <div className="w-full">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
      </Block>
    </main>
  );
}
