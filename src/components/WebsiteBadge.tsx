import { Badge } from "@/components/ui/Chip";
import type { WebsiteStatus } from "@/lib/db/schema";

export function WebsiteBadge({ status }: { status: WebsiteStatus }) {
  switch (status) {
    case "none":
      return <Badge tone="strong">No website</Badge>;
    case "social_only":
      return <Badge tone="warning">Social page only</Badge>;
    case "weak":
      return <Badge tone="muted">Basic website</Badge>;
    case "has_site":
      return <Badge tone="muted">Has a website</Badge>;
  }
}
