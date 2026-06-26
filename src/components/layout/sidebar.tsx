"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Search } from "lucide-react";

import { buildNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  onNavigate?: () => void;
}

export function Sidebar({ workspaceName, workspaceSlug, onNavigate }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const navigation = buildNavigation(workspaceSlug ?? "dashboard");

  function isActive(href: string, external?: boolean) {
    if (external) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const initials = session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "H";

  return (
    <div className="flex h-full flex-col bg-black text-[#fafafa]">
      {/* Workspace switcher */}
      <div className="flex items-center justify-between border-b border-[#27272a] px-3 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#27272a] bg-[#141414]">
            <Image
              src="/logo-dark.png"
              alt="Histeeria"
              width={18}
              height={18}
              className="h-4 w-auto object-contain opacity-90"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-[#52525b]">Workspace</p>
            <p className="truncate text-[13px] font-medium text-[#fafafa]">
              {workspaceName ?? "Histeeria Labs"}
            </p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#52525b]" />
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-[8px] border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[#71717a] transition hover:border-[#3f3f46] hover:text-[#a1a1aa]"
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

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 pb-4">
        {navigation.map((group) => (
          <div key={group.section} className="space-y-0.5">
            <p className="px-2 pb-1 text-[11px] font-medium text-[#52525b]">{group.section}</p>
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
                    className={cn(
                      "group flex items-center justify-between rounded-[6px] px-2 py-1.5 text-[13px] transition",
                      active
                        ? "bg-[#27272a] text-[#fafafa]"
                        : "text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa]",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      {item.iconImage ? (
                        <Image
                          src="/logo-dark.png"
                          alt=""
                          width={16}
                          height={16}
                          className={cn(
                            "h-4 w-4 shrink-0 object-contain",
                            active ? "opacity-100" : "opacity-70 group-hover:opacity-90",
                          )}
                        />
                      ) : item.icon ? (
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-[#fafafa]" : "text-[#71717a] group-hover:text-[#a1a1aa]",
                          )}
                        />
                      ) : null}
                      {item.name}
                    </span>
                    {item.badge ? (
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

      {/* Profile */}
      <div className="border-t border-[#27272a] p-2">
        <div className="flex items-center justify-between rounded-[8px] px-2 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#27272a] text-[11px] font-semibold uppercase text-[#fafafa]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-[#fafafa]">
                {session?.user?.name ?? "User"}
              </p>
              <p className="truncate text-[11px] text-[#52525b]">Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#71717a] transition hover:bg-[#141414] hover:text-[#fafafa]"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
