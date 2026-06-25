"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppShell({
  children,
  workspaceName,
}: {
  children: React.ReactNode;
  workspaceName?: string | null;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface-1/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold tracking-[0.25em] text-gold">
              HISTEERIA
            </Link>
            {workspaceName ? (
              <span className="hidden rounded-md border border-border px-2.5 py-1 text-xs text-muted sm:inline">
                {workspaceName}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted md:inline">{session?.user?.email}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
