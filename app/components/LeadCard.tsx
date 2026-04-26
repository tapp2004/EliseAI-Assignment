import type { EnrichedLead } from "@/app/types/lead";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreBadge } from "@/app/components/ScoreBadge";
import { ScoreBreakdown } from "@/app/components/ScoreBreakdown";
import { InsightsPanel } from "@/app/components/InsightsPanel";
import { EmailDraft } from "@/app/components/EmailDraft";

interface Props {
  lead: EnrichedLead;
}

export function LeadCard({ lead }: Props) {
  return (
    <AccordionItem value={lead.id} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center justify-between w-full pr-2">
          <div className="text-left">
            <p className="font-semibold text-sm">{lead.company}</p>
            <p className="text-xs text-muted-foreground">{lead.name} · {lead.city}, {lead.state}</p>
          </div>
          <ScoreBadge tier={lead.score.tier} score={lead.score.total} />
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-4">
        <Tabs defaultValue="score">
          <TabsList className="mb-4">
            <TabsTrigger value="score">Score</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="score">
            <ScoreBreakdown score={lead.score} />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsPanel lead={lead} />
          </TabsContent>

          <TabsContent value="email">
            <EmailDraft emailDraft={lead.emailDraft} />
          </TabsContent>
        </Tabs>
      </AccordionContent>
    </AccordionItem>
  );
}
