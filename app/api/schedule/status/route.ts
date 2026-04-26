import { NextResponse } from "next/server";
import type { ScheduleStatus } from "@/app/types/lead";

export const dynamic = "force-dynamic";

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cronState = (global as any).__cronState as ScheduleStatus | undefined;

  const status: ScheduleStatus = cronState ?? {
    enabled: false,
    cronExpression: process.env.CRON_SCHEDULE ?? "0 9 * * *",
    nextRun: null,
    lastRun: null,
    lastRunCount: null,
  };

  return NextResponse.json(status);
}
