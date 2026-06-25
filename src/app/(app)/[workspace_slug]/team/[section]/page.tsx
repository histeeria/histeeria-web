import { notFound } from "next/navigation";

import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { SECTION_LABELS, TEAM_SECTIONS } from "@/lib/navigation";

interface PageProps {
  params: Promise<{ section: string }> | { section: string };
}

export default async function TeamSectionPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const section = resolved.section;

  if (!TEAM_SECTIONS.includes(section as (typeof TEAM_SECTIONS)[number])) {
    notFound();
  }

  const title = SECTION_LABELS[section] ?? section;

  return (
    <SectionPlaceholder
      title={title}
      description={`Team ${title.toLowerCase()} controls will live here.`}
    />
  );
}
