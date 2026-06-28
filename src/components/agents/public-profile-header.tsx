"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { ProfileThemeToggle } from "@/components/agents/public-profile-theme";

interface PublicProfileHeaderProps {
  agentName: string;
  profileSlug: string;
  workspaceSlug: string;
}

export function PublicProfileHeader({
  agentName,
  profileSlug,
  workspaceSlug,
}: PublicProfileHeaderProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${workspaceSlug}/${profileSlug}`
    : `https://app.histeeria.com/p/${workspaceSlug}/${profileSlug}`;

  const whatsappText = `Check out ${agentName}'s AI agent judgment profile on Histeeria: ${shareUrl}`;
  const tweetText = `Check out ${agentName}'s AI agent judgment profile on Histeeria:`;

  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <header className="sticky top-4 z-30 px-4">
        <div className="mx-auto flex h-[58px] max-w-[1320px] items-center justify-between rounded-full border border-[var(--pp-border)] bg-[var(--pp-bg)]/72 px-5 shadow-[0_18px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:px-6">
          <div className="flex items-center gap-4">
            <Link href="https://histeeria.com" className="flex items-center gap-3">
              <Image src="/logo-dark1.png" alt="Histeeria" width={30} height={30} className="h-7 w-auto object-contain" />
              <span className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pp-fg)] sm:inline">
                Histeeria
              </span>
            </Link>
            <ProfileThemeToggle />
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsShareOpen(true)}
              className="cursor-pointer rounded-full border border-[var(--pp-border)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--pp-fg)] transition-all duration-200 hover:border-[var(--pp-fg)] hover:bg-[var(--pp-fg)] hover:text-[var(--pp-bg)]"
            >
              Share
            </button>
            <Link
              href="https://histeeria.com"
              className="hidden cursor-pointer rounded-full bg-[var(--pp-fg)] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pp-bg)] transition-all duration-200 hover:opacity-85 sm:inline-block"
            >
              Create profile
            </Link>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-[28px] border border-[var(--pp-border)] bg-[var(--pp-surface)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--pp-muted)]">
                Share Agent Profile
              </span>
              <button
                onClick={() => setIsShareOpen(false)}
                className="text-[var(--pp-muted)] hover:text-[var(--pp-fg)] transition-colors p-1"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-[14px] text-[var(--pp-muted)] leading-relaxed">
              Share the judgment and operational profile for <strong className="font-medium text-[var(--pp-fg)]">{agentName}</strong>.
            </p>

            <div className="mt-5 flex overflow-hidden rounded-2xl border border-[var(--pp-border)] bg-[var(--pp-surface-alt)]">
              <input
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 bg-transparent px-3 py-2.5 font-mono text-[12px] text-[var(--pp-fg)] outline-none border-none min-w-0"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 border-l border-[var(--pp-border)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-[var(--pp-fg)] transition-colors hover:bg-[var(--pp-fg)] hover:text-[var(--pp-bg)]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {/* X / Twitter */}
              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center rounded-2xl border border-[var(--pp-border)] p-4 text-[var(--pp-muted)] transition-all duration-200 hover:border-[var(--pp-fg)] hover:bg-[var(--pp-surface-alt)] hover:text-[var(--pp-fg)]"
              >
                <span className="font-bold text-[18px]">𝕏</span>
                <span className="font-mono text-[9px] uppercase tracking-wider mt-2.5 text-center">
                  Twitter
                </span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center rounded-2xl border border-[var(--pp-border)] p-4 text-[var(--pp-muted)] transition-all duration-200 hover:border-[var(--pp-fg)] hover:bg-[var(--pp-surface-alt)] hover:text-[var(--pp-fg)]"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="font-mono text-[9px] uppercase tracking-wider mt-2.5 text-center">
                  LinkedIn
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center rounded-2xl border border-[var(--pp-border)] p-4 text-[var(--pp-muted)] transition-all duration-200 hover:border-[var(--pp-fg)] hover:bg-[var(--pp-surface-alt)] hover:text-[var(--pp-fg)]"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.739-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.864.001-2.641-1.023-5.122-2.887-6.991C16.576 1.882 14.09 .856 11.45.855c-5.442 0-9.867 4.42-9.87 9.874-.001 1.73.461 3.42 1.337 4.909L1.87 19.9l4.777-1.746z" />
                </svg>
                <span className="font-mono text-[9px] uppercase tracking-wider mt-2.5 text-center">
                  WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
