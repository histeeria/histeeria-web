"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ChevronDown,
  Compass,
  FileText,
  FolderGit2,
  GraduationCap,
  HelpCircle,
  Inbox,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
}

export function AppShell({ children, workspaceName, workspaceSlug }: AppShellProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const baseDashPath = workspaceSlug ? `/${workspaceSlug}/dashboard` : "/dashboard";

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    external?: boolean;
  }

  // Sidebar sections and items with respective active states
  const navigation: { section: string; items: NavItem[] }[] = [
    {
      section: "Workspace",
      items: [
        { name: "Inbox", href: baseDashPath, icon: Inbox, badge: "2" },
        { name: "Projects", href: baseDashPath, icon: FolderGit2 },
      ],
    },
    {
      section: "Monitoring",
      items: [
        { name: "Agent Logs", href: baseDashPath, icon: FileText },
        { name: "Live Feed", href: baseDashPath, icon: Activity },
      ],
    },
    {
      section: "Judgements",
      items: [
        { name: "Education", href: baseDashPath, icon: GraduationCap },
        { name: "Audit Trail", href: baseDashPath, icon: ShieldCheck },
      ],
    },
    {
      section: "Team",
      items: [
        { name: "Settings", href: baseDashPath, icon: Settings },
        { name: "Members", href: baseDashPath, icon: Users },
      ],
    },
    {
      section: "Histeeria",
      items: [
        { name: "Documentation", href: "https://histeeria.com/docs", icon: Compass, external: true },
        { name: "Help & Support", href: "mailto:support@histeeria.com", icon: HelpCircle, external: true },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#06070a] text-foreground">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Workspace Dropdown Selector */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-[#0d121c] p-1">
              <Image
                src="/logo-dark.png"
                alt="Histeeria"
                width={20}
                height={24}
                className="h-5 w-auto object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted select-none">
                Workspace
              </p>
              <h2 className="truncate text-sm font-semibold text-foreground">
                {workspaceName ?? "Histeeria Labs"}
              </h2>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted/70 cursor-pointer hover:text-foreground transition-colors" />
        </div>

        {/* Global Command Search Box */}
        <div className="px-3">
          <div className="group flex items-center justify-between rounded-lg border border-border-strong bg-[#0c1018]/50 px-3 py-2 text-xs text-muted cursor-pointer hover:border-accent/40 hover:bg-[#131a26]/40 transition-all select-none">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted group-hover:text-foreground transition-colors" />
              <span className="group-hover:text-foreground transition-colors">Search...</span>
            </div>
            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-mono border border-border-strong uppercase">
              Ctrl+K
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="space-y-4 px-3 overflow-y-auto max-h-[calc(100vh-210px)] select-none">
          {navigation.map((section) => (
            <div key={section.section} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted/50">
                {section.section}
              </p>
              <div className="space-y-[2px]">
                {section.items.map((item) => {
                  const isActive = pathname === item.href && !item.external;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className={cn(
                        "group flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
                        isActive
                          ? "bg-accent-soft text-accent border border-accent/20"
                          : "text-muted hover:bg-surface-2/65 hover:text-foreground border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive ? "text-accent" : "text-muted group-hover:text-foreground"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className="rounded bg-accent-soft border border-accent/25 px-1.5 py-0.2 text-[10px] font-semibold tabular-nums text-accent">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Profile Footer Section */}
      <div className="border-t border-border/40 p-3 select-none">
        <div className="flex items-center justify-between rounded-lg bg-[#0c1018]/50 p-2.5 border border-border/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white uppercase shadow-[0_4px_12px_rgba(124,140,255,0.22)]">
              {session?.user?.name ? session.user.name[0] : (session?.user?.email?.[0] ?? "H")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {session?.user?.name ?? "Alex Mercer"}
              </p>
              <p className="truncate text-[10px] font-medium text-muted/75">
                admin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-3 hover:text-danger transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#030407] text-foreground">
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex md:w-[240px] md:flex-col md:fixed md:inset-y-0 border-r border-border/40 bg-[#06070a] z-30">
        {sidebarContent}
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:pl-[240px]">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border/40 bg-[#06070a]/95 px-4 backdrop-blur md:hidden z-20">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-dark.png"
              alt="Histeeria"
              width={20}
              height={24}
              className="h-5 w-auto object-contain"
            />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-bold">
              HISTEERIA
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground transition-all"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Sidebar Menu (Drawer overlay) */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <div className="relative flex w-[240px] flex-col bg-[#06070a] border-r border-border/40">
              {sidebarContent}
            </div>
          </div>
        ) : null}

        {/* Dynamic page content wrapper */}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
