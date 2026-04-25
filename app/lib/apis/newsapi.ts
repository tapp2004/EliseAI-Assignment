import type { NewsArticle } from "@/app/types/lead";

export async function getCompanyNews(company: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn("[NewsAPI] NEWS_API_KEY not set, skipping news enrichment");
    return [];
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(company)}&from=${thirtyDaysAgo}&sortBy=publishedAt&pageSize=5&language=en&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    });
    const data = await res.json();

    if (data.status !== "ok") {
      console.warn(`[NewsAPI] Non-ok status for "${company}":`, data.message);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.articles ?? []).map((a: any): NewsArticle => ({
      title: a.title ?? "",
      description: a.description ?? "",
      url: a.url ?? "",
      publishedAt: a.publishedAt ?? "",
      sourceName: a.source?.name ?? "Unknown",
    }));
  } catch (err) {
    console.warn(`[NewsAPI] Fetch failed for "${company}":`, err);
    return [];
  }
}
