"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { parseCSVFile } from "@/app/lib/csvParser";
import type { RawLead } from "@/app/types/lead";
import { cn } from "@/lib/utils";

interface Props {
  onLeadsReady: (leads: RawLead[]) => void;
}

export function LeadUploader({ onLeadsReady }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setParseErrors(["Please upload a .csv file"]);
      return;
    }

    const { leads, errors } = await parseCSVFile(file);
    setFileName(file.name);
    setRowCount(leads.length);
    setParseErrors(errors);

    if (leads.length > 0) {
      onLeadsReady(leads);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onInputChange}
        />
        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        {fileName ? (
          <div className="space-y-1">
            <p className="font-medium text-sm">{fileName}</p>
            <p className="text-sm text-muted-foreground">
              {rowCount} valid lead{rowCount !== 1 ? "s" : ""} found
              {parseErrors.length > 0 ? ` · ${parseErrors.length} row${parseErrors.length !== 1 ? "s" : ""} skipped` : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Click or drop to replace</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-medium text-sm">Drop your CSV here or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Required columns: name, email, company, city, state
            </p>
            <p className="text-xs text-muted-foreground">
              Optional: property address
            </p>
          </div>
        )}
      </div>

      {parseErrors.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 space-y-1">
          <p className="text-xs font-medium text-amber-800">
            {parseErrors.length} row{parseErrors.length !== 1 ? "s" : ""} skipped due to validation errors:
          </p>
          <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
            {parseErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
