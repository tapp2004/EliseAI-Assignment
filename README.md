# EliseAI Lead Enrichment Tool

A locally-hosted web app that automates the top-of-funnel lead process for EliseAI's sales team. Upload a CSV of inbound leads, and the tool enriches each one using public APIs, scores it, generates a personalized outreach email, and surfaces key sales insights — all in one UI.

---

## Quick Start

```bash
# 1. Clone and install (requires Node 20+)
git clone https://github.com/tapp2004/EliseAI-Assignment.git
cd EliseAI-Assignment
nvm use 20   # or any Node >= 20
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your NewsAPI key (optional but recommended)

# 3. Run
npm run dev
# Open http://localhost:3000
```

---

## CSV Format

Upload a `.csv` file with these columns (header names are flexible — see variants below):

| Column | Required | Accepted Header Names |
|--------|----------|----------------------|
| Name | Yes | `name`, `full name`, `contact name`, `contact` |
| Email | Yes | `email`, `email address` |
| Company | Yes | `company`, `company name`, `organization` |
| City | Yes | `city` |
| State | Yes | `state`, `state/province` |
| Property Address | No | `property address`, `address`, `property` |

State can be a two-letter abbreviation (`TX`) or full name (`Texas`).

**Sample CSV:**
```csv
name,email,company,city,state,property address
John Smith,john@greystar.com,Greystar,Austin,TX,100 Main St
Jane Doe,jane@aimco.com,Aimco,Phoenix,AZ,200 Oak Ave
```

---

## APIs Used

| API | Key Required | Purpose |
|-----|-------------|---------|
| [U.S. Census ACS](https://api.census.gov) | No | City-level market data: renter %, housing units, median income, population |
| [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) | No | Company and city summaries for email personalization |
| [NewsAPI](https://newsapi.org) | Yes (free tier) | Recent company news for outreach hooks and score bonus |

**Getting a NewsAPI key:** Sign up free at [newsapi.org](https://newsapi.org). The free tier allows 100 requests/day — enough for ~100 leads/day. Without a key, news enrichment is skipped gracefully (no crash, just 0 pts for the news bonus).

**DataUSA:** Evaluated but dropped — the API does not reliably return JSON. Census covers the same market data.

---

## Lead Scoring

Each lead is scored 0–100 based on how attractive their market is for EliseAI's property management software.

| Factor | Source | Brackets | Max |
|--------|--------|----------|-----|
| Renter-Occupied % | Census ACS B25003 | <20%→0 · 20–30%→10 · 30–40%→20 · 40–50%→30 · ≥50%→40 | 40 pts |
| Total Housing Units | Census ACS B25001 | <10k→0 · 10k–50k→10 · 50k–100k→20 · ≥100k→30 | 30 pts |
| Median Household Income | Census ACS B19013 | <$40k→0 · $40k–$60k→7 · $60k–$80k→14 · ≥$80k→20 | 20 pts |
| Recent Company News | NewsAPI (30 days) | ≥1 article→10 · none→0 | 10 pts |

**Tiers:** Hot ≥75 · Warm 50–74 · Cold <50

**Assumptions:**
- High renter density = strong demand for professional property management software
- Larger markets = bigger total addressable portfolio
- Higher-income markets = professional PMCs (vs. DIY landlords) who invest in software
- Companies in the news are actively growing — prime timing for a software pitch

---

## Output Per Lead

Each lead gets an accordion card with three tabs:

- **Score** — visual progress bar, factor breakdown table with points earned per factor, and explanation of each score
- **Insights** — Census market data table, 3–5 rep-ready talking points, recent news articles with links
- **Email** — full personalized outreach email with copy-to-clipboard button

---

## Scheduler

The tool supports both manual and automated enrichment:

**Manual trigger:** Click "Enrich N Leads" after uploading a CSV.

**Scheduled (daily at 9 AM):** The app runs a `node-cron` job via a custom server. Configure in `.env.local`:

```bash
# Cron expression (default: daily at 9 AM)
CRON_SCHEDULE=0 9 * * *

# Absolute path to the CSV file to process automatically
SCHEDULED_CSV_PATH=/absolute/path/to/your/leads.csv

# Optional: protect /api/schedule with a bearer token
CRON_SECRET=some_secret
```

The **Schedule Panel** on the home page shows the next scheduled run, last run time, and a "Run Now" button to trigger on demand.

---

## Project Structure

```
EliseAI-Assignment/
├── server.ts                       # Custom Next.js server + node-cron scheduler
├── app/
│   ├── page.tsx                    # Main page: upload → preview → results
│   ├── layout.tsx                  # Root layout + nav header
│   ├── types/lead.ts               # All shared TypeScript types
│   ├── lib/
│   │   ├── csvParser.ts            # CSV parsing, header normalization, validation
│   │   ├── enrichment.ts           # Orchestrates all API calls via Promise.allSettled
│   │   ├── scoring.ts              # Lead scoring algorithm (documented brackets)
│   │   ├── emailGenerator.ts       # Personalized email + talking points
│   │   └── apis/
│   │       ├── census.ts           # U.S. Census ACS integration
│   │       ├── wikipedia.ts        # Wikipedia REST API integration
│   │       ├── newsapi.ts          # NewsAPI integration
│   │       └── datausa.ts          # Stub (API not reliably available)
│   ├── api/
│   │   ├── enrich/route.ts         # POST: process leads (batches of 5)
│   │   ├── schedule/route.ts       # GET: run scheduled enrichment from CSV
│   │   └── schedule/status/route.ts # GET: cron state for SchedulePanel
│   └── components/
│       ├── LeadUploader.tsx        # Drag-and-drop CSV upload
│       ├── LeadsTable.tsx          # Preview table of parsed leads
│       ├── ProcessButton.tsx       # Enrich trigger button
│       ├── LeadCard.tsx            # Per-lead accordion card with 3 tabs
│       ├── LeadCardSkeleton.tsx    # Loading skeleton
│       ├── ScoreBadge.tsx          # Hot/Warm/Cold badge
│       ├── ScoreBreakdown.tsx      # Score bar + factor table
│       ├── InsightsPanel.tsx       # Market data + news + talking points
│       ├── EmailDraft.tsx          # Email display + copy button
│       └── SchedulePanel.tsx       # Cron status + Run Now button
├── components/ui/                  # shadcn/ui components
└── .env.example                    # All environment variable documentation
```

---

## Known Limitations

- **Census data is from 2021** (most recent ACS 5-year estimates available). City-level data may not reflect recent development.
- **NewsAPI free tier:** 100 requests/day. With a large lead batch, you may hit this limit — news enrichment will silently return 0 articles (not an error).
- **DataUSA API** was evaluated for population trend data but is not reliably accessible as a JSON API. Dropped in favor of Census.
- **Max 100 leads per upload** to stay within free-tier API limits.

---

## Development

```bash
npm run dev          # Start dev server with cron scheduler (Node 20+)
npm run type-check   # TypeScript check
npm run build        # Production build
npm run lint         # ESLint
```
