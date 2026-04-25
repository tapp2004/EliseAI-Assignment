import type { RawLead, EnrichedLead } from "@/app/types/lead";
import { getCensusMarketData } from "@/app/lib/apis/census";
import { getCompanyWikiSummary, getCityWikiSummary } from "@/app/lib/apis/wikipedia";
import { getCompanyNews } from "@/app/lib/apis/newsapi";
import { scoreLead } from "@/app/lib/scoring";
import { generateEmail, generateTalkingPoints } from "@/app/lib/emailGenerator";

export async function enrichLead(lead: RawLead): Promise<EnrichedLead> {
  const errors: string[] = [];

  const [marketResult, companyWikiResult, cityWikiResult, newsResult] =
    await Promise.allSettled([
      getCensusMarketData(lead.city, lead.state),
      getCompanyWikiSummary(lead.company),
      getCityWikiSummary(lead.city, lead.state),
      getCompanyNews(lead.company),
    ]);

  const marketData =
    marketResult.status === "fulfilled" ? marketResult.value : null;
  if (marketResult.status === "rejected")
    errors.push(`Census: ${marketResult.reason}`);

  const companyWiki =
    companyWikiResult.status === "fulfilled" ? companyWikiResult.value : null;
  if (companyWikiResult.status === "rejected")
    errors.push(`Wikipedia (company): ${companyWikiResult.reason}`);

  const cityWiki =
    cityWikiResult.status === "fulfilled" ? cityWikiResult.value : null;
  if (cityWikiResult.status === "rejected")
    errors.push(`Wikipedia (city): ${cityWikiResult.reason}`);

  const news =
    newsResult.status === "fulfilled" ? newsResult.value : [];
  if (newsResult.status === "rejected")
    errors.push(`NewsAPI: ${newsResult.reason}`);

  const score = scoreLead(marketData, news);

  // Build a partial lead to pass into the generators
  const partial = {
    ...lead,
    id: crypto.randomUUID(),
    marketData,
    companyWiki,
    cityWiki,
    news,
    score,
    emailDraft: "",
    talkingPoints: [],
    enrichedAt: new Date().toISOString(),
    errors,
  };

  const emailDraft = generateEmail(partial);
  const talkingPoints = generateTalkingPoints(partial);

  return { ...partial, emailDraft, talkingPoints };
}
