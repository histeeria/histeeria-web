import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CreditCard,
  FileText,
  HelpCircle,
  History,
  Inbox,
  Key,
  LayoutDashboard,
  Scale,
  Settings,
  UserCircle,
  UserPlus,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  external?: boolean;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export function buildNavigation(slug: string): NavSection[] {
  const base = `/${slug}`;

  return [
    {
      section: "Workspace",
      items: [
        { name: "Inbox", href: `${base}/inbox`, icon: Inbox, badge: "2" },
        { name: "Overview", href: `${base}/dashboard`, icon: LayoutDashboard },
      ],
    },
    {
      section: "Agents",
      items: [
        { name: "Monitoring", href: `${base}/agents/monitoring`, icon: Activity },
        { name: "History", href: `${base}/agents/history`, icon: History },
        { name: "Profiles", href: `${base}/agents/profiles`, icon: UserCircle },
        { name: "Analytics", href: `${base}/agents/analytics`, icon: BarChart3 },
        { name: "API Keys", href: `${base}/agents/api-keys`, icon: Key },
      ],
    },
    {
      section: "Evaluation",
      items: [
        { name: "Reports", href: `${base}/evaluation/reports`, icon: FileText },
        { name: "Curriculum", href: `${base}/evaluation/curriculum`, icon: BookOpen },
        { name: "Judgement", href: `${base}/evaluation/judgement`, icon: Scale },
      ],
    },
    {
      section: "Team",
      items: [
        { name: "Invite Members", href: `${base}/team/invite`, icon: UserPlus },
        { name: "Settings", href: `${base}/team/settings`, icon: Settings },
      ],
    },
    {
      section: "Histeeria",
      items: [
        {
          name: "Documentation",
          href: "https://histeeria.com/docs",
          icon: BookOpen,
          external: true,
        },
        {
          name: "Help & Support",
          href: "mailto:support@histeeria.com",
          icon: HelpCircle,
          external: true,
        },
        {
          name: "Pricing",
          href: "https://histeeria.com/pricing",
          icon: CreditCard,
          external: true,
        },
      ],
    },
  ];
}

export const AGENT_SECTIONS = ["monitoring", "history", "profiles", "analytics", "api-keys"] as const;
export const EVALUATION_SECTIONS = ["reports", "curriculum", "judgement"] as const;
export const TEAM_SECTIONS = ["invite", "settings"] as const;

export const SECTION_LABELS: Record<string, string> = {
  monitoring: "Monitoring",
  history: "History",
  profiles: "Profiles",
  analytics: "Analytics",
  "api-keys": "API Keys",
  reports: "Reports",
  curriculum: "Curriculum",
  judgement: "Judgement",
  invite: "Invite Members",
  settings: "Settings",
  inbox: "Inbox",
};
