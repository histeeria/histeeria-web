"use client";

import type { AgentContext } from "@/lib/api";
import { CONTEXT_GROUPS, contextSectionHasContent, LAYER_META, type ContextGroupDef } from "@/lib/agent-context";
import { profileThemeClass, useProfileTheme } from "@/components/agents/public-profile-theme";
import { cn } from "@/lib/utils";

function ContextField({
  label,
  value,
  isLight,
}: {
  label: string;
  value: string;
  isLight: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.1em]",
          profileThemeClass(isLight, "text-[#52525b]", "text-[#71717a]"),
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed",
          profileThemeClass(isLight, "text-[#d4d4d8]", "text-[#3f3f46]"),
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ContextGroupCard({
  group,
  context,
  isLight,
  mode,
  publicSections,
  isPublicEnabled,
  onToggleSection,
}: {
  group: ContextGroupDef;
  context: AgentContext;
  isLight: boolean;
  mode: "private" | "public";
  publicSections?: Record<string, boolean>;
  isPublicEnabled?: boolean;
  onToggleSection?: (key: string) => void;
}) {
  const section = context[group.section];
  const fields = group.fields.filter((f) => {
    const val = section[f.key as keyof typeof section] as string | null;
    return Boolean(val?.trim());
  });
  if (fields.length === 0) return null;

  const layer = LAYER_META[group.layer];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[16px] border",
        profileThemeClass(isLight, "border-[#27272a] bg-[#0a0a0a]", "border-[#e4e4e7] bg-white"),
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 bg-gradient-to-r",
          profileThemeClass(isLight, `border-[#27272a] ${layer.color}`, `border-[#e4e4e7] from-zinc-50 to-white`),
        )}
      >
        <div>
          <p className={cn("text-[10px] uppercase tracking-[0.15em]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>
            {layer.label}
          </p>
          <h3 className={cn("mt-1 text-[16px] font-medium", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
            {group.title}
          </h3>
          <p className={cn("mt-0.5 text-[12px]", profileThemeClass(isLight, "text-[#71717a]", "text-[#71717a]"))}>
            {group.subtitle}
          </p>
        </div>
        {mode === "private" ? (
          <button
            type="button"
            disabled={!isPublicEnabled}
            onClick={() => onToggleSection?.(group.publicKey)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[11px] disabled:opacity-40",
              publicSections?.[group.publicKey]
                ? "border-[#14532d]/50 text-[#86efac]"
                : "border-[#27272a] text-[#71717a]",
            )}
          >
            {publicSections?.[group.publicKey] ? "Public" : "Private"}
          </button>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        {fields.map((field) => (
          <ContextField
            key={field.key}
            label={field.label}
            value={String(section[field.key as keyof typeof section] ?? "")}
            isLight={isLight}
          />
        ))}
      </div>
    </div>
  );
}

interface AgentContextDisplayProps {
  context: AgentContext;
  mode: "private" | "public";
  publicSections?: Record<string, boolean>;
  isPublicEnabled?: boolean;
  onToggleSection?: (key: string) => void;
}

export function AgentContextDisplay({
  context,
  mode,
  publicSections,
  isPublicEnabled,
  onToggleSection,
}: AgentContextDisplayProps) {
  const { isLight } = useProfileTheme();

  const visibleGroups = CONTEXT_GROUPS.filter((group) => {
    if (!contextSectionHasContent(group.section, context)) return false;
    if (mode === "private") return true;
    return Boolean(publicSections?.[group.publicKey]);
  });

  if (visibleGroups.length === 0) return null;

  const layers = ["who", "knows", "behaves"] as const;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className={cn("text-[11px] uppercase tracking-[0.2em]", profileThemeClass(isLight, "text-[#52525b]", "text-[#a1a1aa]"))}>
          Agent context
        </p>
        <h2 className={cn("mt-2 text-[22px] font-medium", profileThemeClass(isLight, "text-[#fafafa]", "text-[#18181b]"))}>
          Who it is · What it knows · How it behaves
        </h2>
      </div>

      {layers.map((layer) => {
        const groups = visibleGroups.filter((g) => g.layer === layer);
        if (groups.length === 0) return null;
        return (
          <div key={layer} className="grid gap-4 lg:grid-cols-2">
            {groups.map((group) => (
              <ContextGroupCard
                key={group.section}
                group={group}
                context={context}
                isLight={isLight}
                mode={mode}
                publicSections={publicSections}
                isPublicEnabled={isPublicEnabled}
                onToggleSection={onToggleSection}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
