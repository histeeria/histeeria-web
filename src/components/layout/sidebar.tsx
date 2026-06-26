"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";

import { buildNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
  workspaceName,
  workspaceSlug,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const navigation = buildNavigation(workspaceSlug ?? "dashboard");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setWorkspaceOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function isActive(href: string, external?: boolean) {
    if (external) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const initials = session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "H";

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="flex h-full flex-col bg-black text-[#fafafa]">
      {/* Workspace switcher */}
      <div
        ref={workspaceRef}
        className={cn(
          "relative border-b border-[#27272a]",
          collapsed ? "px-2 py-3" : "px-3 py-3",
        )}
      >
        <button
          type="button"
          onClick={() => !collapsed && setWorkspaceOpen((v) => !v)}
          title={workspaceName ?? "Workspace"}
          className={cn(
            "flex w-full items-center rounded-[8px] transition hover:bg-[#141414] cursor-pointer",
            collapsed ? "justify-center p-1.5" : "justify-between gap-2 p-1",
          )}
        >
          <div className={cn("flex min-w-0 items-center", collapsed ? "" : "gap-2.5")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#27272a] bg-[#141414]">
              <Image
                src="/logo-dark.png"
                alt="Histeeria"
                width={26}
                height={26}
                className="h-6 w-auto object-contain opacity-95"
              />
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[11px] text-[#52525b]">Workspace</p>
                <p className="truncate text-[13px] font-medium text-[#fafafa]">
                  {workspaceName ?? "Histeeria Labs"}
                </p>
              </div>
            ) : null}
          </div>
          {!collapsed ? (
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-[#52525b] transition",
                workspaceOpen && "rotate-180",
              )}
            />
          ) : null}
        </button>

        {workspaceOpen && !collapsed ? (
          <div className="absolute left-2 right-2 top-full z-50 mt-1 overflow-hidden rounded-[10px] border border-[#27272a] bg-[#0a0a0a] py-1 shadow-xl">
            <div className="flex items-center gap-2 px-3 py-2">
              <Check className="h-3.5 w-3.5 text-[#86efac]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[#fafafa]">
                  {workspaceName ?? "Histeeria Labs"}
                </p>
                <p className="truncate text-[11px] text-[#52525b]">/{workspaceSlug}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-[#27272a]" />
            <Link
              href="/onboarding"
              onClick={() => {
                setWorkspaceOpen(false);
                onNavigate?.();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] transition hover:bg-[#141414] hover:text-[#fafafa] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Create workspace
            </Link>
            <Link
              href={workspaceSlug ? `/${workspaceSlug}/team/invite` : "/onboarding"}
              onClick={() => {
                setWorkspaceOpen(false);
                onNavigate?.();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] transition hover:bg-[#141414] hover:text-[#fafafa] cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Join workspace
            </Link>
          </div>
        ) : null}
      </div>

      {/* Search */}
      {!collapsed ? (
        <div className="px-3 py-3">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[#71717a] transition hover:border-[#3f3f46] hover:text-[#a1a1aa]"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Search
            </span>
            <kbd className="rounded border border-[#27272a] bg-[#141414] px-1.5 py-0.5 font-mono text-[10px] text-[#52525b]">
              ⌘K
            </kbd>
          </button>
        </div>
      ) : null}

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 pb-4">
        {navigation.map((group) => (
          <div key={group.section} className="space-y-0.5">
            {!collapsed ? (
              <div className="flex items-center justify-between px-2 pb-1">
                <p className="text-[11px] font-medium text-[#52525b]">{group.section}</p>
                {group.addHref ? (
                  <Link
                    href={group.addHref}
                    onClick={onNavigate}
                    title="Add agent profile"
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[#52525b] transition hover:bg-[#27272a] hover:text-[#fafafa]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            ) : null}
            <div className="space-y-[1px]">
              {group.items.map((item) => {
                const active = isActive(item.href, item.external);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={onNavigate}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "group flex cursor-pointer items-center rounded-[6px] py-1.5 text-[13px] transition",
                      collapsed ? "justify-center px-2" : "justify-between px-2",
                      active
                        ? "bg-[#27272a] text-[#fafafa]"
                        : "text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa]",
                    )}
                  >
                    <span className={cn("flex items-center", collapsed ? "" : "gap-2.5")}>
                      {item.iconImage ? (
                        <Image
                          src="/logo-dark.png"
                          alt=""
                          width={22}
                          height={22}
                          className={cn(
                            "h-[22px] w-[22px] shrink-0 object-contain",
                            active ? "opacity-100" : "opacity-75 group-hover:opacity-95",
                          )}
                        />
                      ) : item.icon ? (
                        <item.icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            active ? "text-[#fafafa]" : "text-[#71717a] group-hover:text-[#a1a1aa]",
                          )}
                        />
                      ) : null}
                      {!collapsed ? item.name : null}
                    </span>
                    {!collapsed && item.badge ? (
                      <span className="rounded-full bg-[#3f3f46] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-[#fafafa]">
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

      {/* Collapse toggle + profile */}
      <div className="border-t border-[#27272a] p-2">
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "mb-1 flex w-full cursor-pointer items-center rounded-[6px] py-1.5 text-[#71717a] transition hover:bg-[#141414] hover:text-[#fafafa]",
              collapsed ? "justify-center px-2" : "gap-2 px-2 text-[12px]",
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        ) : null}

        <div
          className={cn(
            "flex items-center rounded-[8px] px-2 py-2",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <div className={cn("flex min-w-0 items-center", collapsed ? "" : "gap-2.5")}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#27272a] text-[11px] font-semibold uppercase text-[#fafafa]">
              {initials}
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[#fafafa]">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="truncate text-[11px] text-[#52525b]">Admin</p>
              </div>
            ) : null}
          </div>
          {!collapsed ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[#71717a] transition hover:bg-[#141414] hover:text-[#fafafa] disabled:opacity-50"
            >
              {signingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
