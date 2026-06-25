const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type MeResponse = {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
    onboarded: boolean;
    organization_id: string | null;
  };
  organization: {
    id: string;
    workspace_name: string;
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
  agent_name: string;
  domain_name: string;
  agent_description: string;
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
  output_preview: string;
  input_tokens: number | null;
  output_tokens: number | null;
  sdk_version: string | null;
  status: string;
  received_at: string;
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

export async function getDecisions(token: string, limit = 25) {
  return apiFetch<DecisionListResponse>(`/v1/decisions?limit=${limit}`, { token });
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
