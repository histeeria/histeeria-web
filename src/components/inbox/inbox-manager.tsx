"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CreditCard,
  Loader2,
  Megaphone,
  Sparkles,
} from "lucide-react";

import type { InboxMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

type InboxFilter = "all" | "alerts" | "billing" | "updates";

const FILTER_TYPES: Record<InboxFilter, string[] | null> = {
  all: null,
  alerts: ["heuristic_alert", "evaluation_alert"],
  billing: ["payment"],
  updates: ["changelog", "system"],
};

function typeIcon(type: string) {
  if (type === "payment") return CreditCard;
  if (type === "changelog" || type === "system") return Megaphone;
  if (type === "evaluation_alert") return AlertTriangle;
  return Sparkles;
}

function severityStyles(severity: string) {
  if (severity === "high" || severity === "critical") {
    return "border-[#7f1d1d]/40 bg-[#7f1d1d]/10";
  }
  if (severity === "medium") {
    return "border-[#78350f]/40 bg-[#78350f]/10";
  }
  return "border-[#27272a] bg-[#141414]";
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface InboxManagerProps {
  workspaceSlug: string;
  initialMessages: InboxMessage[];
  initialUnreadCount: number;
}

export function InboxManager({
  workspaceSlug,
  initialMessages,
  initialUnreadCount,
}: InboxManagerProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [selectedId, setSelectedId] = useState<string | null>(initialMessages[0]?.id ?? null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/inbox");
    if (!res.ok) return;
    const data = (await res.json()) as { messages: InboxMessage[]; unread_count: number };
    setMessages(data.messages);
    setUnreadCount(data.unread_count);
    window.dispatchEvent(new CustomEvent("inbox:updated", { detail: data.unread_count }));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(refresh, 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const filtered = messages.filter((message) => {
    const allowed = FILTER_TYPES[filter];
    if (!allowed) return true;
    return allowed.includes(message.type);
  });

  const selected = filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null;

  async function openMessage(message: InboxMessage) {
    setSelectedId(message.id);
    if (message.read_at) return;

    setLoadingId(message.id);
    try {
      const res = await fetch(`/api/inbox/${message.id}/read`, { method: "POST" });
      if (res.ok) {
        const updated = (await res.json()) as InboxMessage;
        setMessages((current) =>
          current.map((m) => (m.id === updated.id ? updated : m)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        window.dispatchEvent(
          new CustomEvent("inbox:updated", { detail: Math.max(0, unreadCount - 1) }),
        );
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/inbox", { method: "POST" });
      if (res.ok) {
        const now = new Date().toISOString();
        setMessages((current) => current.map((m) => ({ ...m, read_at: m.read_at ?? now })));
        setUnreadCount(0);
        window.dispatchEvent(new CustomEvent("inbox:updated", { detail: 0 }));
      }
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#27272a] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#71717a]" />
            <h1 className="text-[22px] font-medium tracking-tight text-[#fafafa]">Inbox</h1>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-[#fafafa] px-2 py-0.5 text-[11px] font-medium text-black">
                {unreadCount} unread
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-[#71717a]">
            Judgment alerts, billing notices, and product updates from Histeeria.
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-4 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa] disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1">
        {(["all", "alerts", "billing", "updates"] as InboxFilter[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1.5 text-[13px] capitalize transition",
              filter === tab
                ? "bg-[#27272a] text-[#fafafa]"
                : "text-[#71717a] hover:bg-[#141414] hover:text-[#a1a1aa]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#27272a] px-4 py-12 text-center">
              <p className="text-[13px] text-[#71717a]">No messages in this filter.</p>
            </div>
          ) : (
            filtered.map((message) => {
              const Icon = typeIcon(message.type);
              const isUnread = !message.read_at;
              const isSelected = selected?.id === message.id;
              return (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => openMessage(message)}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-3 rounded-[10px] border px-4 py-3 text-left transition",
                    isSelected ? "border-[#52525b] bg-[#141414]" : "border-[#27272a] bg-[#0a0a0a] hover:border-[#3f3f46]",
                    isUnread && !isSelected && "border-[#3f3f46]",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                      severityStyles(message.severity),
                    )}
                  >
                    {loadingId === message.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#71717a]" />
                    ) : (
                      <Icon className="h-4 w-4 text-[#a1a1aa]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-[13px]",
                          isUnread ? "font-medium text-[#fafafa]" : "text-[#a1a1aa]",
                        )}
                      >
                        {message.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-[#52525b]">
                        {relativeTime(message.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] text-[#71717a]">{message.body}</p>
                  </div>
                  {isUnread ? (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#86efac]" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        <div className="rounded-[12px] border border-[#27272a] bg-[#0a0a0a] p-5 lg:min-h-[420px]">
          {selected ? (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#52525b]">
                  {selected.type.replace(/_/g, " ")}
                </p>
                <h2 className="mt-1 text-[18px] font-medium text-[#fafafa]">{selected.title}</h2>
                <p className="mt-1 text-[12px] text-[#52525b]">
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-[12px] font-medium uppercase tracking-wide text-[#71717a]">
                  What happened
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#d4d4d8]">{selected.body}</p>
              </div>

              {selected.agent_id ? (
                <div>
                  <h3 className="text-[12px] font-medium uppercase tracking-wide text-[#71717a]">
                    Agent
                  </h3>
                  <p className="mt-1 font-mono text-[13px] text-[#fafafa]">{selected.agent_id}</p>
                </div>
              ) : null}

              {selected.decision_id ? (
                <div>
                  <h3 className="text-[12px] font-medium uppercase tracking-wide text-[#71717a]">
                    Decision
                  </h3>
                  <Link
                    href={`/${workspaceSlug}/agents/monitoring?decision=${selected.decision_id}`}
                    className="mt-1 inline-flex cursor-pointer font-mono text-[12px] text-[#a1a1aa] hover:text-[#fafafa]"
                  >
                    View in Monitoring →
                  </Link>
                </div>
              ) : null}

              {selected.recommended_fix ? (
                <div className="rounded-[10px] border border-[#14532d]/30 bg-[#14532d]/10 p-4">
                  <h3 className="text-[12px] font-medium uppercase tracking-wide text-[#86efac]">
                    Recommended fix
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#d4d4d8]">
                    {selected.recommended_fix}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center text-[13px] text-[#71717a]">
              Select a message
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function dispatchInboxUpdated(unreadCount: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("inbox:updated", { detail: unreadCount }));
  }
}
