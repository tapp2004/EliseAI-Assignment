import type { MarketData, NewsArticle, ScoreFactor, ScoreResult } from "@/app/types/lead";

// ─────────────────────────────────────────────────────────────────────────────
// SCORING ASSUMPTIONS
//
// EliseAI sells AI leasing/property management software. A high-quality lead
// is a property management company operating in a market with strong rental
// demand. Each factor uses simple tiered brackets — easy to read and explain.
//
// FACTOR 1 — Renter-Occupied % (40 pts max)
//   Source: Census ACS B25003_003E / B25003_001E
//   Why: Cities with more renters = more units under management = larger market
//   for property management software. 50%+ is the gold standard.
//   Brackets: <20% → 0 | 20–30% → 10 | 30–40% → 20 | 40–50% → 30 | ≥50% → 40
//
// FACTOR 2 — Total Housing Units (30 pts max)
//   Source: Census ACS B25001_001E
//   Why: Larger markets mean bigger potential portfolios. A PMC managing 500
//   units is a much bigger customer than one managing 50.
//   Brackets: <10k → 0 | 10k–50k → 10 | 50k–100k → 20 | ≥100k → 30
//
// FACTOR 3 — Median Household Income (20 pts max)
//   Source: Census ACS B19013_001E
//   Why: Higher-income markets tend to have professional property management
//   companies (rather than DIY landlords) who invest in software.
//   Brackets: <$40k → 0 | $40k–$60k → 7 | $60k–$80k → 14 | ≥$80k → 20
//
// FACTOR 4 — Recent Company News (10 pts, binary)
//   Source: NewsAPI (last 30 days)
//   Why: A company in the news is likely growing or expanding — prime timing
//   for a software purchase conversation.
//   Binary: ≥1 article → 10 pts | none → 0 pts
//
// TIERS: Hot ≥75 | Warm 50–74 | Cold <50
// ─────────────────────────────────────────────────────────────────────────────

function scoreRenterPct(pct: number): ScoreFactor {
  let points: number;
  let explanation: string;

  if (pct >= 50) {
    points = 40;
    explanation = `${pct.toFixed(1)}% renter rate — top tier (≥50%)`;
  } else if (pct >= 40) {
    points = 30;
    explanation = `${pct.toFixed(1)}% renter rate — high (40–50%)`;
  } else if (pct >= 30) {
    points = 20;
    explanation = `${pct.toFixed(1)}% renter rate — moderate (30–40%)`;
  } else if (pct >= 20) {
    points = 10;
    explanation = `${pct.toFixed(1)}% renter rate — low (20–30%)`;
  } else {
    points = 0;
    explanation = `${pct.toFixed(1)}% renter rate — very low (<20%)`;
  }

  return {
    name: "Renter-Occupied %",
    value: `${pct.toFixed(1)}%`,
    points,
    maxPoints: 40,
    explanation,
  };
}

function scoreHousingUnits(units: number): ScoreFactor {
  let points: number;
  let explanation: string;

  if (units >= 100_000) {
    points = 30;
    explanation = `${units.toLocaleString()} units — large market (≥100k)`;
  } else if (units >= 50_000) {
    points = 20;
    explanation = `${units.toLocaleString()} units — mid-size market (50k–100k)`;
  } else if (units >= 10_000) {
    points = 10;
    explanation = `${units.toLocaleString()} units — small market (10k–50k)`;
  } else {
    points = 0;
    explanation = `${units.toLocaleString()} units — very small market (<10k)`;
  }

  return {
    name: "Total Housing Units",
    value: units.toLocaleString(),
    points,
    maxPoints: 30,
    explanation,
  };
}

function scoreMedianIncome(income: number): ScoreFactor {
  let points: number;
  let explanation: string;

  if (income >= 80_000) {
    points = 20;
    explanation = `$${income.toLocaleString()} median income — high (≥$80k)`;
  } else if (income >= 60_000) {
    points = 14;
    explanation = `$${income.toLocaleString()} median income — moderate-high ($60k–$80k)`;
  } else if (income >= 40_000) {
    points = 7;
    explanation = `$${income.toLocaleString()} median income — moderate ($40k–$60k)`;
  } else {
    points = 0;
    explanation = `$${income.toLocaleString()} median income — low (<$40k)`;
  }

  return {
    name: "Median Household Income",
    value: `$${income.toLocaleString()}`,
    points,
    maxPoints: 20,
    explanation,
  };
}

function scoreNews(articles: NewsArticle[]): ScoreFactor {
  const hasNews = articles.length > 0;
  return {
    name: "Recent Company News",
    value: hasNews ? `${articles.length} article${articles.length !== 1 ? "s" : ""}` : "None found",
    points: hasNews ? 10 : 0,
    maxPoints: 10,
    explanation: hasNews
      ? `${articles.length} news article${articles.length !== 1 ? "s" : ""} found in the last 30 days`
      : "No recent news found",
  };
}

export function scoreLead(
  marketData: MarketData | null,
  news: NewsArticle[]
): ScoreResult {
  const factors: ScoreFactor[] = [];

  if (marketData) {
    factors.push(scoreRenterPct(marketData.renterPct));
    factors.push(scoreHousingUnits(marketData.totalHousingUnits));
    factors.push(scoreMedianIncome(marketData.medianHouseholdIncome));
  } else {
    factors.push({
      name: "Renter-Occupied %",
      value: "N/A",
      points: 0,
      maxPoints: 40,
      explanation: "Census data unavailable for this city",
    });
    factors.push({
      name: "Total Housing Units",
      value: "N/A",
      points: 0,
      maxPoints: 30,
      explanation: "Census data unavailable for this city",
    });
    factors.push({
      name: "Median Household Income",
      value: "N/A",
      points: 0,
      maxPoints: 20,
      explanation: "Census data unavailable for this city",
    });
  }

  const newsFactor = scoreNews(news);
  factors.push(newsFactor);

  const total = Math.round(factors.reduce((sum, f) => sum + f.points, 0));
  const tier: "Hot" | "Warm" | "Cold" =
    total >= 75 ? "Hot" : total >= 50 ? "Warm" : "Cold";

  return { total, tier, factors, hasNewsBonus: newsFactor.points > 0 };
}
