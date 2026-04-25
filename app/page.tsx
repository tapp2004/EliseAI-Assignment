"use client";

import { useState } from "react";
import { LeadUploader } from "@/app/components/LeadUploader";
import { LeadsTable } from "@/app/components/LeadsTable";
import type { RawLead } from "@/app/types/lead";

export default function Home() {
  const [leads, setLeads] = useState<RawLead[] | null>(null);

  function handleLeadsReady(parsed: RawLead[]) {
    setLeads(parsed);
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Lead Enrichment</h1>
        <p className="text-muted-foreground text-sm">
          Upload a CSV of leads to enrich, score, and generate outreach emails automatically.
        </p>
      </div>

      <section>
        <LeadUploader onLeadsReady={handleLeadsReady} />
      </section>

      {leads && leads.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Preview — {leads.length} lead{leads.length !== 1 ? "s" : ""} ready to enrich
            </h2>
          </div>
          <LeadsTable leads={leads} />
        </section>
      )}

      {leads && leads.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No valid leads found. Check the error messages above and re-upload.
        </p>
      )}
    </div>
  );
}
