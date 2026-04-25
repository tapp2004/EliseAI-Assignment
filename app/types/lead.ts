export interface RawLead {
  name: string;
  email: string;
  company: string;
  city: string;
  state: string;
  propertyAddress?: string;
}

export interface MarketData {
  cityName: string;
  population: number;
  totalHousingUnits: number;
  occupiedUnits: number;
  renterOccupied: number;
  renterPct: number;
  medianHouseholdIncome: number;
  stateFips: string;
  placeFips: string;
}

export interface WikiSummary {
  title: string;
  extract: string;
  url: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  sourceName: string;
}

export interface ScoreFactor {
  name: string;
  value: string;
  points: number;
  maxPoints: number;
  explanation: string;
}

export interface ScoreResult {
  total: number;
  tier: "Hot" | "Warm" | "Cold";
  factors: ScoreFactor[];
  hasNewsBonus: boolean;
}

export interface EnrichedLead extends RawLead {
  id: string;
  marketData: MarketData | null;
  companyWiki: WikiSummary | null;
  cityWiki: WikiSummary | null;
  news: NewsArticle[];
  score: ScoreResult;
  emailDraft: string;
  talkingPoints: string[];
  enrichedAt: string;
  errors: string[];
}

export interface EnrichRequest {
  leads: RawLead[];
}

export interface EnrichResponse {
  enrichedLeads: EnrichedLead[];
  processedAt: string;
  totalCount: number;
  errorCount: number;
}

export interface ScheduleStatus {
  enabled: boolean;
  cronExpression: string;
  nextRun: string | null;
  lastRun: string | null;
  lastRunCount: number | null;
}
