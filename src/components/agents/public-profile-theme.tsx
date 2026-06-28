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

export function ProfileThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ProfileTheme;
}) {
  const isLight = theme === "light";
  return (
    <ProfileThemeContext.Provider value={{ theme, toggle: () => {}, isLight }}>
      {children}
    </ProfileThemeContext.Provider>
  );
}

export function PublicProfileThemeProvider({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  const storageKey = `histeeria.profile.theme.${slug}`;
  const [theme, setTheme] = useState<ProfileTheme>("dark");

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
            "--pp-bg": isLight ? "#fafafa" : "#020202",
            "--pp-fg": isLight ? "#18181b" : "#fafafa",
            "--pp-muted": isLight ? "#3f3f46" : "#a8a8b3",
            "--pp-border": isLight ? "#e4e4e7" : "rgba(255,255,255,0.1)",
            "--pp-surface": isLight ? "#ffffff" : "rgba(10,10,10,0.76)",
            "--pp-surface-alt": isLight ? "#f4f4f5" : "rgba(255,255,255,0.045)",
          } as React.CSSProperties
        }
        className={cn(
          "min-h-screen font-sans transition-colors duration-300",
          isLight ? "bg-[#fafafa] text-[#18181b]" : "bg-[#020202] text-[#fafafa]",
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
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition",
        isLight
          ? "border-[#e4e4e7] bg-white text-[#52525b] hover:bg-[#f4f4f5]"
          : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white",
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
