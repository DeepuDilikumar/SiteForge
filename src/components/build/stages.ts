export type BuildStageId = "reading" | "writing" | "designing" | "checks";

export const BUILD_STAGE_LABELS: Record<BuildStageId, string> = {
  reading: "Reading reviews",
  writing: "Writing copy",
  designing: "Designing layout",
  checks: "Final checks",
};
