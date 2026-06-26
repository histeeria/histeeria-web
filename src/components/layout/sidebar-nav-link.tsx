"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarNavLinkProps {
  href: string;
  external?: boolean;
  collapsed?: boolean;
  title?: string;
  onNavigate?: () => void;
  className?: string;
  children: React.ReactNode;
}

function NavLinkPending({ collapsed, children }: { collapsed?: boolean; children: React.ReactNode }) {
  const { pending } = useLinkStatus();

  if (!pending) return children;

  if (collapsed) {
    return <Loader2 className="h-[18px] w-[18px] animate-spin text-[#71717a]" />;
  }

  return (
    <span className="flex items-center gap-2.5">
      <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin text-[#71717a]" />
      <span className="text-[#71717a]">Loading…</span>
    </span>
  );
}

export function SidebarNavLink({
  href,
  external,
  collapsed,
  title,
  onNavigate,
  className,
  children,
}: SidebarNavLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        onClick={() => onNavigate?.()}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} title={title} onClick={() => onNavigate?.()} className={className}>
      <NavLinkPending collapsed={collapsed}>{children}</NavLinkPending>
    </Link>
  );
}

interface SidebarActionLinkProps {
  href: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

function ActionLinkPending({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  if (pending) return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  return children;
}

export function SidebarActionLink({ href, onClick, className, children }: SidebarActionLinkProps) {
  return (
    <Link href={href} onClick={onClick} className={className}>
      <ActionLinkPending>{children}</ActionLinkPending>
    </Link>
  );
}

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md";
}

export function UserAvatar({ image, name, email, size = "md" }: UserAvatarProps) {
  const initials = (name?.[0] ?? email?.[0] ?? "H").toUpperCase();
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-[12px]";

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User"}
        width={size === "sm" ? 32 : 36}
        height={size === "sm" ? 32 : 36}
        className={cn("shrink-0 rounded-md object-cover", dim)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-[#27272a] font-semibold uppercase text-[#fafafa]",
        dim,
      )}
    >
      {initials}
    </div>
  );
}
