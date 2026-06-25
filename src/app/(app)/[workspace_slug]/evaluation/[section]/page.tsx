import { notFound } from "next/navigation";

import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { EVALUATION_SECTIONS, SECTION_LABELS } from "@/lib/navigation";

interface PageProps {
  params: Promise<{ section: string }> | { section: string };
}

export default async function EvaluationSectionPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const section = resolved.section;

  if (!EVALUATION_SECTIONS.includes(section as (typeof EVALUATION_SECTIONS)[number])) {
    notFound();
  }

  const title = SECTION_LABELS[section] ?? section;

  return (
    <SectionPlaceholder
      title={title}
      description={`Evaluation ${title.toLowerCase()} features are on the roadmap.`}
    />
  );
}
