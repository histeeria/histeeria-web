const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type MeResponse = {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: string | null;
    heard_from: string | null;
    created_at: string;
    onboarded: boolean;
    organization_id: string | null;
  };
  organization: {
    id: string;
    workspace_name: string;
    workspace_slug: string | null;
    team_size: string | null;
    team_members: string | null;
    agent_name: string;
    domain_name: string;
    agent_description: string | null;
    onboarded: boolean;
    key_prefix: string | null;
    key_suffix: string | null;
    include_system_prompt_in_monitoring: boolean;
  } | null;
};

export type OnboardingPayload = {
  workspace_name: string;
  workspace_slug: string;
  team_size?: string;
  team_members?: string;
  agent_name: string;
  domain_name: string;
  agent_description: string;
  full_name: string;
  role?: string;
  heard_from?: string;
};

export type OnboardingResponse = {
  organization_id: string;
  api_key: string;
  key_prefix: string;
  message: string;
};

export type DecisionSummary = {
  id: string;
  agent_id: string | null;
  session_id: string | null;
  domain: string | null;
  input_preview: string;
  output_preview: string;
  has_reasoning: boolean;
  input_tokens: number | null;
  output_tokens: number | null;
  sdk_version: string | null;
  status: string;
  received_at: string;
};

export type DecisionDetail = {
  id: string;
  agent_id: string | null;
  session_id: string | null;
  domain: string | null;
  input: unknown;
  output: string;
  metadata: Record<string, unknown> | null;
  input_tokens: number | null;
  output_tokens: number | null;
  sdk_version: string | null;
  status: string;
  received_at: string;
};

export type AgentSummary = {
  agent_id: string;
  decision_count: number;
  last_received_at: string | null;
};

export type DecisionListResponse = {
  decisions: DecisionSummary[];
  total: number;
};

export type DecisionStats = {
  total: number;
  queued: number;
  evaluated: number;
  agents: number;
  last_received_at: string | null;
};

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(", ")
          : "Request failed";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function syncUser(email: string, full_name?: string | null) {
  return apiFetch<MeResponse["user"]>("/v1/auth/sync", {
    method: "POST",
    body: JSON.stringify({ email, full_name }),
  });
}

export async function getMe(token: string) {
  return apiFetch<MeResponse>("/v1/auth/me", { token });
}

export type SlugCheckResponse = {
  available: boolean;
  slug: string;
  reason: string | null;
};

export async function checkWorkspaceSlug(token: string, slug: string) {
  const params = new URLSearchParams({ slug });
  return apiFetch<SlugCheckResponse>(`/v1/onboarding/check-slug?${params.toString()}`, { token });
}

