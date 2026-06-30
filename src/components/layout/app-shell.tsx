"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 68;
const STORAGE_KEY = "histeeria.sidebar.collapsed";

interface AppShellProps {
  children: React.ReactNode;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  userAvatar?: string | null;
}

export function AppShell({ children, workspaceName, workspaceSlug, userAvatar }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="flex min-h-screen bg-black text-[#fafafa]">
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 z-30 hidden border-r border-[#27272a] transition-[width] duration-200 md:flex md:flex-col"
        style={{ width: sidebarWidth }}
      >
        <Sidebar
          workspaceName={workspaceName}
          workspaceSlug={workspaceSlug}
          userAvatar={userAvatar}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
      </aside>

      <div
        className="flex flex-1 flex-col transition-[padding-left] duration-200 md:pl-[var(--sidebar-w)]"
        style={{ "--sidebar-w": `${sidebarWidth}px` } as React.CSSProperties}
      >
        {/* Mobile header */}
        <header className="flex h-12 items-center justify-between border-b border-[#27272a] bg-black px-4 md:hidden">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-dark.png"
              alt="Histeeria"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <span className="text-[13px] font-medium text-[#a1a1aa]">Histeeria</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="cursor-pointer rounded-md p-1.5 text-[#71717a] hover:bg-[#141414] hover:text-[#fafafa]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/80"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex w-[240px] flex-col border-r border-[#27272a] bg-black">
              <Sidebar
                workspaceName={workspaceName}
                workspaceSlug={workspaceSlug}
                userAvatar={userAvatar}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        ) : null}

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
