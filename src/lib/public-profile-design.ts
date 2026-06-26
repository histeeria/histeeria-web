/** Design tokens for systemic minimalism public profiles */

export function publicTheme(isLight: boolean) {
  return {
    bg: isLight ? "bg-[#fafafa]" : "bg-[#09090b]",
    fg: isLight ? "text-[#18181b]" : "text-[#fafafa]",
    muted: isLight ? "text-[#71717a]" : "text-[#a1a1aa]",
    faint: isLight ? "text-[#a1a1aa]" : "text-[#52525b]",
    border: isLight ? "border-[#e4e4e7]" : "border-[#27272a]",
    borderStrong: isLight ? "border-[#d4d4d8]" : "border-[#3f3f46]",
    surface: isLight ? "bg-white" : "bg-[#0a0a0a]",
    surfaceAlt: isLight ? "bg-[#f4f4f5]" : "bg-[#141414]",
    accent: isLight ? "text-[#5b6cff]" : "text-[#9aa8ff]",
    accentBg: isLight ? "bg-[#eef0ff]" : "bg-[#1a1f3d]",
    accentBorder: isLight ? "border-[#c7ceff]" : "border-[#3d4a8f]",
    fill: isLight ? "#18181b" : "#fafafa",
    fillMuted: isLight ? "#d4d4d8" : "#3f3f46",
    grid: isLight ? "#e4e4e7" : "#27272a",
  };
}

export function textToLines(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/\n|(?:\s*[-•]\s+)|(?:\s*;\s+)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function firstSentence(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const match = value.trim().match(/^[^.!?]+[.!?]?/);
  return match?.[0]?.trim() ?? value.trim();
}

export function truncate(value: string | null | undefined, max: number): string {
  if (!value) return "—";
  const v = value.trim();
  if (v.length <= max) return v;
  return `${v.slice(0, max).trim()}…`;
}

export function splitTags(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/\n|,|(?:\s*·\s*)/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

/** Parse heuristic lines into IF → action pairs for monospace display */
export function parseHeuristics(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  const lines = value.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return textToLines(value);
}
