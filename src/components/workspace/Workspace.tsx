"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { TemplatePicker } from "@/components/build/TemplatePicker";
import { UpgradeDialog, type UpgradeTrigger } from "@/components/UpgradeDialog";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Menu, type MenuItem } from "@/components/ui/Menu";
import { StatusChip } from "@/components/ui/StatusSelect";
import { useToast } from "@/components/ui/Toast";
import type { SectionId, SiteContent, SiteOverrides } from "@/lib/ai/schemas";
import { api } from "@/lib/client-api";
import type { LeadStatus, TemplateId } from "@/lib/db/schema";
import { EditPanel, type SaveState } from "./EditPanel";
import { OutreachPanel } from "./OutreachPanel";
import { PreviewPane } from "./PreviewPane";
import type { Device, WorkspaceBusiness, WorkspaceLead, WorkspacePlan, WorkspaceSite } from "./types";

type Resume = "publish" | "export" | "outreach" | null;

type WorkspaceProps = {
  site: WorkspaceSite;
  business: WorkspaceBusiness;
  lead: WorkspaceLead;
  plan: WorkspacePlan;
  price: string;
  resume: Resume;
};

const SAVE_DELAY_MS = 700;

function normaliseOverrides(overrides: SiteOverrides): SiteOverrides {
  return {
    ...overrides,
    ...(overrides.hours ? { hours: overrides.hours.map((value) => value.trim() || "Closed") } : {}),
  };
}

