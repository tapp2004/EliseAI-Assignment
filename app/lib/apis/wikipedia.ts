import type { WikiSummary } from "@/app/types/lead";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

async function getWikiSummaryByTitle(title: string): Promise<WikiSummary | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.extract) return null;
    return {
      title: data.title,
      extract: data.extract.slice(0, 500),
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch {
    return null;
  }
}

async function searchWiki(query: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1&origin=*`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.query?.search?.[0]?.title ?? null;
  } catch {
    return null;
  }
}

export async function getCompanyWikiSummary(company: string): Promise<WikiSummary | null> {
  // Try "Company property management" search first for precision
  const title = await searchWiki(`${company} property management`) ?? await searchWiki(company);
  if (!title) return null;
  return getWikiSummaryByTitle(title);
}

export async function getCityWikiSummary(city: string, state: string): Promise<WikiSummary | null> {
  const stateName = STATE_NAMES[state.toUpperCase()] ?? state;

  // Try direct URL format first: "Phoenix,_Arizona"
  const direct = await getWikiSummaryByTitle(`${city},_${stateName}`);
  if (direct) return direct;

  // Fall back to search
  const title = await searchWiki(`${city} ${stateName}`);
  if (!title) return null;
  return getWikiSummaryByTitle(title);
}
