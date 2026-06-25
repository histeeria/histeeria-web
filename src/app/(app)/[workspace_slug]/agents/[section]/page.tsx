import { notFound } from "next/navigation";

import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { AGENT_SECTIONS, SECTION_LABELS } from "@/lib/navigation";

interface PageProps {
  params: Promise<{ section: string }> | { section: string };
}

export default async function AgentSectionPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const section = resolved.section;

  if (!AGENT_SECTIONS.includes(section as (typeof AGENT_SECTIONS)[number])) {
    notFound();
  }

  const title = SECTION_LABELS[section] ?? section;

  return (
    <SectionPlaceholder
      title={title}
      description={`Agent ${title.toLowerCase()} tools and data will be available here.`}
    />
  );
}
