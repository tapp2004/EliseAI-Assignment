import { NextRequest, NextResponse } from "next/server";
import { enrichLead } from "@/app/lib/enrichment";
import type { EnrichRequest, EnrichResponse } from "@/app/types/lead";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: EnrichRequest = await req.json();
    const { leads } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }
    if (leads.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 leads per request" },
        { status: 400 }
      );
    }

    // Process in batches of 5 to avoid hammering free-tier APIs
    const enrichedLeads = [];
    for (let i = 0; i < leads.length; i += 5) {
      const batch = leads.slice(i, i + 5);
      const results = await Promise.all(batch.map(enrichLead));
      enrichedLeads.push(...results);
    }

    const errorCount = enrichedLeads.filter((l) => l.errors.length > 0).length;

    const response: EnrichResponse = {
      enrichedLeads,
      processedAt: new Date().toISOString(),
      totalCount: enrichedLeads.length,
      errorCount,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/enrich] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
