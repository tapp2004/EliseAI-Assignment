"use client";

import { useState } from "react";
import { LeadUploader } from "@/app/components/LeadUploader";
import { LeadsTable } from "@/app/components/LeadsTable";
import { ProcessButton } from "@/app/components/ProcessButton";
import { LeadCard } from "@/app/components/LeadCard";
import { LeadCardSkeleton } from "@/app/components/LeadCardSkeleton";
import { Accordion } from "@/components/ui/accordion";
import { SchedulePanel } from "@/app/components/SchedulePanel";
import type { RawLead, EnrichedLead, EnrichResponse } from "@/app/types/lead";

export default function Home() {
  const [leads, setLeads] = useState<RawLead[] | null>(null);
  const [enrichedLeads, setEnrichedLeads] = useState<EnrichedLead[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLeadsReady(parsed: RawLead[]) {
    setLeads(parsed);
    setEnrichedLeads(null);
    setError(null);
  }

  async function handleProcess() {
    if (!leads || leads.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const data: EnrichResponse = await res.json();
      setEnrichedLeads(data.enrichedLeads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Lead Enrichment</h1>
        <p className="text-muted-foreground text-sm">
          Upload a CSV of leads to enrich, score, and generate outreach emails automatically.
        </p>
      </div>

      {/* Upload */}
      <section>
        <LeadUploader onLeadsReady={handleLeadsReady} />
      </section>

      {/* Scheduler status */}
      <SchedulePanel />

      {/* Preview + Process */}
      {leads && leads.length > 0 && (
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} ready to enrich
          </p>
          <LeadsTable leads={leads} />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <ProcessButton
                onProcess={handleProcess}
                isLoading={isProcessing}
                disabled={isProcessing}
                leadCount={leads.length}
              />
            </div>
            {error && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-destructive">{error}</p>
                <button
                  onClick={() => { setError(null); handleProcess(); }}
                  className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {leads && leads.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No valid leads found. Check the error messages above and re-upload.
        </p>
      )}

      {/* Skeletons while processing */}
      {isProcessing && leads && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Enriching leads...</h2>
          <div className="space-y-2">
            {leads.map((_, i) => <LeadCardSkeleton key={i} />)}
          </div>
        </section>
      )}

      {/* Results */}
      {!isProcessing && enrichedLeads && enrichedLeads.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Results — {enrichedLeads.length} lead{enrichedLeads.length !== 1 ? "s" : ""} enriched
          </h2>
          <Accordion className="space-y-2">
            {enrichedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </Accordion>
        </section>
      )}
    </div>
  );
}
