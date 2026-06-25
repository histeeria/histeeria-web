"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.107-.775.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/onboarding";
  const error = searchParams.get("error");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  async function handleSignIn(provider: "google" | "github") {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl });
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Centered Histeeria Logo */}
      <div className="mb-2">
        <Image
          src="/logo-dark.png"
          alt="Histeeria Logo"
          width={64}
          height={64}
          priority
          className="h-16 w-auto object-contain"
        />
      </div>

      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Sign in to Histeeria
        </h1>
        <p className="text-[13px] leading-relaxed text-muted">
          Continuous, automated evaluation for AI agents.
        </p>
      </div>

      {error ? (
        <div className="w-full rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-center text-xs text-danger">
          Sign in failed. Please try again.
        </div>
      ) : null}

      <div className="w-full space-y-2.5">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="group relative w-full justify-center border-border bg-[#0d121c] text-foreground hover:bg-[#131b26] transition-all"
          disabled={!!loadingProvider}
          onClick={() => handleSignIn("google")}
        >
          <span className="flex items-center gap-2.5">
            {loadingProvider === "google" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
            ) : (
              <GoogleIcon />
            )}
            <span className="font-medium text-[14px]">
              {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
            </span>
          </span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="group relative w-full justify-center border-border bg-[#0d121c] text-foreground hover:bg-[#131b26] transition-all"
          disabled={!!loadingProvider}
          onClick={() => handleSignIn("github")}
        >
          <span className="flex items-center gap-2.5">
            {loadingProvider === "github" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
            ) : (
              <GitHubIcon />
            )}
            <span className="font-medium text-[14px]">
              {loadingProvider === "github" ? "Connecting..." : "Continue with GitHub"}
            </span>
          </span>
        </Button>
      </div>

      <div className="w-full pt-2">
        <p className="text-center text-[11px] leading-relaxed text-muted/70">
          By signing in, you agree to our{" "}
          <a
            href="https://histeeria.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-muted hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://histeeria.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-muted hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
