"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

export function SidebarNavLink({
  href,
  external,
  collapsed,
  title,
  onNavigate,
  className,
  children,
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const showSpinner = !external && pendingHref === href && pathname !== href;

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      title={title}
      onClick={() => {
        if (!external && href !== pathname && !href.startsWith("http")) {
          setPendingHref(href);
        }
        onNavigate?.();
      }}
      className={cn(className, showSpinner && "opacity-80")}
    >
      {showSpinner && !collapsed ? (
        <span className="flex items-center gap-2.5">
          <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin text-[#71717a]" />
          <span className="text-[#71717a]">Loading…</span>
        </span>
      ) : showSpinner && collapsed ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin text-[#71717a]" />
      ) : (
        children
      )}
    </Link>
  );
}

interface SidebarActionLinkProps {
  href: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function SidebarActionLink({ href, onClick, className, children }: SidebarActionLinkProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const showSpinner = pendingHref === href && pathname !== href;

  return (
    <Link
      href={href}
      onClick={() => {
        if (href !== pathname) setPendingHref(href);
        onClick?.();
      }}
      className={className}
    >
      {showSpinner ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
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
