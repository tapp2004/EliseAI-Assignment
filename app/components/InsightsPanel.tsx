import type { EnrichedLead } from "@/app/types/lead";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface Props {
  lead: EnrichedLead;
}

function formatIncome(income: number): string {
  return `$${income.toLocaleString()}`;
}

export function InsightsPanel({ lead }: Props) {
  const { marketData, news, talkingPoints, errors, company } = lead;

  return (
    <div className="space-y-6">
      {/* Market Data */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Market Data</h3>
        {marketData ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-sm">Population</TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {marketData.population.toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm">Total Housing Units</TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {marketData.totalHousingUnits.toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm">Renter-Occupied %</TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {marketData.renterPct.toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-sm">Median Household Income</TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {formatIncome(marketData.medianHouseholdIncome)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            Market data unavailable for {lead.city}, {lead.state}.
          </p>
        )}
      </div>

      {/* Talking Points */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Talking Points</h3>
        {talkingPoints.length > 0 ? (
          <ul className="space-y-2">
            {talkingPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No talking points generated.</p>
        )}
      </div>

      {/* Recent News */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Recent News</h3>
        {news.length > 0 ? (
          <ul className="space-y-3">
            {news.map((article, i) => (
              <li key={i} className="border rounded-md p-3 space-y-1">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline flex items-start gap-1"
                >
                  {article.title}
                  <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                </a>
                <p className="text-xs text-muted-foreground">
                  {article.sourceName} · {new Date(article.publishedAt).toLocaleDateString()}
                </p>
                {article.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recent news found for {company}.
          </p>
        )}
      </div>

      {/* Non-fatal API errors */}
      {errors.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-amber-600 font-medium">
            {errors.length} API warning{errors.length !== 1 ? "s" : ""}
          </summary>
          <ul className="mt-1 space-y-0.5 text-amber-700 list-disc list-inside">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
