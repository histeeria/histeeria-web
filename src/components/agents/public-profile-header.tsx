"use client";

import Image from "next/image";
import Link from "next/link";

import { ProfileThemeToggle, profileThemeClass, useProfileTheme } from "@/components/agents/public-profile-theme";
import { cn } from "@/lib/utils";

export function PublicProfileHeader() {
  const { isLight } = useProfileTheme();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur-md",
        profileThemeClass(isLight, "border-[#27272a]/80 bg-black/80", "border-[#e4e4e7] bg-white/90"),
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="https://histeeria.com" className="flex items-center gap-2.5">
          <Image src="/logo-dark1.png" alt="Histeeria" width={36} height={36} className="h-9 w-auto object-contain" />
          <span className={cn("hidden text-[13px] font-medium sm:inline", profileThemeClass(isLight, "text-[#71717a]", "text-[#52525b]"))}>
            Histeeria
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ProfileThemeToggle />
          <Link
            href="https://histeeria.com"
            className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] transition",
              profileThemeClass(isLight, "border-[#27272a] text-[#a1a1aa] hover:bg-[#141414] hover:text-[#fafafa]", "border-[#d4d4d8] text-[#52525b] hover:bg-[#f4f4f5]"),
            )}
          >
            Build your agent
          </Link>
        </div>
      </div>
    </header>
  );
}
