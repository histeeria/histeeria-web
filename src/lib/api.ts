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