export async function completeOnboarding(token: string, payload: OnboardingPayload) {
  return apiFetch<OnboardingResponse>("/v1/onboarding", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function regenerateApiKey(token: string) {
  return apiFetch<OnboardingResponse>("/v1/onboarding/regenerate-key", {
    method: "POST",
    token,
  });
}

export type ApiKeyPermission = "read" | "write" | "read_write";

export type ApiKeySummary = {
  id: string;
  name: string;
  agent_name: string;
  status: "active" | "revoked";
  tracking_id: string;
  secret_masked: string;
  permissions: ApiKeyPermission;
  created_at: string;
  last_used_at: string | null;
  created_by_name: string | null;
};

export type ApiKeyListResponse = {
  keys: ApiKeySummary[];
};

export type ApiKeyCreatePayload = {
  name: string;
  agent_name: string;
  permissions: ApiKeyPermission;
};

export type ApiKeyCreateResponse = ApiKeySummary & {
  api_key: string;
  message: string;
};

export type ApiKeyUpdatePayload = {
  name?: string;
  permissions?: ApiKeyPermission;
};

export async function listApiKeys(token: string) {
  return apiFetch<ApiKeyListResponse>("/v1/api-keys", { token });
}

export async function createApiKey(token: string, payload: ApiKeyCreatePayload) {
  return apiFetch<ApiKeyCreateResponse>("/v1/api-keys", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateApiKey(token: string, keyId: string, payload: ApiKeyUpdatePayload) {
  return apiFetch<ApiKeySummary>(`/v1/api-keys/${keyId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteApiKey(token: string, keyId: string) {
  const response = await fetch(`${API_URL}/v1/api-keys/${keyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? "Failed to delete API key");
  }
}

export async function getDecisions(
  token: string,
  options: { limit?: number; offset?: number; agentId?: string } = {},
) {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 50));
  if (options.offset) params.set("offset", String(options.offset));
  if (options.agentId) params.set("agent_id", options.agentId);
  return apiFetch<DecisionListResponse>(`/v1/decisions?${params.toString()}`, { token });
}

export async function getDecision(token: string, decisionId: string) {
  return apiFetch<DecisionDetail>(`/v1/decisions/${decisionId}`, { token });
}

export async function getDecisionAgents(token: string) {
  return apiFetch<{ agents: AgentSummary[] }>("/v1/decisions/agents", { token });
}

export async function getDecisionStats(token: string) {
  return apiFetch<DecisionStats>("/v1/decisions/stats", { token });
}

export type WorkspaceSettings = {
  include_system_prompt_in_monitoring: boolean;
};

// --- Unified settings ------------------------------------------------------

export type SettingsResponse = {
  account: {
    email: string;
    full_name: string | null;
    role: string | null;
    plan: string;
  };
  workspace: {
    workspace_name: string;
    workspace_slug: string | null;
    agent_name: string;
    domain_name: string;
    agent_description: string | null;
    team_size: string | null;
    team_members: string | null;
    include_system_prompt_in_monitoring: boolean;
  };
  team: {
    team_size: string | null;
    team_members: string | null;
    invite_path: string | null;
  };
  evaluation: {
    warmup_min_decisions: number;
    report_every: number;
    incident_threshold: number;
    streak_threshold: number;
    llm_enabled: boolean;
    judge_model: string;
    adjudicator_model: string;
  };
};

export type SettingsUpdate = {
  full_name?: string | null;
  role?: string | null;
  workspace_name?: string | null;
  workspace_slug?: string | null;
  agent_name?: string | null;
  domain_name?: string | null;
  agent_description?: string | null;
  team_size?: string | null;
  team_members?: string | null;
  include_system_prompt_in_monitoring?: boolean;
};

export async function getSettings(token: string) {
  return apiFetch<SettingsResponse>("/v1/settings", { token });
}

export async function updateSettings(token: string, payload: SettingsUpdate) {
  return apiFetch<SettingsResponse>("/v1/settings", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

// --- Evaluation engine ---------------------------------------------------

export type EvalEngineConfig = {
  warmup_min_decisions: number;
  batch_size: number;
  report_every: number;
  clean_sample_rate: number;
  incident_threshold: number;
  streak_threshold: number;
  llm_enabled: boolean;
  judge_model: string;
  adjudicator_model: string;
};

export type AgentPipelineState = {
  agent_id: string | null;
  total_observations: number;
  evaluated_count: number;
  warmed_up: boolean;
  warmup_remaining: number;
  next_report_in: number;
  last_evaluated_at: string | null;
};

export type EvaluationStatus = {
  config: EvalEngineConfig;
  agents: AgentPipelineState[];
  pending_evaluations: number;
};

export type DimensionScore = {
  dimension: string;
  label: string;
  mean: number | null;
  n: number;
};

export type EvalFlag = {
  dimension: string;
  severity: string;
  description: string;
  evidence: string;
};

export type EvaluationItem = {
  id: string;
  decision_id: string;
  overall: number | null;
  confidence: string;
  abstained: string[];
  flags: EvalFlag[];
  reasoning: string | null;
  judge_model: string | null;
  evaluated_at: string;
};

export type IncidentItem = {
  id: string;
  dimension: string;
  severity: string;
  description: string | null;
  evidence_quote: string | null;
  decision_id: string | null;
  resolved: boolean;
  created_at: string;
};

export type JudgementResponse = {
  agent_id: string | null;
  overall: number | null;
  grade: string;
  evaluated_count: number;
  low_confidence_count: number;
  dimensions: DimensionScore[];
  current_streak: number;
  longest_streak: number;
  recent_evaluations: EvaluationItem[];
  incidents: IncidentItem[];
};

export type GraphPoint = {
  date: string;
  overall: number | null;
  evaluated_count: number;
  incident_count: number;
};

export type GraphResponse = { agent_id: string | null; points: GraphPoint[] };

export type ReportSummary = {
  id: string;
  agent_id: string | null;
  judgment_grade: string | null;
  overall: number | null;
  decisions_analyzed: number;
  generated_at: string;
};

export type ReportDetail = ReportSummary & {
  content: Record<string, unknown>;
};

export async function getEvaluationStatus(token: string) {
  return apiFetch<EvaluationStatus>("/v1/evaluation/status", { token });
}

export async function getJudgement(token: string, agentId?: string) {
  const params = agentId ? `?agent_id=${encodeURIComponent(agentId)}` : "";
  return apiFetch<JudgementResponse>(`/v1/evaluation/judgement${params}`, { token });
}

export async function getEvaluationGraph(token: string, agentId?: string, days = 90) {
  const params = new URLSearchParams({ days: String(days) });
  if (agentId) params.set("agent_id", agentId);
  return apiFetch<GraphResponse>(`/v1/evaluation/graph?${params.toString()}`, { token });
}

export async function listReports(token: string, agentId?: string) {
  const params = agentId ? `?agent_id=${encodeURIComponent(agentId)}` : "";
  return apiFetch<{ reports: ReportSummary[] }>(`/v1/evaluation/reports${params}`, { token });
}

export async function getReport(token: string, reportId: string) {
  return apiFetch<ReportDetail>(`/v1/evaluation/reports/${reportId}`, { token });
}

export async function runEvaluation(token: string, agentId?: string, limit = 100) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (agentId) params.set("agent_id", agentId);
  return apiFetch<{ processed: number; evaluated: number; screened: number; warming_up: number; failed: number }>(
    `/v1/evaluation/run?${params.toString()}`,
    { method: "POST", token },
  );
}

export async function getWorkspaceSettings(token: string) {
  return apiFetch<WorkspaceSettings>("/v1/workspace/settings", { token });
}

export async function updateWorkspaceSettings(
  token: string,
  payload: WorkspaceSettings,
) {
  return apiFetch<WorkspaceSettings>("/v1/workspace/settings", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

// --- Agent profiles --------------------------------------------------------

export type ProfileLink = { label: string; url: string };

export type PublicSections = {
  summary: boolean;
  judgment_graph: boolean;
  dimensions: boolean;
  flags: boolean;
  worst_decisions: boolean;
  cost_trends: boolean;
};

export type ProfileDashboardJudgement = {
  overall: number | null;
  grade: string;
  evaluated_count: number;
  current_streak: number;
  longest_streak: number;
  dimensions: Array<{ dimension: string; label: string; mean: number | null; n: number }>;
};

export type CommonFlagItem = {
  label: string;
  dimension: string;
  severity: string;
  count: number;
};

export type WorstDecisionItem = {
  evaluation_id: string;
  decision_id: string;
  overall: number | null;
  input_preview: string;
  output_preview: string;
  flags: Array<{ dimension: string; severity: string; description: string; evidence: string }>;
  evaluated_at: string;
};

export type CostTrendPoint = {
  date: string;
  cost_usd: number;
  prompt_tokens: number;
  completion_tokens: number;
  evaluations: number;
};

export type ProfileDashboardSections = {
  judgement: ProfileDashboardJudgement | null;
  judgment_graph: GraphPoint[];
  common_flags: CommonFlagItem[];
  worst_decisions: WorstDecisionItem[];
  cost_trends: CostTrendPoint[];
  show_summary?: boolean;
  show_dimensions?: boolean;
};

export type AgentProfileDashboard = {
  has_sdk_agent: boolean;
  sdk_agent_id: string | null;
  sections: ProfileDashboardSections;
};

export type AgentProfileSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  sdk_agent_id: string | null;
  is_public: boolean;
  links: ProfileLink[];
  public_sections: PublicSections;
  created_at: string;
  updated_at: string;
};

export type AgentProfileDetailResponse = {
  profile: AgentProfileSummary;
  dashboard: AgentProfileDashboard;
};

export type AgentProfilePayload = {
  name: string;
  slug?: string | null;
  description?: string | null;
  domain?: string | null;
  sdk_agent_id?: string | null;
  is_public?: boolean;
  links?: ProfileLink[];
  public_sections?: Partial<PublicSections>;
};

export type PublicAgentProfile = {
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  sdk_agent_id: string | null;
  workspace_name: string;
  workspace_slug: string;
  links: ProfileLink[];
  public_sections: PublicSections;
  updated_at: string;
  dashboard: AgentProfileDashboard;
};

export async function getAgentProfileDetail(token: string, id: string) {
  return apiFetch<AgentProfileDetailResponse>(`/v1/agent-profiles/${id}`, { token });
}

export async function listAgentProfiles(token: string) {
  return apiFetch<{ profiles: AgentProfileSummary[] }>("/v1/agent-profiles", { token });
}

export async function createAgentProfile(token: string, payload: AgentProfilePayload) {
  return apiFetch<AgentProfileSummary>("/v1/agent-profiles", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateAgentProfile(
  token: string,
  id: string,
  payload: Partial<AgentProfilePayload>,
) {
  return apiFetch<AgentProfileSummary>(`/v1/agent-profiles/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteAgentProfile(token: string, id: string) {
  return apiFetch<void>(`/v1/agent-profiles/${id}`, { method: "DELETE", token });
}

export async function getPublicAgentProfile(workspaceSlug: string, profileSlug: string) {
  return apiFetch<PublicAgentProfile>(
    `/v1/public/${encodeURIComponent(workspaceSlug)}/profiles/${encodeURIComponent(profileSlug)}`,
  );
}

export type PublicProfileIndexItem = {
  workspace_slug: string;
  slug: string;
  updated_at: string;
};

export async function listPublicAgentProfiles() {
  const data = await apiFetch<{ profiles: PublicProfileIndexItem[] }>("/v1/public/profiles");
  return data.profiles;
}

// --- Inbox ---------------------------------------------------------------

export type InboxMessage = {
  id: string;
  type: string;
  severity: string;
  title: string;
  body: string;
  agent_id: string | null;
  decision_id: string | null;
  evaluation_id: string | null;
  recommended_fix: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type InboxListResponse = {
  messages: InboxMessage[];
  unread_count: number;
};

export async function getInbox(token: string) {
  return apiFetch<InboxListResponse>("/v1/inbox", { token });
}

export async function getInboxUnreadCount(token: string) {
  return apiFetch<{ unread_count: number }>("/v1/inbox/unread-count", { token });
}

export async function markInboxRead(token: string, messageId: string) {
  return apiFetch<InboxMessage>(`/v1/inbox/${messageId}/read`, { method: "POST", token });
}

export async function markAllInboxRead(token: string) {
  return apiFetch<{ updated: number }>("/v1/inbox/read-all", { method: "POST", token });
}

export const DOMAINS = [
  {
    value: "customer_support",
    label: "Customer Support",
    description: "Tickets, refunds, and customer-facing decisions",
  },
  {
    value: "security",
    label: "Security",
    description: "Threat detection, access control, and incident response",
  },
  {
    value: "legal",
    label: "Legal",
    description: "Compliance, contracts, and policy interpretation",
  },
  {
    value: "medical",
    label: "Medical",
    description: "Clinical guidance and healthcare workflows",
  },
  {
    value: "financial",
    label: "Financial",
    description: "Payments, fraud, and financial risk decisions",
  },
  {
    value: "general",
    label: "General",
    description: "Multi-purpose agents across varied tasks",
  },
] as const;
