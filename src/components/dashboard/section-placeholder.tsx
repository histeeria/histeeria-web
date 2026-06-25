interface SectionPlaceholderProps {
  title: string;
  description?: string;
}

export function SectionPlaceholder({ title, description }: SectionPlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">{title}</h1>
        <p className="text-[13px] leading-relaxed text-[#71717a]">
          {description ?? "This section is coming soon. Check back as we expand the platform."}
        </p>
        <div className="mx-auto mt-6 h-px w-12 bg-[#27272a]" />
      </div>
    </div>
  );
}
