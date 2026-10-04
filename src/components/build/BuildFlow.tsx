"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BuildProgress, type StageState } from "@/components/build/BuildProgress";
import { Customize } from "@/components/build/Customize";
import { TemplatePicker } from "@/components/build/TemplatePicker";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { BuildEvent, BuildStage } from "@/lib/build";
import type { AccentColor } from "@/lib/categories";
import type { TemplateId, Tone } from "@/lib/db/schema";
import type { Result } from "@/lib/result";

export type BuildBusiness = {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number | null;
  reviewCount: number;
  reviews: Array<{ text: string; author: string }>;
};

type Selection = { template: TemplateId; tone: Tone; accent: AccentColor };

type BuildFlowProps = {
  business: BuildBusiness;
  recommendedTemplate: TemplateId;
  recommendedAccent: AccentColor;
  initial: Selection;
  resume: boolean;
  canBuild: boolean;
  remainingFree: number | null;
  price: string;
  existingSiteId: string | null;
};

type Phase = { kind: "choose" } | { kind: "building"; stages: Record<BuildStage, StageState> } | { kind: "failed"; message: string; stages: Record<BuildStage, StageState> };

const IDLE_STAGES: Record<BuildStage, StageState> = { reading: "pending", writing: "pending", designing: "pending", checks: "pending" };

export function BuildFlow(props: BuildFlowProps) {
  const { business, canBuild, remainingFree, price } = props;
  const router = useRouter();
  const [selection, setSelection] = useState<Selection>(props.initial);
  const [phase, setPhase] = useState<Phase>({ kind: "choose" });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const resumed = useRef(false);

  const resumeHref = `/build/${business.id}?${new URLSearchParams({ resume: "build", ...selection })}`;

  const start = useCallback(async () => {
    if (!canBuild) {
      setUpgradeOpen(true);
      return;
    }
    let stages = { ...IDLE_STAGES };
    setPhase({ kind: "building", stages });
    const fail = (message: string) => setPhase({ kind: "failed", message, stages });
    try {
      const response = await fetch("/api/sites/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, ...selection }),
      });
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as Result<never> | null;
        if (body && !body.ok && body.error.code === "limit_reached") {
          setPhase({ kind: "choose" });
          setUpgradeOpen(true);
          return;
        }
        fail(body && !body.ok ? body.error.message : "We couldn't build this site. Your free credit wasn't used.");
        return;
      }
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as BuildEvent;
          if (event.type === "stage") {
            stages = { ...stages, [event.stage]: event.status };
            setPhase({ kind: "building", stages });
          } else if (event.type === "done") {
            router.push(`/sites/${event.siteId}?built=1`);
            return;
          } else if (event.type === "error") {
            if (event.code === "limit_reached") {
              setPhase({ kind: "choose" });
              setUpgradeOpen(true);
            } else {
              stages = Object.fromEntries(
                Object.entries(stages).map(([key, state]) => [key, state === "active" ? "failed" : state]),
              ) as Record<BuildStage, StageState>;
              fail(event.message);
            }
            return;
          }
        }
      }
      fail("We couldn't build this site. Your free credit wasn't used.");
    } catch {
      fail("We lost the connection while building. Your free credit wasn't used.");
    }
  }, [business.id, canBuild, router, selection]);

  useEffect(() => {
    if (!props.resume || resumed.current) return;
    resumed.current = true;
    router.replace(`/build/${business.id}`, { scroll: false });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resuming the build the user started before upgrading
    if (canBuild) void start();
  }, [props.resume, canBuild, start, router, business.id]);

  if (phase.kind !== "choose") {
    return (
      <BuildProgress
        businessName={business.name}
        stages={phase.stages}
        error={phase.kind === "failed" ? phase.message : null}
        onRetry={() => void start()}
        onBack={() => setPhase({ kind: "choose" })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <Link href="/dashboard" className="inline-flex items-center gap-1 rounded-full text-sm text-text-2 hover:text-text">
        <Icon name="arrow_back" size={18} />
        Dashboard
      </Link>
      <BusinessSummary business={business} />

      {props.existingSiteId ? (
        <p className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm text-text-2">
          <Icon name="info" size={18} />
          You already built a site for {business.name}.
          <Link href={`/sites/${props.existingSiteId}`} className="font-medium text-accent hover:underline">
            Open it
          </Link>
        </p>
      ) : null}

      <section aria-labelledby="template-title" className="mt-12">
        <h2 id="template-title" className="text-xl font-normal text-text">
          Choose a template
        </h2>
        <p className="mt-1 text-sm text-text-2">Previews use {business.name}&apos;s details. You can switch templates later.</p>
        <TemplatePicker
          businessId={business.id}
          value={selection.template}
          recommended={props.recommendedTemplate}
          accent={selection.accent}
          onChange={(template) => setSelection((current) => ({ ...current, template }))}
        />
      </section>

      <Customize
        accent={selection.accent}
        recommendedAccent={props.recommendedAccent}
        tone={selection.tone}
        onAccent={(accent) => setSelection((current) => ({ ...current, accent }))}
        onTone={(tone) => setSelection((current) => ({ ...current, tone }))}
      />

      <div className="mt-8 flex flex-col items-start gap-2 border-t border-border pt-8">
        <Button size="lg" onClick={() => void start()} icon={canBuild ? undefined : "lock"}>
          Build site
        </Button>
        {remainingFree !== null ? (
          <p className="text-sm text-text-2">
            {remainingFree > 0
              ? `${remainingFree} free site left this month.`
              : "You've used your free site this month. Pro builds as many as you need."}
          </p>
        ) : null}
      </div>

      <UpgradeDialog trigger={upgradeOpen ? "limit" : null} onClose={() => setUpgradeOpen(false)} price={price} next={resumeHref} />
    </div>
  );
}

function BusinessSummary({ business }: { business: BuildBusiness }) {
  return (
    <section aria-label="Business" className="mt-4 rounded-xl border border-border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-text-2">Building a site for</p>
          <h1 className="mt-1 text-2xl font-normal text-text">{business.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-text-2">
            <span>{business.category}</span>
            {business.rating ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-text">
                  {business.rating.toFixed(1)}
                  <Icon name="star" size={16} filled className="text-[#f9ab00]" />
                  <span className="text-text-2">({business.reviewCount} reviews)</span>
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-text-2">{business.address}</p>
        </div>
      </div>
      {business.reviews.length > 0 ? (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {business.reviews.map((review) => (
            <li key={review.author + review.text.slice(0, 12)} className="rounded-lg bg-surface p-4">
              <p className="text-sm text-text">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-2 text-sm text-text-2">{review.author}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
