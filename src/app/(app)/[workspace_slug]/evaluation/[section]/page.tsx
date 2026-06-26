import Image from "next/image";
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

  if (section === "engine") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#27272a] bg-[#0a0a0a]">
            <Image
              src="/logo-dark.png"
              alt="Histeeria Evaluation Engine"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">
            Evaluation Engine
          </h1>
          <p className="text-[13px] leading-relaxed text-[#71717a]">
            The Histeeria evaluation engine scores agent judgment against your domain curriculum.
            This module is under active development.
          </p>
          <div className="mx-auto mt-6 h-px w-12 bg-[#27272a]" />
        </div>
      </div>
    );
  }

  const title = SECTION_LABELS[section] ?? section;

  return (
    <SectionPlaceholder
      title={title}
      description={`Evaluation ${title.toLowerCase()} features are on the roadmap.`}
    />
  );
}
