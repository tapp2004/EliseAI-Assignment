import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  tier: "Hot" | "Warm" | "Cold";
  score?: number;
}

const TIER_STYLES = {
  Hot: "bg-red-500 hover:bg-red-600 text-white border-transparent",
  Warm: "bg-orange-400 hover:bg-orange-500 text-white border-transparent",
  Cold: "bg-slate-400 hover:bg-slate-500 text-white border-transparent",
};

export function ScoreBadge({ tier, score }: Props) {
  return (
    <Badge className={cn(TIER_STYLES[tier])}>
      {tier}{score !== undefined ? ` · ${score}` : ""}
    </Badge>
  );
}
