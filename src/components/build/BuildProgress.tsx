"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { BUILD_STAGE_LABELS, type BuildStageId } from "@/components/build/stages";

export type StageState = "pending" | "active" | "done" | "failed";

type BuildProgressProps = {
  businessName: string;
  stages: Record<BuildStageId, StageState>;
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
};

function StageIcon({ state }: { state: StageState }) {
  if (state === "done") return <Icon name="check_circle" filled className="text-success" size={24} />;
  if (state === "active") return <Icon name="progress_activity" className="animate-spin-slow text-accent" size={24} />;
  if (state === "failed") return <Icon name="error" className="text-danger" size={24} />;
  return <span className="block h-6 w-6 rounded-full border-2 border-border" aria-hidden="true" />;
}

export function BuildProgress({ businessName, stages, error, onRetry, onBack }: BuildProgressProps) {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-[440px] flex-col justify-center py-12" aria-live="polite">
      <h1 className="text-2xl font-normal text-text">{error ? "Build stopped" : `Building ${businessName}`}</h1>
      <p className="mt-2 text-base text-text-2">
        {error ? error : "This usually takes under 30 seconds. Keep this tab open."}
      </p>
      <ol className="mt-8 flex flex-col gap-1">
        {(Object.keys(BUILD_STAGE_LABELS) as BuildStageId[]).map((stage) => {
          const state = stages[stage];
          return (
            <li key={stage} className="flex h-12 items-center gap-4">
              <StageIcon state={state} />
              <span className={`text-base ${state === "pending" ? "text-text-2" : "text-text"}`}>{BUILD_STAGE_LABELS[stage]}</span>
              <span className="sr-only">
                {state === "done" ? "done" : state === "active" ? "in progress" : state === "failed" ? "failed" : "waiting"}
              </span>
            </li>
          );
        })}
      </ol>
      {error ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <Button onClick={onRetry} icon="refresh">
            Try again
          </Button>
          <Button variant="text" onClick={onBack}>
            Change options
          </Button>
        </div>
      ) : null}
    </div>
  );
}
