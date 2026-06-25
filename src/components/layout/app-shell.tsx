"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";

interface AppShellProps {
  children: React.ReactNode;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
}

export function AppShell({ children, workspaceName, workspaceSlug }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black text-[#fafafa]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 z-30 hidden w-[220px] border-r border-[#27272a] md:flex md:flex-col">
        <Sidebar workspaceName={workspaceName} workspaceSlug={workspaceSlug} />
      </aside>

      <div className="flex flex-1 flex-col md:pl-[220px]">
        {/* Mobile header */}
        <header className="flex h-12 items-center justify-between border-b border-[#27272a] bg-black px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-dark.png"
              alt="Histeeria"
              width={18}
              height={18}
              className="h-4 w-auto object-contain"
            />
            <span className="text-[13px] font-medium text-[#a1a1aa]">Histeeria</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-1.5 text-[#71717a] hover:bg-[#141414] hover:text-[#fafafa]"
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
            <div className="relative flex w-[220px] flex-col border-r border-[#27272a] bg-black">
              <Sidebar
                workspaceName={workspaceName}
                workspaceSlug={workspaceSlug}
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
