"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  emailDraft: string;
}

export function EmailDraft({ emailDraft }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-2 h-3.5 w-3.5 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-4 rounded-md border leading-relaxed overflow-auto max-h-[480px]">
        {emailDraft}
      </pre>
    </div>
  );
}
