"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/client-api";
import type { Channel, LeadStatus } from "@/lib/db/schema";
import { SidePanel } from "./SidePanel";

type Draft = { subject: string | null; body: string; whatsappNumber: string | null };
type DraftState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; draft: Draft };

type OutreachPanelProps = {
  siteId: string;
  businessName: string;
  leadStatus: LeadStatus;
  onMarkContacted: () => Promise<boolean>;
  onClose: () => void;
};

export function OutreachPanel({ siteId, businessName, leadStatus, onMarkContacted, onClose }: OutreachPanelProps) {
  const toast = useToast();
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [drafts, setDrafts] = useState<Partial<Record<Channel, DraftState>>>({});
  const [askContacted, setAskContacted] = useState(false);
  const [marking, setMarking] = useState(false);

  const generate = useCallback(
    async (target: Channel) => {
      setDrafts((current) => ({ ...current, [target]: { status: "loading" } }));
      const result = await api<Draft>(`/api/sites/${siteId}/outreach`, { body: { channel: target } });
      setDrafts((current) => ({
        ...current,
        [target]: result.ok ? { status: "ready", draft: result.data } : { status: "error", message: result.error.message },
      }));
    },
    [siteId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- draft a message the first time a channel is opened
    if (!drafts[channel]) void generate(channel);
  }, [channel, drafts, generate]);

  const state = drafts[channel];
  const draft = state?.status === "ready" ? state.draft : null;
  const update = (patch: Partial<Draft>) =>
    setDrafts((current) => {
      const existing = current[channel];
      return existing?.status === "ready" ? { ...current, [channel]: { status: "ready", draft: { ...existing.draft, ...patch } } } : current;
    });

  const afterSend = () => {
    if (leadStatus === "site_ready") setAskContacted(true);
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(label);
      afterSend();
    } catch {
      toast("Couldn't copy. Select the text and copy it manually.");
    }
  };

  const openWhatsApp = () => {
    if (!draft) return;
    const base = draft.whatsappNumber ? `https://wa.me/${draft.whatsappNumber}` : "https://wa.me/";
    window.open(`${base}?text=${encodeURIComponent(draft.body)}`, "_blank", "noopener,noreferrer");
    afterSend();
  };

  const openMail = () => {
    if (!draft) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(draft.subject ?? "")}&body=${encodeURIComponent(draft.body)}`;
    afterSend();
  };

  return (
    <SidePanel title="Send to owner" onClose={onClose}>
      <div className="px-4 pt-4">
        <Tabs
          label="Channel"
          value={channel}
          onChange={setChannel}
          items={[
            { id: "whatsapp", label: "WhatsApp" },
            { id: "email", label: "Email" },
          ]}
        />
        <p className="mt-4 text-sm text-text-2">
          A first message to {businessName} with your live link. Edit it so it sounds like you.
        </p>
      </div>

      <div className="px-4 py-4">
        {!state || state.status === "loading" ? (
          <div aria-busy="true" aria-label="Drafting message" className="flex flex-col gap-3">
            {channel === "email" ? <Skeleton className="h-12 w-full" /> : null}
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        ) : state.status === "error" ? (
          <div role="alert" className="rounded-lg border border-border p-4">
            <p className="flex items-center gap-2 text-sm text-text">
              <Icon name="error" className="text-danger" />
              {state.message}
            </p>
            <Button variant="tonal" icon="refresh" className="mt-4" onClick={() => void generate(channel)}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {channel === "email" ? (
              <TextField label="Subject" value={draft?.subject ?? ""} maxLength={80} onChange={(e) => update({ subject: e.target.value })} />
            ) : null}
            <TextField
              label="Message"
              multiline
              rows={channel === "email" ? 12 : 9}
              textareaProps={{ value: draft?.body ?? "", onChange: (e) => update({ body: e.target.value }) }}
            />
            {channel === "whatsapp" ? (
              <>
                {!draft?.whatsappNumber ? (
                  <p className="text-sm text-text-2">No phone number on file. WhatsApp will ask you to choose a contact.</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button icon="chat" onClick={openWhatsApp}>
                    Open WhatsApp
                  </Button>
                  <Button variant="outlined" icon="content_copy" onClick={() => draft && void copy(draft.body, "Message copied")}>
                    Copy
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  icon="content_copy"
                  onClick={() => draft && void copy(`Subject: ${draft.subject ?? ""}\n\n${draft.body}`, "Email copied")}
                >
                  Copy email
                </Button>
                <Button variant="outlined" icon="mail" onClick={openMail}>
                  Open in mail app
                </Button>
              </div>
            )}
            <Button variant="text" icon="refresh" className="self-start" onClick={() => void generate(channel)}>
              Write a new draft
            </Button>
          </div>
        )}

        {askContacted ? (
          <div role="status" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3">
            <span className="text-sm text-text">Mark as contacted?</span>
            <span className="flex gap-1">
              <Button variant="text" onClick={() => setAskContacted(false)}>
                Not yet
              </Button>
              <Button
                variant="tonal"
                loading={marking}
                onClick={async () => {
                  setMarking(true);
                  const done = await onMarkContacted();
                  setMarking(false);
                  if (done) setAskContacted(false);
                }}
              >
                Yes
              </Button>
            </span>
          </div>
        ) : null}
      </div>
    </SidePanel>
  );
}
