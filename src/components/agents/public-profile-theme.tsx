"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type ProfileTheme = "dark" | "light";

const ProfileThemeContext = createContext<{
  theme: ProfileTheme;
  toggle: () => void;
  isLight: boolean;
}>({ theme: "light", toggle: () => {}, isLight: true });

export function useProfileTheme() {
  return useContext(ProfileThemeContext);
}

export function PublicProfileThemeProvider({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  const storageKey = `histeeria.profile.theme.${slug}`;
  const [theme, setTheme] = useState<ProfileTheme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ProfileTheme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, [storageKey]);

  function toggle() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, next);
      return next;
    });
  }

  const isLight = theme === "light";

  return (
    <ProfileThemeContext.Provider value={{ theme, toggle, isLight }}>
      <div
        data-theme={theme}
        style={
          {
            "--pp-bg": isLight ? "#fafafa" : "#09090b",
            "--pp-fg": isLight ? "#18181b" : "#fafafa",
            "--pp-muted": isLight ? "#71717a" : "#a1a1aa",
            "--pp-border": isLight ? "#e4e4e7" : "#27272a",
            "--pp-surface": isLight ? "#ffffff" : "#0a0a0a",
            "--pp-surface-alt": isLight ? "#f4f4f5" : "#141414",
          } as React.CSSProperties
        }
        className={cn(
          "min-h-screen font-sans transition-colors duration-300",
          isLight ? "bg-[#fafafa] text-[#18181b]" : "bg-[#09090b] text-[#fafafa]",
        )}
      >
        {children}
      </div>
    </ProfileThemeContext.Provider>
  );
}

export function ProfileThemeToggle({ className }: { className?: string }) {
  const { theme, toggle, isLight } = useProfileTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition",
        isLight
          ? "border-[#e4e4e7] bg-white text-[#52525b] hover:bg-[#f4f4f5]"
          : "border-[#27272a] bg-[#141414] text-[#a1a1aa] hover:text-[#fafafa]",
        className,
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {isLight ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
      {isLight ? "Dark" : "Light"}
    </button>
  );
}

export function profileThemeClass(isLight: boolean, dark: string, light: string) {
  return isLight ? light : dark;
}
