"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type ProfileTheme = "dark" | "light";

const ProfileThemeContext = createContext<{
  theme: ProfileTheme;
  toggle: () => void;
  isLight: boolean;
}>({ theme: "dark", toggle: () => {}, isLight: false });

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

  return (
    <ProfileThemeContext.Provider value={{ theme, toggle, isLight: theme === "light" }}>
      <div
        data-theme={theme}
        className={cn(
          "min-h-screen transition-colors duration-300",
          theme === "light" ? "bg-[#fafafa] text-[#18181b]" : "bg-black text-[#fafafa]",
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
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition",
        isLight
          ? "border-[#d4d4d8] bg-white text-[#52525b] hover:bg-[#f4f4f5]"
          : "border-[#27272a] bg-[#141414] text-[#a1a1aa] hover:text-[#fafafa]",
        className,
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {isLight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      {isLight ? "Dark" : "Light"}
    </button>
  );
}

export function profileThemeClass(isLight: boolean, dark: string, light: string) {
  return isLight ? light : dark;
}
