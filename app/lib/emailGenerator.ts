import type { EnrichedLead, MarketData, WikiSummary, NewsArticle } from "@/app/types/lead";

function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

function formatIncome(income: number): string {
  return `$${Math.round(income / 1000)}k`;
}

function buildOpeningHook(
  company: string,
  companyWiki: WikiSummary | null,
  news: NewsArticle[]
): string {
  if (news.length > 0) {
    const article = news[0];
    return `I came across ${company} recently in ${article.sourceName} — "${article.title.slice(0, 80)}${article.title.length > 80 ? "..." : ""}" — and wanted to reach out.`;
  }
  if (companyWiki) {
    const firstSentence = companyWiki.extract.split(".")[0].trim();
    return `I've been looking into ${company} — ${firstSentence.toLowerCase().startsWith(company.toLowerCase()) ? firstSentence : `${firstSentence}`} — and wanted to connect.`;
  }
  return `I've been following ${company}'s work in the property management space and wanted to reach out.`;
}

function buildMarketParagraph(market: MarketData, city: string): string {
  const cityShort = city;
  return `The ${cityShort} market has a ${market.renterPct.toFixed(0)}% renter-occupancy rate across ${market.totalHousingUnits.toLocaleString()} housing units, with a median household income of ${formatIncome(market.medianHouseholdIncome)}. That's the kind of market where EliseAI's AI leasing assistant delivers real ROI — by reducing vacancy periods, qualifying leads 24/7, and automating follow-up so your team focuses on closings.`;
}

function buildTierIntro(tier: string, city: string, state: string): string {
  if (tier === "Hot") {
    return `${city}, ${state} is one of the strongest rental markets we track — and that makes companies like yours exactly who we want to be talking to.`;
  }
  if (tier === "Warm") {
    return `${city}, ${state} has solid rental market fundamentals, and we've been seeing strong results with property management teams in similar markets.`;
  }
  return `We work with property management companies across a range of markets, and I think there's a real fit with what ${city} has going on.`;
}

export function generateEmail(lead: EnrichedLead): string {
  const { name, company, city, state, marketData, companyWiki, news, score } = lead;

  const opening = buildOpeningHook(company, companyWiki, news);
  const tierIntro = buildTierIntro(score.tier, city, state);
  const marketParagraph = marketData ? buildMarketParagraph(marketData, city) : "";

  return `Subject: Modernizing leasing at ${company} — quick question

Hi ${firstName(name)},

${opening}

${tierIntro}${marketParagraph ? `\n\n${marketParagraph}` : ""}

EliseAI's AI leasing assistant handles inbound inquiries around the clock, qualifies prospects, schedules tours, and follows up automatically — all while integrating with your existing property management software. Our customers typically see a 40% reduction in time-to-lease within 90 days.

Would you be open to a 20-minute call this week to see if it's a fit for ${company}?

Best,
[Your Name]
EliseAI Sales Team
[Your Phone] | eliseai.com

P.S. Happy to share a case study from a similar portfolio — just say the word.`.trim();
}

export function generateTalkingPoints(lead: EnrichedLead): string[] {
  const { company, city, state, marketData, news, companyWiki, score } = lead;
  const points: string[] = [];

  if (marketData) {
    points.push(
      `${city} has a ${marketData.renterPct.toFixed(0)}% renter-occupancy rate across ${marketData.totalHousingUnits.toLocaleString()} housing units — a strong market for professional property management.`
    );
    points.push(
      `Median household income of ${formatIncome(marketData.medianHouseholdIncome)} in ${city}, ${state} signals a market where tenants expect a modern leasing experience.`
    );
  }

  if (news.length > 0) {
    points.push(
      `${company} has been active in the news recently (${news[0].sourceName}: "${news[0].title.slice(0, 70)}${news[0].title.length > 70 ? "..." : ""}") — growth phase is ideal timing for AI leasing tools.`
    );
  }

  if (companyWiki) {
    const snippet = companyWiki.extract.split(".")[0].trim();
    points.push(`Background: ${snippet}.`);
  }

  points.push(
    `Lead score: ${score.total}/100 (${score.tier}) — ${score.factors.map((f) => `${f.name}: ${f.points}/${f.maxPoints}`).join(", ")}.`
  );

  return points.slice(0, 5);
}