export function Workspace({ site, business, lead, plan, price, resume }: WorkspaceProps) {
  const router = useRouter();
  const toast = useToast();
  const [content, setContent] = useState<SiteContent>(site.content);
  const [overrides, setOverrides] = useState<SiteOverrides>(site.overrides);
  const [template, setTemplate] = useState<TemplateId>(site.template);
  const [publishedUrl, setPublishedUrl] = useState(site.publishedUrl);
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [regenerationsLeft, setRegenerationsLeft] = useState(plan.regenerationsLeft);
  const [version, setVersion] = useState(() => Date.parse(site.updatedAt));
  const [device, setDevice] = useState<Device>("desktop");
  const [panel, setPanel] = useState<"edit" | "outreach" | null>(null);
  const [upgrade, setUpgrade] = useState<UpgradeTrigger | null>(null);
  const [publishedDialog, setPublishedDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [unpublishDialog, setUnpublishDialog] = useState(false);
  const [busy, setBusy] = useState<"publish" | "unpublish" | "template" | null>(null);
  const [regenerating, setRegenerating] = useState<SectionId | "all" | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const pending = useRef<{ content?: SiteContent; overrides?: SiteOverrides }>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumed = useRef(false);

  const here = `/sites/${site.id}`;

  const flush = useCallback(async () => {
    const body = pending.current;
    pending.current = {};
    if (!body.content && !body.overrides) return;
    setSaveState("saving");
    const result = await api<{ updatedAt: string }>(`/api/sites/${site.id}`, {
      method: "PATCH",
      body: { ...body, ...(body.overrides ? { overrides: normaliseOverrides(body.overrides) } : {}) },
    });
    if (result.ok) {
      setSaveState("saved");
      setVersion(Date.parse(result.data.updatedAt));
    } else {
      setSaveState({ error: `Not saved: ${result.error.message}` });
    }
  }, [site.id]);

  const queueSave = (patch: { content?: SiteContent; overrides?: SiteOverrides }) => {
    pending.current = { ...pending.current, ...patch };
    setSaveState("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const publish = useCallback(async () => {
    if (!plan.canPublish) {
      setUpgrade("publish");
      return;
    }
    setBusy("publish");
    const result = await api<{ url: string }>(`/api/sites/${site.id}/publish`, { method: "POST" });
    setBusy(null);
    if (!result.ok) {
      if (result.error.code === "pro_required") setUpgrade("publish");
      else toast(result.error.message);
      return;
    }
    setPublishedUrl(result.data.url);
    setPublishedDialog(true);
    toast("Live link ready");
  }, [plan.canPublish, site.id, toast]);

  const download = useCallback(() => {
    if (!plan.canExport) {
      setUpgrade("export");
      return;
    }
    const link = document.createElement("a");
    link.href = `/api/sites/${site.id}/export`;
    link.download = "";
    link.click();
    toast("Downloading code");
  }, [plan.canExport, site.id, toast]);

  const sendToOwner = useCallback(() => {
    if (!plan.canDraftOutreach) {
      setUpgrade("outreach");
      return;
    }
    setPublishedDialog(false);
    setPanel("outreach");
  }, [plan.canDraftOutreach]);

  useEffect(() => {
    if (!resume || resumed.current) return;
    resumed.current = true;
    router.replace(here, { scroll: false });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- finishing the action the user started before upgrading
    if (resume === "publish") void publish();
    else if (resume === "export") download();
    else if (resume === "outreach") {
      if (publishedUrl) sendToOwner();
      else void publish();
    }
  }, [resume, publish, download, sendToOwner, publishedUrl, router, here]);

  const regenerate = async (section?: SectionId) => {
    if (regenerationsLeft === 0) {
      setUpgrade("regenerate");
      return;
    }
    await flush();
    setRegenerating(section ?? "all");
    const result = await api<{ content: SiteContent; remaining: number | null; regenerationsUsed: number }>(
      `/api/sites/${site.id}/regenerate`,
      { body: section ? { section } : {} },
    );
    setRegenerating(null);
    if (!result.ok) {
      if (result.error.code === "pro_required") setUpgrade("regenerate");
      else toast(result.error.message);
      return;
    }
    setContent(result.data.content);
    setRegenerationsLeft(result.data.remaining);
    setVersion(Date.now());
    toast(section ? "Section rewritten" : "Copy rewritten");
  };

  const changeTemplate = async (next: TemplateId) => {
    setBusy("template");
    const result = await api(`/api/sites/${site.id}`, { method: "PATCH", body: { template: next } });
    setBusy(null);
    if (!result.ok) {
      toast(result.error.message);
      return;
    }
    setTemplate(next);
    setTemplateDialog(false);
    setVersion(Date.now());
    toast("Template changed");
  };

  const unpublish = async () => {
    setBusy("unpublish");
    const result = await api(`/api/sites/${site.id}/publish`, { method: "DELETE" });
    setBusy(null);
    setUnpublishDialog(false);
    if (!result.ok) {
      toast(result.error.message);
      return;
    }
    setPublishedUrl(null);
    toast("Live link turned off");
  };

  const markContacted = async () => {
    const result = await api(`/api/leads/${lead.id}`, { method: "PATCH", body: { status: "contacted" } });
    if (!result.ok) {
      toast(result.error.message);
      return false;
    }
    setStatus("contacted");
    toast("Marked as contacted");
    router.refresh();
    return true;
  };

  const lockIcon = (allowed: boolean) => (allowed ? undefined : <Icon name="lock" size={18} className="text-text-2" />);

  const menuItems: MenuItem[] = [
    { label: "Edit text", icon: "edit", onSelect: () => setPanel("edit") },
    { label: "Change template", icon: "swap_horiz", onSelect: () => setTemplateDialog(true) },
    {
      label: "Regenerate copy",
      icon: "refresh",
      onSelect: () => void regenerate(),
      trailing: regenerationsLeft !== null ? <span className="text-sm text-text-2">{regenerationsLeft} left</span> : undefined,
    },
    { label: "Download code", icon: "download", onSelect: download, trailing: lockIcon(plan.canExport) },
    ...(publishedUrl
      ? ([
          { kind: "divider" },
          { label: "Open live site", icon: "open_in_new", onSelect: () => window.open(publishedUrl, "_blank", "noopener") },
          { label: "Unpublish", icon: "link_off", onSelect: () => setUnpublishDialog(true), danger: true },
        ] satisfies MenuItem[])
      : []),
  ];

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-16 flex-none items-center gap-2 border-b border-border bg-bg px-2 sm:gap-4 sm:px-4">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          title="Back to dashboard"
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-text-2 hover:bg-surface-2 hover:text-text"
        >
          <Icon name="arrow_back" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="truncate text-base font-medium text-text sm:text-lg sm:font-normal">{business.name}</h1>
          <span className="hidden sm:inline-flex">
            <StatusChip status={status} />
          </span>
        </div>

        <div role="radiogroup" aria-label="Preview size" className="hidden flex-none gap-1 rounded-full bg-surface-2 p-1 md:inline-flex">
          {(["desktop", "mobile"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={device === item}
              onClick={() => setDevice(item)}
              className={`flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors duration-200 ease-standard ${
                device === item ? "bg-bg text-text shadow-1" : "text-text-2 hover:text-text"
              }`}
            >
              <Icon name={item === "desktop" ? "desktop_windows" : "smartphone"} size={18} />
              {item === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          {publishedUrl ? (
            <Button icon="send" onClick={sendToOwner}>
              Send to owner
            </Button>
          ) : (
            <Button icon="link" loading={busy === "publish"} onClick={() => void publish()}>
              Get live link
            </Button>
          )}
          <Menu
            items={menuItems}
            trigger={(props) => (
              <IconButton {...props} icon="more_vert" label="More actions" />
            )}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <PreviewPane siteId={site.id} version={version} device={device} title={`Preview of ${business.name}`} />
          {regenerating === "all" ? (
            <div className="absolute inset-x-0 top-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-bg px-4 py-2 text-sm text-text shadow-2">
                <Icon name="progress_activity" size={18} className="animate-spin-slow text-accent" />
                Rewriting the copy
              </span>
            </div>
          ) : null}
        </div>
        {panel === "edit" ? (
          <EditPanel
            content={content}
            overrides={overrides}
            template={template}
            businessPhone={business.phone}
            businessHours={business.hours}
            onContent={(next) => {
              setContent(next);
              queueSave({ content: next });
            }}
            onOverrides={(next) => {
              setOverrides(next);
              queueSave({ overrides: next });
            }}
            onRegenerate={(section) => void regenerate(section)}
            regenerating={regenerating}
            regenerationsLeft={regenerationsLeft}
            saveState={saveState}
            onClose={() => {
              void flush();
              setPanel(null);
            }}
          />
        ) : null}
        {panel === "outreach" ? (
          <OutreachPanel
            siteId={site.id}
            businessName={business.name}
            leadStatus={status}
            onMarkContacted={markContacted}
            onClose={() => setPanel(null)}
          />
        ) : null}
      </div>

      <div className="flex flex-none justify-center border-t border-border bg-bg p-2 md:hidden">
        <div role="radiogroup" aria-label="Preview size" className="inline-flex gap-1 rounded-full bg-surface-2 p-1">
          {(["desktop", "mobile"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={device === item}
              onClick={() => setDevice(item)}
              className={`flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium ${device === item ? "bg-bg text-text shadow-1" : "text-text-2"}`}
            >
              <Icon name={item === "desktop" ? "desktop_windows" : "smartphone"} size={18} />
              {item === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>
      </div>

      <UpgradeDialog
        trigger={upgrade}
        onClose={() => setUpgrade(null)}
        price={price}
        next={upgrade === "publish" || upgrade === "export" || upgrade === "outreach" ? `${here}?resume=${upgrade}` : here}
      />

      <Dialog
        open={publishedDialog}
        onClose={() => setPublishedDialog(false)}
        title="Live link ready"
        description={`Anyone with this link can see ${business.name}'s new site.`}
        actions={
          <>
            <Button variant="text" onClick={() => setPublishedDialog(false)}>
              Done
            </Button>
            <Button icon="send" onClick={sendToOwner}>
              Send to owner
            </Button>
          </>
        }
      >
        {publishedUrl ? (
          <div className="flex items-center gap-2 rounded-full border border-border py-1 pr-1 pl-4">
            <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm text-accent hover:underline">
              {publishedUrl}
            </a>
            <Button
              variant="tonal"
              icon="content_copy"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(publishedUrl);
                  toast("Link copied");
                } catch {
                  toast("Couldn't copy. Select the link and copy it manually.");
                }
              }}
            >
              Copy
            </Button>
          </div>
        ) : null}
      </Dialog>

      {templateDialog ? (
        <TemplateDialog
          open
          businessId={business.id}
          current={template}
          accent={site.accent}
          recommended={business.recommendedTemplate}
          busy={busy === "template"}
          onClose={() => setTemplateDialog(false)}
          onApply={(id) => void changeTemplate(id)}
        />
      ) : null}

      <Dialog
        open={unpublishDialog}
        onClose={() => setUnpublishDialog(false)}
        title="Turn off the live link?"
        description="The link will stop working for anyone you've sent it to. You can get a new live link later."
        actions={
          <>
            <Button variant="text" onClick={() => setUnpublishDialog(false)}>
              Cancel
            </Button>
            <Button loading={busy === "unpublish"} onClick={() => void unpublish()}>
              Unpublish
            </Button>
          </>
        }
      />
    </div>
  );
}

function TemplateDialog({
  open,
  businessId,
  current,
  accent,
  recommended,
  busy,
  onClose,
  onApply,
}: {
  open: boolean;
  businessId: string;
  current: TemplateId;
  accent: string;
  recommended: TemplateId;
  busy: boolean;
  onClose: () => void;
  onApply: (template: TemplateId) => void;
}) {
  const [choice, setChoice] = useState<TemplateId>(current);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Change template"
      description="Your text and settings stay the same. Only the design changes."
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={choice === current} onClick={() => onApply(choice)}>
            Use {choice.charAt(0).toUpperCase() + choice.slice(1)}
          </Button>
        </>
      }
    >
      <TemplatePicker businessId={businessId} value={choice} recommended={recommended} accent={accent} onChange={setChoice} />
    </Dialog>
  );
}
