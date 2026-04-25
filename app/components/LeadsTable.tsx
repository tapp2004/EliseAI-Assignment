"use client";

import type { RawLead } from "@/app/types/lead";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  leads: RawLead[];
}

const PREVIEW_LIMIT = 10;

export function LeadsTable({ leads }: Props) {
  const preview = leads.slice(0, PREVIEW_LIMIT);
  const overflow = leads.length - PREVIEW_LIMIT;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Property Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.map((lead, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium max-w-[140px] truncate">{lead.name}</TableCell>
              <TableCell className="max-w-[180px] truncate text-muted-foreground text-sm">{lead.email}</TableCell>
              <TableCell className="max-w-[140px] truncate">{lead.company}</TableCell>
              <TableCell>{lead.city}</TableCell>
              <TableCell>{lead.state}</TableCell>
              <TableCell className="max-w-[160px] truncate text-muted-foreground text-sm">
                {lead.propertyAddress ?? "—"}
              </TableCell>
            </TableRow>
          ))}
          {overflow > 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-2">
                ...and {overflow} more lead{overflow !== 1 ? "s" : ""}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
