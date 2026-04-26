import { createServer } from "http";
import { parse } from "url";
import next from "next";
import cron from "node-cron";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const CRON_EXPRESSION = process.env.CRON_SCHEDULE ?? "0 9 * * *";

let lastRun: string | null = null;
let lastRunCount: number | null = null;

function computeNextRun(): string {
  const now = new Date();
  const next9AM = new Date(now);
  // If it's already past 9 AM today, schedule for tomorrow
  if (now.getHours() >= 9) {
    next9AM.setDate(now.getDate() + 1);
  }
  next9AM.setHours(9, 0, 0, 0);
  return next9AM.toISOString();
}

app.prepare().then(() => {
  // Register the cron job
  cron.schedule(CRON_EXPRESSION, async () => {
    console.log(`[cron] Scheduled enrichment starting at ${new Date().toISOString()}`);
    try {
      const secret = process.env.CRON_SECRET;
      const headers: Record<string, string> = {};
      if (secret) headers["Authorization"] = `Bearer ${secret}`;

      const res = await fetch(`http://${hostname}:${port}/api/schedule`, { headers });
      const data = await res.json();

      lastRun = data.processedAt ?? new Date().toISOString();
      lastRunCount = data.totalCount ?? 0;

      console.log(`[cron] Run complete — ${lastRunCount} leads processed`);
    } catch (err) {
      console.error("[cron] Run failed:", err);
    }
  });

  // Expose cron state globally so /api/schedule/status can read it
  (global as Record<string, unknown>)["__cronState"] = {
    enabled: cron.getTasks().size > 0,
    cronExpression: CRON_EXPRESSION,
    get nextRun() { return computeNextRun(); },
    get lastRun() { return lastRun; },
    get lastRunCount() { return lastRunCount; },
  };

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url ?? "/", true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Request error:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Cron scheduled: "${CRON_EXPRESSION}"`);
    console.log(`> Next run: ${computeNextRun()}`);
  });
});
