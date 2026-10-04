"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ScaledFrame } from "@/components/ScaledFrame";
import { SuggestionChips } from "@/components/SuggestionChips";
import { Icon } from "@/components/ui/Icon";
import { SearchBox } from "@/components/ui/SearchBox";
import { STATUS_LABELS, StatusSelect } from "@/components/ui/StatusSelect";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/client-api";
import type { LeadStatus, TemplateId } from "@/lib/db/schema";
import { relativeTime } from "@/lib/relative-time";

export type PipelineRow = {
  leadId: string;
  siteId: string;
  name: string;
  city: string;
  template: TemplateId;
  status: LeadStatus;
  published: boolean;
  updatedAt: string;
  version: number;
};

type Tab = "all" | "site_ready" | "contacted" | "won";

const TEMPLATE_NAMES: Record<TemplateId, string> = { legacy: "Legacy", modern: "Modern", bold: "Bold" };

export function Pipeline({ rows: initialRows, firstName }: { rows: PipelineRow[]; firstName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState<Tab>("all");

  const counts = useMemo(
    () => ({
      all: rows.length,
      site_ready: rows.filter((row) => row.status === "site_ready").length,
      contacted: rows.filter((row) => row.status === "contacted").length,
      won: rows.filter((row) => row.status === "won").length,
    }),
    [rows],
  );

  const visible = tab === "all" ? rows : rows.filter((row) => row.status === tab);

  const setStatus = async (row: PipelineRow, status: LeadStatus, undoable = true) => {
    const previous = row.status;
    setRows((current) => current.map((item) => (item.leadId === row.leadId ? { ...item, status, updatedAt: new Date().toISOString() } : item)));
    const result = await api(`/api/leads/${row.leadId}`, { method: "PATCH", body: { status } });
    if (!result.ok) {
      setRows((current) => current.map((item) => (item.leadId === row.leadId ? { ...item, status: previous } : item)));
      toast(result.error.message);
      return;
    }
    if (undoable) {
      toast(`${row.name} moved to ${STATUS_LABELS[status]}`, {
        label: "Undo",
        onClick: () => void setStatus({ ...row, status }, previous, false),
      });
    }
    router.refresh();
  };

  if (rows.length === 0) {
    return (
      <div className="mx-auto flex max-w-[720px] flex-col items-center pt-[8vh] text-center">
        <h1 className="text-2xl font-normal text-text">Welcome, {firstName}</h1>
        <p className="mt-4 max-w-[480px] text-base text-text-2">
          Your pipeline is empty. Search for a business type and city to find your first lead.
        </p>
        <div className="mt-8 w-full">
          <SearchBox size="hero" autoFocus />
        </div>
        <SuggestionChips className="mt-6" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mx-auto max-w-[720px]">
        <SearchBox size="hero" />
      </div>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-xl font-normal text-text">Pipeline</h1>
      </div>
      <Tabs
        className="mt-4"
        label="Filter pipeline"
        value={tab}
        onChange={setTab}
        items={[
          { id: "all", label: "All", count: counts.all },
          { id: "site_ready", label: "Site ready", count: counts.site_ready },
          { id: "contacted", label: "Contacted", count: counts.contacted },
          { id: "won", label: "Won", count: counts.won },
        ]}
      />

      {visible.length === 0 ? (
        <p className="mt-8 rounded-xl bg-surface px-6 py-8 text-center text-base text-text-2">
          Nothing here yet. Leads move here when you change their status.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {visible.map((row) => (
            <li key={row.leadId} className="group relative flex items-center gap-4 px-4 py-3 transition-colors duration-200 ease-standard hover:bg-surface">
              <div className="w-24 flex-none overflow-hidden rounded-sm border border-border sm:w-28">
                <ScaledFrame src={`/api/sites/${row.siteId}/preview?v=${row.version}`} title="" viewportWidth={1280} aspect={0.62} />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/sites/${row.siteId}`} className="block truncate text-base text-text after:absolute after:inset-0 hover:underline">
                  {row.name}
                </Link>
                <p className="mt-1 truncate text-sm text-text-2">
                  {row.city} · {TEMPLATE_NAMES[row.template]}
                  <span className="sm:hidden" suppressHydrationWarning> · {relativeTime(row.updatedAt)}</span>
                </p>
              </div>
              <span className="hidden w-8 flex-none justify-center sm:flex">
                {row.published ? (
                  <span title="Live link is on" aria-label="Live link is on" role="img">
                    <Icon name="link" className="text-accent" />
                  </span>
                ) : null}
              </span>
              <span className="relative z-10 flex-none">
                <StatusSelect value={row.status} label={`Status for ${row.name}`} onChange={(status) => void setStatus(row, status)} />
              </span>
              <span className="hidden w-28 flex-none text-right text-sm text-text-2 sm:block" suppressHydrationWarning>{relativeTime(row.updatedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
