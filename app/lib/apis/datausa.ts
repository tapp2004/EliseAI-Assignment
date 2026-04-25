// DataUSA API integration
//
// DataUSA (datausa.io) was evaluated as a supplementary data source for
// population trends, but the public API endpoint does not reliably return
// JSON — the main domain returns HTML and the API subdomain returns 404s.
// This module is retained as a documented stub for future use if the API
// becomes stable. All callers receive null and continue without this data.

export async function getDataUSAPopulationTrend(
  _city: string,
  _state: string
): Promise<{ yearOverYearGrowth: number } | null> {
  return null;
}
