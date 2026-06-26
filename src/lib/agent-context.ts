import type { AgentContext } from "@/lib/api";

export type ContextSectionKey = keyof AgentContext;

export type ContextFieldDef = {
  key: string;
  label: string;
  placeholder: string;
  rows?: number;
};

export type ContextGroupDef = {
  title: string;
  subtitle: string;
  layer: "who" | "knows" | "behaves";
  section: ContextSectionKey;
  publicKey: string;
  fields: ContextFieldDef[];
};

export const CONTEXT_GROUPS: ContextGroupDef[] = [
  {
    title: "Identity & Role",
    subtitle: "Who the agent is — name, role, persona, capabilities",
    layer: "who",
    section: "identity",
    publicKey: "identity",
    fields: [
      { key: "role_description", label: "Role description", placeholder: "e.g. Security analyst agent for cloud infrastructure", rows: 2 },
      { key: "persona", label: "Persona & tone", placeholder: "Formal, concise, escalates when uncertain", rows: 3 },
      { key: "capabilities_summary", label: "What it can do", placeholder: "Scan repos, triage alerts, draft remediation steps", rows: 3 },
      { key: "limitations", label: "What it cannot do", placeholder: "No direct production changes without approval", rows: 2 },
    ],
  },
  {
    title: "Purpose & Goals",
    subtitle: "What the agent optimizes for",
    layer: "behaves",
    section: "purpose",
    publicKey: "purpose",
    fields: [
      { key: "primary_objective", label: "Primary objective", placeholder: "Minimize false positives while catching real threats", rows: 2 },
      { key: "secondary_goals", label: "Secondary goals", placeholder: "Be concise, cite evidence, escalate when unsure", rows: 2 },
      { key: "success_criteria", label: "Success criteria", placeholder: "How it knows it did well", rows: 2 },
      { key: "failure_modes", label: "Failure modes", placeholder: "What it must never do, even if asked", rows: 2 },
    ],
  },
  {
    title: "Operational Context",
    subtitle: "Where it runs and what it can access",
    layer: "knows",
    section: "operational",
    publicKey: "operational",
    fields: [
      { key: "environment", label: "Environment", placeholder: "API, chat UI, background job, CLI", rows: 2 },
      { key: "available_tools", label: "Available tools", placeholder: "List tools with brief descriptions", rows: 4 },
      { key: "permissions_boundary", label: "Permissions boundary", placeholder: "Read/write/execute limits", rows: 3 },
      { key: "session_state_notes", label: "Session state", placeholder: "What it remembers within a session", rows: 2 },
    ],
  },
  {
    title: "Knowledge Base",
    subtitle: "Domain facts, constraints, and known unknowns",
    layer: "knows",
    section: "knowledge",
    publicKey: "knowledge",
    fields: [
      { key: "domain_knowledge", label: "Domain knowledge", placeholder: "Injected facts, docs, RAG context", rows: 4 },
      { key: "constraints", label: "Constraints", placeholder: "Always-true rules in its world", rows: 3 },
      { key: "known_unknowns", label: "Known unknowns", placeholder: "Where it should defer or ask", rows: 2 },
    ],
  },
  {
    title: "Behavioral Rules",
    subtitle: "How it decides and outputs",
    layer: "behaves",
    section: "behavior",
    publicKey: "behavior",
    fields: [
      { key: "decision_heuristics", label: "Decision heuristics", placeholder: "Prefer X over Y when Z", rows: 3 },
      { key: "escalation_conditions", label: "Escalation conditions", placeholder: "When to stop and ask a human", rows: 2 },
      { key: "output_format", label: "Output format", placeholder: "JSON, markdown, plain text expectations", rows: 2 },
      { key: "guardrails", label: "Guardrails", placeholder: "Hard stops — no destructive ops without confirmation", rows: 3 },
    ],
  },
  {
    title: "Memory & State",
    subtitle: "Short-term, long-term, and task history",
    layer: "behaves",
    section: "memory",
    publicKey: "memory",
    fields: [
      { key: "short_term_context", label: "Short-term context", placeholder: "Current conversation or task window", rows: 2 },
      { key: "long_term_memory", label: "Long-term memory", placeholder: "Persistent facts about user/system", rows: 3 },
      { key: "task_history", label: "Task history", placeholder: "What it tried, what failed", rows: 2 },
    ],
  },
  {
    title: "Trust & Authorization",
    subtitle: "Who invoked it and what it may do",
    layer: "behaves",
    section: "trust",
    publicKey: "trust",
    fields: [
      { key: "authorization_notes", label: "Authorization", placeholder: "Who invoked it, role, org, allowed actions", rows: 3 },
      { key: "audit_trail", label: "Audit trail", placeholder: "Should it log actions? What gets recorded?", rows: 2 },
    ],
  },
];

export const LAYER_META = {
  who: { label: "Who it is", color: "from-violet-500/20 to-violet-500/5" },
  knows: { label: "What it knows", color: "from-sky-500/20 to-sky-500/5" },
  behaves: { label: "How it behaves", color: "from-emerald-500/20 to-emerald-500/5" },
} as const;

export function emptyAgentContext(): AgentContext {
  return {
    identity: { role_description: null, persona: null, capabilities_summary: null, limitations: null },
    purpose: { primary_objective: null, secondary_goals: null, success_criteria: null, failure_modes: null },
    operational: { environment: null, available_tools: null, permissions_boundary: null, session_state_notes: null },
    knowledge: { domain_knowledge: null, constraints: null, known_unknowns: null },
    behavior: { decision_heuristics: null, escalation_conditions: null, output_format: null, guardrails: null },
    memory: { short_term_context: null, long_term_memory: null, task_history: null },
    trust: { authorization_notes: null, audit_trail: null },
  };
}

export function contextSectionHasContent(section: ContextSectionKey, context: AgentContext): boolean {
  const group = context[section];
  return Object.values(group).some((v) => typeof v === "string" && v.trim().length > 0);
}
