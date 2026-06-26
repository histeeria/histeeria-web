"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

import type { ReportDetail, ReportSummary } from "@/lib/api";
import { cn } from "@/lib/utils";

type DimEntry = { label: string; mean: number | null; n: number; stdev: number | null };
type AreaEntry = { label: string; mean: number | null };
type IncidentEntry = {
  dimension: string;
  severity: string;
  description: string | null;
  evidence: string | null;
};

function gradeColor(grade: string | null) {
  switch (grade) {
    case "A":
      return "text-[#86efac]";
    case "B":
      return "text-[#a3e635]";
    case "C":
      return "text-[#fbbf24]";
    case "D":
      return "text-[#fb923c]";
    case "F":
      return "text-[#f87171]";
    default:
      return "text-[#a1a1aa]";
  }
}

function ReportDetailView({ report }: { report: ReportDetail }) {
  const content = report.content as Record<string, unknown>;
  const narrative = typeof content.narrative === "string" ? content.narrative : "";
  const dimensions = (content.dimensions ?? {}) as Record<string, DimEntry>;
  const strong = (content.strong_areas ?? []) as AreaEntry[];
  const weak = (content.weak_areas ?? []) as AreaEntry[];
  const incidents = (content.incidents ?? []) as IncidentEntry[];
  const lowExcluded = (content.low_confidence_excluded as number) ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-semibold tabular-nums text-[#fafafa]">
              {report.overall === null ? "—" : report.overall.toFixed(1)}
            </span>
            <span className={cn("text-[18px] font-medium", gradeColor(report.judgment_grade))}>
              {report.judgment_grade ?? "N/A"}
            </span>
          </div>
          <p className="text-[11px] text-[#52525b]">
            {report.decisions_analyzed} decisions analyzed
            {lowExcluded > 0 ? ` · ${lowExcluded} low-confidence excluded` : ""}
          </p>
        </div>
        <a
          href={`/api/evaluation/reports/${report.id}/pdf`}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#27272a] bg-[#0a0a0a] px-4 py-2 text-[13px] font-medium text-[#fafafa] transition hover:bg-[#141414]"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </a>
      </div>

      {narrative ? (
        <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
          <p className="text-[13px] leading-relaxed text-[#d4d4d8]">{narrative}</p>
        </div>
      ) : null}

      <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
        <h3 className="mb-3 text-[13px] font-medium text-[#fafafa]">Dimension scores</h3>
        <div className="space-y-2">
          {Object.entries(dimensions).map(([key, d]) => (
            <div key={key} className="flex items-center justify-between text-[12px]">
              <span className="text-[#d4d4d8]">{d.label}</span>
              <span className="tabular-nums text-[#a1a1aa]">
                {d.mean === null ? (
                  <span className="text-[#52525b]">abstained</span>
                ) : (
                  <>
                    {d.mean.toFixed(1)}
                    {d.stdev !== null ? (
                      <span className="ml-1 text-[10px] text-[#52525b]">±{d.stdev}</span>
                    ) : null}
                    <span className="ml-1 text-[10px] text-[#52525b]">n={d.n}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
          <h3 className="mb-2 text-[13px] font-medium text-[#86efac]">Strong areas</h3>
          {strong.filter((s) => s.mean !== null).length === 0 ? (
            <p className="text-[12px] text-[#71717a]">Insufficient data.</p>
          ) : (
            strong
              .filter((s) => s.mean !== null)
              .map((s) => (
                <p key={s.label} className="text-[12px] text-[#d4d4d8]">
                  {s.label} — {s.mean?.toFixed(1)}
                </p>
              ))
          )}
        </div>
        <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
          <h3 className="mb-2 text-[13px] font-medium text-[#fca5a5]">Weak areas</h3>
          {weak.filter((w) => w.mean !== null).length === 0 ? (
            <p className="text-[12px] text-[#71717a]">Insufficient data.</p>
          ) : (
            weak
              .filter((w) => w.mean !== null)
              .map((w) => (
                <p key={w.label} className="text-[12px] text-[#d4d4d8]">
                  {w.label} — {w.mean?.toFixed(1)}
                </p>
              ))
          )}
        </div>
      </div>

      {incidents.length > 0 ? (
        <div className="rounded-[10px] border border-[#27272a] bg-[#0a0a0a] p-4">
          <h3 className="mb-3 text-[13px] font-medium text-[#fafafa]">
            Incidents (evidence-backed)
          </h3>
          <div className="space-y-2">
            {incidents.slice(0, 12).map((inc, i) => (
              <div key={i} className="border-l-2 border-[#3f3f46] pl-3">
                <p className="text-[12px] text-[#d4d4d8]">
                  <span className="capitalize text-[#fbbf24]">{inc.severity}</span> · {inc.dimension}
                  {inc.description ? ` — ${inc.description}` : ""}
                </p>
                {inc.evidence ? (
                  <p className="mt-0.5 text-[11px] italic text-[#71717a]">“{inc.evidence}”</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ReportsManager({ initialReports }: { initialReports: ReportSummary[] }) {
  const [reports] = useState<ReportSummary[]>(initialReports);
  const [selected, setSelected] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function openReport(id: string) {
    setLoadingId(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/evaluation/reports/${id}`);
      if (res.ok) setSelected((await res.json()) as ReportDetail);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="border-b border-[#27272a] pb-5">
        <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">Reports</h1>
        <p className="mt-1 text-[13px] text-[#71717a]">
          A transparent judgment report is generated automatically every 200 evaluated decisions.
          Every figure is computed from stored evaluations; every claim cites evidence.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#27272a] px-4 py-12 text-center text-[13px] text-[#71717a]">
          No reports yet. Reports appear once an agent crosses 200 evaluated decisions.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-2">
            {reports.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => openReport(r.id)}
                disabled={loadingId === r.id}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition disabled:cursor-wait disabled:opacity-70",
                  selected?.id === r.id
                    ? "border-[#3f3f46] bg-[#141414]"
                    : "border-[#27272a] bg-[#0a0a0a] hover:bg-[#141414]",
                )}
              >
                {loadingId === r.id ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#a1a1aa]" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-[#a1a1aa]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] capitalize text-[#fafafa]">
                    {(r.agent_id ?? "unknown").replace(/_/g, " ")}
                  </p>
                  <p className="text-[11px] text-[#52525b]">
                    {new Date(r.generated_at).toLocaleDateString()} · {r.decisions_analyzed} decisions
                  </p>
                </div>
                <span className={cn("text-[16px] font-semibold", gradeColor(r.judgment_grade))}>
                  {r.judgment_grade ?? "—"}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-[10px] border border-[#27272a] bg-[#050505] p-5">
            {loading ? (
              <p className="text-[13px] text-[#71717a]">Loading report…</p>
            ) : selected ? (
              <ReportDetailView report={selected} />
            ) : (
              <p className="text-[13px] text-[#71717a]">Select a report to view the breakdown.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
