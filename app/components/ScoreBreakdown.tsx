import type { ScoreResult } from "@/app/types/lead";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScoreBadge } from "@/app/components/ScoreBadge";
import { cn } from "@/lib/utils";

interface Props {
  score: ScoreResult;
}

const TIER_BAR_COLOR = {
  Hot: "bg-red-500",
  Warm: "bg-orange-400",
  Cold: "bg-slate-400",
};

export function ScoreBreakdown({ score }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Score: {score.total}/100
          </span>
          <ScoreBadge tier={score.tier} score={score.total} />
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full transition-all", TIER_BAR_COLOR[score.tier])}
            style={{ width: `${score.total}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Hot ≥75 · Warm 50–74 · Cold &lt;50
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Factor</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead className="w-28">Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {score.factors.map((factor) => (
            <TableRow key={factor.name}>
              <TableCell className="font-medium text-sm">{factor.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{factor.value}</TableCell>
              <TableCell className="text-right text-sm">
                {factor.points}/{factor.maxPoints}
              </TableCell>
              <TableCell>
                <Progress
                  value={(factor.points / factor.maxPoints) * 100}
                  className="h-2"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="space-y-1">
        {score.factors.map((factor) => (
          <p key={factor.name} className="text-xs text-muted-foreground">
            <span className="font-medium">{factor.name}:</span> {factor.explanation}
          </p>
        ))}
      </div>
    </div>
  );
}
