import type { RawLead, EnrichedLead } from "@/app/types/lead";
import { getCensusMarketData } from "@/app/lib/apis/census";

export async function enrichLead(lead: RawLead): Promise<EnrichedLead> {
  const errors: string[] = [];

  const marketResult = await Promise.allSettled([
    getCensusMarketData(lead.city, lead.state),
  ]);

  const marketData =
    marketResult[0].status === "fulfilled" ? marketResult[0].value : null;
  if (marketResult[0].status === "rejected") {
    errors.push(`Census: ${marketResult[0].reason}`);
  }

  return {
    ...lead,
    id: crypto.randomUUID(),
    marketData,
    companyWiki: null,
    cityWiki: null,
    news: [],
    score: { total: 0, tier: "Cold", factors: [], hasNewsBonus: false },
    emailDraft: "",
    talkingPoints: [],
    enrichedAt: new Date().toISOString(),
    errors,
  };
}
