"use client";

import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onProcess: () => void;
  isLoading: boolean;
  disabled: boolean;
  leadCount: number;
}

export function ProcessButton({ onProcess, isLoading, disabled, leadCount }: Props) {
  return (
    <Button
      onClick={onProcess}
      disabled={disabled}
      size="lg"
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enriching...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Enrich {leadCount} Lead{leadCount !== 1 ? "s" : ""}
        </>
      )}
    </Button>
  );
}
