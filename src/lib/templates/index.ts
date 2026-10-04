import type { TemplateId } from "@/lib/db/schema";
import { boldTemplate } from "./bold";
import { legacyTemplate } from "./legacy";
import { modernTemplate } from "./modern";
import type { TemplateDefinition } from "./types";

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  legacy: legacyTemplate,
  modern: modernTemplate,
  bold: boldTemplate,
};

export const TEMPLATE_LIST: TemplateDefinition[] = [legacyTemplate, modernTemplate, boldTemplate];

export type { TemplateDefinition, TemplateOptions } from "./types";
