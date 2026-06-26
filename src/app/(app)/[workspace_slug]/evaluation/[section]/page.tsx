import { notFound } from "next/navigation";

import {
  EvaluationEngine,
  JudgementBoard,
  ReportsManager,
} from "@/components/evaluation";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import {
  getEvaluationStatus,
  getJudgement,
  listReports,
  type EvaluationStatus,
  type JudgementResponse,
  type ReportSummary,
} from "@/lib/api";
import { EVALUATION_SECTIONS, SECTION_LABELS } from "@/lib/navigation";
import { getSessionToken } from "@/lib/server";

interface PageProps {
  params: Promise<{ section: string }> | { section: string };
}

export default async function EvaluationSectionPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const section = resolved.section;

  if (!EVALUATION_SECTIONS.includes(section as (typeof EVALUATION_SECTIONS)[number])) {
    notFound();
  }

  const token = await getSessionToken();

  if (section === "engine") {
    let status: EvaluationStatus | null = null;
    if (token) {
      try {
        status = await getEvaluationStatus(token);
      } catch {
        status = null;
      }
    }
    return <EvaluationEngine initialStatus={status} />;
  }

  if (section === "judgement") {
    let initial: JudgementResponse | null = null;
    let agents: EvaluationStatus["agents"] = [];
    if (token) {
      try {
        const status = await getEvaluationStatus(token);
        agents = status.agents;
        initial = await getJudgement(token, agents[0]?.agent_id ?? undefined);
      } catch {
        initial = null;
      }
    }
    return <JudgementBoard initial={initial} agents={agents} />;
  }

  if (section === "reports") {
    let reports: ReportSummary[] = [];
    if (token) {
      try {
        const data = await listReports(token);
        reports = data.reports;
      } catch {
        reports = [];
      }
    }
    return <ReportsManager initialReports={reports} />;
  }

  const title = SECTION_LABELS[section] ?? section;
  return (
    <SectionPlaceholder
      title={title}
      description={`Evaluation ${title.toLowerCase()} features are on the roadmap.`}
    />
  );
}
