"use client";

import Image from "next/image";
import Link from "next/link";

import { ProfileThemeToggle } from "@/components/agents/public-profile-theme";

export function PublicProfileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--pp-border)] bg-[var(--pp-bg)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          <Link href="https://histeeria.com" className="flex items-center gap-3">
            <Image src="/logo-dark1.png" alt="Histeeria" width={32} height={32} className="h-8 w-auto object-contain" />
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pp-muted)] sm:inline">
              Histeeria
            </span>
          </Link>
          <ProfileThemeToggle />
        </div>
        <Link
          href="https://histeeria.com"
          className="border border-[var(--pp-border)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--pp-fg)] transition hover:bg-[var(--pp-surface-alt)]"
        >
          Create your agent profile
        </Link>
      </div>
    </header>
  );
}
