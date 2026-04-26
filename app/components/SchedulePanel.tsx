"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ScheduleStatus } from "@/app/types/lead";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function SchedulePanel() {
  const [status, setStatus] = useState<ScheduleStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/schedule/status");
      const data: ScheduleStatus = await res.json();
      setStatus(data);
    } catch {
      // silently ignore polling errors
    }
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function handleRunNow() {
    setIsRunning(true);
    setRunMessage(null);
    try {
      const res = await fetch("/api/schedule");
      const data = await res.json();
      setRunMessage(
        data.totalCount !== undefined
          ? `Run complete — ${data.totalCount} leads processed`
          : data.message ?? "Run triggered"
      );
      await fetchStatus();
    } catch {
      setRunMessage("Run failed — check console for details");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${status?.enabled ? "bg-green-500" : "bg-slate-300"}`}
          />
          Scheduled Enrichment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <span className="text-muted-foreground">Schedule</span>
          <span className="font-mono">{status?.cronExpression ?? "0 9 * * *"}</span>
          <span className="text-muted-foreground">Next run</span>
          <span>{formatDate(status?.nextRun ?? null)}</span>
          <span className="text-muted-foreground">Last run</span>
          <span>{formatDate(status?.lastRun ?? null)}</span>
          <span className="text-muted-foreground">Last run count</span>
          <span>{status?.lastRunCount != null ? `${status.lastRunCount} leads` : "—"}</span>
        </div>

        {!process.env.NEXT_PUBLIC_HAS_CSV_PATH && (
          <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700">
            Set <code className="font-mono">SCHEDULED_CSV_PATH</code> in <code className="font-mono">.env.local</code> to enable automated runs.
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunNow}
            disabled={isRunning}
          >
            {isRunning ? (
              <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Running...</>
            ) : (
              <><RefreshCw className="mr-2 h-3.5 w-3.5" />Run Now</>
            )}
          </Button>
          {runMessage && (
            <p className="text-xs text-muted-foreground">{runMessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
