"use client";

import type { AgentContext } from "@/lib/api";
import { CONTEXT_GROUPS, type ContextGroupDef } from "@/lib/agent-context";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-[10px] border border-[#27272a] bg-[#141414] px-3.5 py-2.5 text-[13px] text-[#fafafa] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#181818]";
const labelClass = "block text-[13px] font-medium text-[#a1a1aa]";

interface AgentContextFieldsProps {
  context: AgentContext;
  onChange: (context: AgentContext) => void;
  groupIds?: string[];
}

function updateField(
  context: AgentContext,
  section: ContextGroupDef["section"],
  key: string,
  value: string,
): AgentContext {
  return {
    ...context,
    [section]: {
      ...context[section],
      [key]: value || null,
    },
  };
}

function ContextGroupEditor({
  group,
  context,
  onChange,
}: {
  group: ContextGroupDef;
  context: AgentContext;
  onChange: (context: AgentContext) => void;
}) {
  const section = context[group.section];

  return (
    <div className="space-y-4">
      {group.fields.map((field) => (
        <label key={field.key} className="block space-y-2">
          <span className={labelClass}>{field.label}</span>
          <textarea
            rows={field.rows ?? 3}
            value={(section[field.key as keyof typeof section] as string | null) ?? ""}
            onChange={(e) => onChange(updateField(context, group.section, field.key, e.target.value))}
            placeholder={field.placeholder}
            className={cn(fieldClass, "resize-none")}
          />
        </label>
      ))}
    </div>
  );
}

export function AgentContextFields({ context, onChange, groupIds }: AgentContextFieldsProps) {
  const groups = groupIds
    ? CONTEXT_GROUPS.filter((g) => groupIds.includes(g.section))
    : CONTEXT_GROUPS;

  return (
    <>
      {groups.map((group) => (
        <ContextGroupEditor key={group.section} group={group} context={context} onChange={onChange} />
      ))}
    </>
  );
}

export { CONTEXT_GROUPS };
