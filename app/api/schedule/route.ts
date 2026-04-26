import { NextRequest, NextResponse } from "next/server";
import { enrichLead } from "@/app/lib/enrichment";
import { parseCSVString } from "@/app/lib/csvParser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Optional bearer token protection
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const csvPath = process.env.SCHEDULED_CSV_PATH;
  if (!csvPath) {
    return NextResponse.json({
      message: "No SCHEDULED_CSV_PATH configured — skipping scheduled run",
    });
  }

  try {
    const { readFileSync } = await import("fs");
    const content = readFileSync(csvPath, "utf-8");
    const { leads, errors: parseErrors } = parseCSVString(content);

    if (leads.length === 0) {
      return NextResponse.json({
        message: "CSV parsed but no valid leads found",
        parseErrors,
      });
    }

    const enrichedLeads = [];
    for (let i = 0; i < leads.length; i += 5) {
      const batch = leads.slice(i, i + 5);
      const results = await Promise.all(batch.map(enrichLead));
      enrichedLeads.push(...results);
    }

    return NextResponse.json({
      message: "Scheduled run complete",
      processedAt: new Date().toISOString(),
      totalCount: enrichedLeads.length,
      csvPath,
    });
  } catch (err) {
    console.error("[/api/schedule] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
