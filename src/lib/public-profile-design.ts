/** Design tokens for systemic minimalism public profiles */

export function publicTheme(isLight: boolean) {
  return {
    bg: isLight ? "bg-[#fafafa]" : "bg-[#09090b]",
    fg: isLight ? "text-[#18181b]" : "text-[#fafafa]",
    muted: isLight ? "text-[#3f3f46]" : "text-white/64",
    faint: isLight ? "text-[#5b616e]" : "text-white/34",
    border: isLight ? "border-[#e4e4e7]" : "border-white/10",
    borderStrong: isLight ? "border-[#d4d4d8]" : "border-white/18",
    surface: isLight ? "bg-white" : "bg-white/[0.035]",
    surfaceAlt: isLight ? "bg-[#f4f4f5]" : "bg-white/[0.055]",
    accent: isLight ? "text-[#5b6cff]" : "text-[#aeb7ff]",
    accentBg: isLight ? "bg-[#eef0ff]" : "bg-[#8f9cff]/15",
    accentBorder: isLight ? "border-[#c7ceff]" : "border-[#8f9cff]/35",
    fill: isLight ? "#18181b" : "#fafafa",
    fillMuted: isLight ? "#94a3b8" : "rgba(255,255,255,0.2)",
    grid: isLight ? "#e4e4e7" : "rgba(255,255,255,0.1)",
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
