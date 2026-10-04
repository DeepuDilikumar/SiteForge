import { verifiedHighlights } from "./copy-facts";
import { GeminiCopyProvider } from "./gemini";
import { MockCopyProvider } from "./mock";
import type { OutreachDraft, SectionId, SectionPatch, SiteContent } from "./schemas";
import { AiError, type CopyProvider, type OutreachInput, type SectionCopyInput, type SiteCopyInput } from "./types";

export function isMockAi(): boolean {
  return !process.env.GEMINI_API_KEY;
}

function baseProvider(): CopyProvider {
  const key = process.env.GEMINI_API_KEY;
  return key ? new GeminiCopyProvider(key, process.env.GEMINI_MODEL) : new MockCopyProvider();
}

/** Used by journey QA to rehearse an AI outage. Never active in production. */
class FailingCopyProvider implements CopyProvider {
  readonly kind = "mock" as const;
  private fail(): never {
    throw new AiError("Simulated AI failure.", "simulated_failure");
  }
  async generateSiteContent(): Promise<SiteContent> {
    return this.fail();
  }
  async regenerateSection<S extends SectionId>(): Promise<SectionPatch[S]> {
    return this.fail();
  }
  async draftOutreach(): Promise<OutreachDraft> {
    return this.fail();
  }
}

export type CopyService = {
  readonly kind: CopyProvider["kind"];
  generateSiteContent(input: SiteCopyInput): Promise<SiteContent>;
  regenerateSection<S extends SectionId>(input: SectionCopyInput<S>): Promise<SectionPatch[S]>;
  draftOutreach(input: OutreachInput): Promise<OutreachDraft>;
};

/**
 * Every AI call goes through here. Providers return schema-valid JSON; this layer adds the
 * guardrails that need business data, such as checking that review quotes are real.
 */
export function getCopyService(options: { simulateFailure?: boolean } = {}): CopyService {
  const provider =
    options.simulateFailure && process.env.NODE_ENV !== "production" ? new FailingCopyProvider() : baseProvider();
  return {
    kind: provider.kind,
    async generateSiteContent(input) {
      const content = await provider.generateSiteContent(input);
      return { ...content, reviewHighlights: verifiedHighlights(content.reviewHighlights, input.business.reviews) };
    },
    regenerateSection: (input) => provider.regenerateSection(input),
    draftOutreach: (input) => provider.draftOutreach(input),
  };
}

export { AiError };
