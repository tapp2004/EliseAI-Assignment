import Papa from "papaparse";
import type { RawLead } from "@/app/types/lead";

const HEADER_MAP: Record<string, keyof RawLead> = {
  name: "name",
  "full name": "name",
  "contact name": "name",
  "contact": "name",
  email: "email",
  "email address": "email",
  company: "company",
  "company name": "company",
  organization: "company",
  city: "city",
  state: "state",
  "state/province": "state",
  "property address": "propertyAddress",
  address: "propertyAddress",
  "property": "propertyAddress",
};

const STATE_NAMES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR",
  california: "CA", colorado: "CO", connecticut: "CT", delaware: "DE",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
  kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM",
  "new york": "NY", "north carolina": "NC", "north dakota": "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA",
  "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
  tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};

function normalizeState(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return STATE_NAMES[trimmed.toLowerCase()] ?? trimmed.toUpperCase();
}

function normalizeHeaders(headers: string[]): (keyof RawLead | null)[] {
  return headers.map((h) => HEADER_MAP[h.trim().toLowerCase()] ?? null);
}

function validateRow(row: Partial<RawLead>, rowNum: number): string | null {
  if (!row.name?.trim()) return `Row ${rowNum}: missing name`;
  if (!row.email?.trim()) return `Row ${rowNum}: missing email`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim()))
    return `Row ${rowNum}: invalid email "${row.email}"`;
  if (!row.company?.trim()) return `Row ${rowNum}: missing company`;
  if (!row.city?.trim()) return `Row ${rowNum}: missing city`;
  if (!row.state?.trim()) return `Row ${rowNum}: missing state`;
  return null;
}

export interface ParseResult {
  leads: RawLead[];
  errors: string[];
}

export function parseCSVString(content: string): ParseResult {
  const leads: RawLead[] = [];
  const errors: string[] = [];

  const result = Papa.parse<string[]>(content, {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    errors.push(...result.errors.map((e) => `Parse error: ${e.message}`));
  }

  const rows = result.data;
  if (rows.length < 2) {
    errors.push("CSV must have a header row and at least one data row");
    return { leads, errors };
  }

  const headers = rows[0];
  const fieldMap = normalizeHeaders(headers);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const lead: Partial<RawLead> = {};

    row.forEach((cell, colIdx) => {
      const field = fieldMap[colIdx];
      if (field) {
        (lead as Record<string, string>)[field] = cell.trim();
      }
    });

    if (lead.state) lead.state = normalizeState(lead.state);

    const error = validateRow(lead, i + 1);
    if (error) {
      errors.push(error);
    } else {
      leads.push(lead as RawLead);
    }
  }

  return { leads, errors };
}

export function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(parseCSVString(content));
    };
    reader.onerror = () => {
      resolve({ leads: [], errors: ["Failed to read file"] });
    };
    reader.readAsText(file);
  });
}
