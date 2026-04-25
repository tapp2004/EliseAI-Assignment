import type { MarketData } from "@/app/types/lead";

const STATE_FIPS: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09",
  DE: "10", DC: "11", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17",
  IN: "18", IA: "19", KS: "20", KY: "21", LA: "22", ME: "23", MD: "24",
  MA: "25", MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31",
  NV: "32", NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38",
  OH: "39", OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46",
  TN: "47", TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54",
  WI: "55", WY: "56",
};

// Cache place lists per state to avoid redundant fetches within a batch
const placeCache: Record<string, [string, string][]> = {};

async function getPlacesInState(
  stateFips: string
): Promise<[string, string][]> {
  if (placeCache[stateFips]) return placeCache[stateFips];

  const url = `https://api.census.gov/data/2021/acs/acs5?get=NAME&for=place:*&in=state:${stateFips}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Census places fetch failed: ${res.status}`);

  const data: string[][] = await res.json();
  // data[0] is header row ["NAME","state","place"], rest are data rows
  const places = data.slice(1).map((row) => [row[0], row[2]] as [string, string]);
  placeCache[stateFips] = places;
  return places;
}

async function findPlaceFips(
  stateFips: string,
  cityName: string
): Promise<[string, string] | null> {
  const places = await getPlacesInState(stateFips);
  const normalized = cityName.toLowerCase().trim();

  // Try prefix match first: "austin" matches "austin city, texas"
  let match = places.find(([name]) =>
    name.toLowerCase().startsWith(normalized)
  );

  // Fall back to substring match
  if (!match) {
    match = places.find(([name]) =>
      name.toLowerCase().includes(normalized)
    );
  }

  return match ?? null;
}

export async function getCensusMarketData(
  city: string,
  state: string
): Promise<MarketData | null> {
  try {
    const stateFips = STATE_FIPS[state.toUpperCase()];
    if (!stateFips) {
      console.warn(`[Census] Unknown state: ${state}`);
      return null;
    }

    const placeResult = await findPlaceFips(stateFips, city);
    if (!placeResult) {
      console.warn(`[Census] City not found: ${city}, ${state}`);
      return null;
    }
    const [fullCityName, placeFips] = placeResult;

    const vars = [
      "B01003_001E", // population
      "B25001_001E", // total housing units
      "B25003_001E", // occupied housing units
      "B25003_003E", // renter-occupied units
      "B19013_001E", // median household income
    ].join(",");

    const url = `https://api.census.gov/data/2021/acs/acs5?get=NAME,${vars}&for=place:${placeFips}&in=state:${stateFips}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Census data fetch failed: ${res.status}`);

    const data: string[][] = await res.json();
    if (data.length < 2) return null;

    const headers = data[0];
    const row = data[1];

    function val(varName: string): number {
      const idx = headers.indexOf(varName);
      return idx !== -1 ? parseInt(row[idx], 10) : 0;
    }

    const occupiedUnits = val("B25003_001E");
    const renterOccupied = val("B25003_003E");
    const renterPct = occupiedUnits > 0 ? (renterOccupied / occupiedUnits) * 100 : 0;

    return {
      cityName: fullCityName,
      population: val("B01003_001E"),
      totalHousingUnits: val("B25001_001E"),
      occupiedUnits,
      renterOccupied,
      renterPct,
      medianHouseholdIncome: val("B19013_001E"),
      stateFips,
      placeFips,
    };
  } catch (err) {
    console.warn(`[Census] Error for ${city}, ${state}:`, err);
    return null;
  }
}
