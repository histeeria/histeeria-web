"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Settings,
  UserPlus,
} from "lucide-react";

import { SidebarActionLink, SidebarNavLink, UserAvatar } from "@/components/layout/sidebar-nav-link";
import { buildNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  userAvatar?: string | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
  workspaceName,
  workspaceSlug,
  userAvatar,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const { data: session, update: updateSession } = useSession();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = buildNavigation(workspaceSlug ?? "dashboard", unreadCount);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (workspaceRef.current && !workspaceRef.current.contains(target)) {
        setWorkspaceOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!session?.user?.email || session.user.image) return;

    let cancelled = false;

    async function hydrateAvatar() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok || cancelled) return;

        const data = (await res.json()) as { user?: { avatar_url?: string | null } };
        const avatarUrl = data.user?.avatar_url;
        if (avatarUrl) {
          await updateSession({ image: avatarUrl });
        }
      } catch {
        // Non-blocking: sidebar falls back to initials.
      }
    }

    void hydrateAvatar();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.email, session?.user?.image, updateSession]);

  useEffect(() => {
    async function loadUnread() {
      try {
        const res = await fetch("/api/inbox/unread-count");
        if (res.ok) {
          const data = (await res.json()) as { unread_count: number };
          setUnreadCount(data.unread_count);
        }
      } catch {
        setUnreadCount(0);
      }
    }
    loadUnread();
    function onInboxUpdated(e: Event) {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number") setUnreadCount(detail);
    }
    window.addEventListener("inbox:updated", onInboxUpdated);
    const timer = window.setInterval(loadUnread, 30000);
    return () => {
      window.removeEventListener("inbox:updated", onInboxUpdated);
      window.clearInterval(timer);
    };
  }, [pathname]);

  function navPath(href: string) {
    return href.split("?")[0].split("#")[0];
  }

  function isActive(href: string, external?: boolean) {
    if (external) return false;
    const path = navPath(href);
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const settingsHref = workspaceSlug ? `/${workspaceSlug}/settings` : "/settings";

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
          "relative shrink-0 border-b border-[#27272a]",
          collapsed ? "px-2 py-3" : "px-3 py-3",
        )}
      >
        <button
          type="button"
          onClick={() => !collapsed && setWorkspaceOpen((v) => !v)}
          title={workspaceName ?? "Workspace"}
          className={cn(
            "flex w-full cursor-pointer items-center rounded-[8px] transition hover:bg-[#141414]",
            collapsed ? "justify-center p-1.5" : "justify-between gap-2 p-1",
          )}
        >
          <div className={cn("flex min-w-0 items-center", collapsed ? "" : "gap-2.5")}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
              <Image
                src="/logo-dark.png"
                alt="Histeeria"
                width={42}
                height={42}
                className="h-9 w-auto object-contain opacity-95"
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
            <SidebarActionLink
              href={settingsHref}
              onClick={() => setWorkspaceOpen(false)}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] transition hover:bg-[#141414] hover:text-[#fafafa]"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </SidebarActionLink>
            <SidebarActionLink
              href="/onboarding"
              onClick={() => setWorkspaceOpen(false)}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] transition hover:bg-[#141414] hover:text-[#fafafa]"
            >
              <Plus className="h-3.5 w-3.5" />
              Create workspace
            </SidebarActionLink>
            <SidebarActionLink
              href={workspaceSlug ? `/${workspaceSlug}/team/invite` : "/onboarding"}
              onClick={() => setWorkspaceOpen(false)}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] transition hover:bg-[#141414] hover:text-[#fafafa]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Join workspace
            </SidebarActionLink>
          </div>
        ) : null}
      </div>


      {/* Nav */}
      <nav className="sidebar-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-2 pb-4">
        {navigation.map((group) => (
          <div key={group.section} className="space-y-0.5">
            {!collapsed ? (
              <div className="flex items-center justify-between px-2 pb-1">
                <p className="text-[11px] font-medium text-[#52525b]">{group.section}</p>
                {group.addHref ? (
                  <SidebarActionLink
                    href={group.addHref}
                    onClick={onNavigate}
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[#52525b] transition hover:bg-[#27272a] hover:text-[#fafafa]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </SidebarActionLink>
                ) : null}
              </div>
            ) : null}
            <div className="space-y-[1px]">
              {group.items.map((item) => {
                const active = isActive(item.href, item.external);
                return (
                  <SidebarNavLink
                    key={item.name}
                    href={item.href}
                    external={item.external}
                    collapsed={collapsed}
                    title={collapsed ? item.name : undefined}
                    onNavigate={onNavigate}
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
                          width={26}
                          height={26}
                          className={cn(
                            "h-[26px] w-[26px] shrink-0 object-contain",
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
                  </SidebarNavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse + user menu */}
      <div className="shrink-0 border-t border-[#27272a] p-2">
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

        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((v) => !v)}
            className={cn(
              "flex w-full cursor-pointer items-center rounded-[8px] px-2 py-2 transition hover:bg-[#141414]",
              collapsed ? "justify-center" : "gap-2.5",
            )}
          >
            <UserAvatar
              image={session?.user?.image ?? userAvatar}
              name={session?.user?.name}
              email={session?.user?.email}
              size="sm"
            />
            {!collapsed ? (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[12px] font-medium text-[#fafafa]">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="truncate text-[11px] text-[#52525b]">Free plan</p>
              </div>
            ) : null}
            {!collapsed ? (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-[#52525b] transition",
                  userOpen && "rotate-180",
                )}
              />
            ) : null}
          </button>

          {userOpen ? (
            <div
              className={cn(
                "absolute z-50 overflow-hidden rounded-[10px] border border-[#27272a] bg-[#0a0a0a] py-1 shadow-xl",
                collapsed ? "bottom-full left-0 mb-1 w-56" : "bottom-full left-0 right-0 mb-1",
              )}
            >
              <div className="border-b border-[#27272a] px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar
                    image={session?.user?.image ?? userAvatar}
                    name={session?.user?.name}
                    email={session?.user?.email}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#fafafa]">
                      {session?.user?.name ?? "User"}
                    </p>
                    <p className="truncate text-[11px] text-[#71717a]">{session?.user?.email}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#52525b]">
                      Free plan
                    </p>
                  </div>
                </div>
              </div>
              <a
                href="https://histeeria.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setUserOpen(false)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] transition hover:bg-[#141414] hover:text-[#fafafa]"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Upgrade plan
              </a>
              <a
                href="https://histeeria.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setUserOpen(false)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] transition hover:bg-[#141414] hover:text-[#fafafa]"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Learn more
              </a>
              <div className="my-1 h-px bg-[#27272a]" />
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[#a1a1aa] transition hover:bg-[#141414] hover:text-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
