"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

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

type AuthState = "signin" | "signup" | "otp" | "register" | "forgot" | "reset";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/onboarding";
  const initialError = searchParams.get("error");

  const [state, setState] = useState<AuthState>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [otp, setOtp] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ? "Authentication failed." : null);
  const [info, setInfo] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  async function handleSocialSignIn(provider: "google" | "github") {
    setLoadingProvider(provider);
    setError(null);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setError(`Failed to sign in with ${provider}.`);
      setLoadingProvider(null);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Successful login, redirect
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
      setLoading(false);
    }
  }

  async function handleSendOTP(e: React.FormEvent, isReset = false) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const endpoint = isReset ? "/v1/auth/forgot-password" : "/v1/auth/otp/send";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { detail?: string };
        throw new Error(data.detail || "Failed to send code.");
      }

      setInfo(`A 6-digit code has been sent to ${email}.`);
      setState(isReset ? "reset" : "otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`${API_URL}/v1/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { detail?: string };
        throw new Error(data.detail || "Invalid code.");
      }

      const data = (await res.json()) as { exists: boolean };
      if (data.exists) {
        // If user already exists, let them sign in with password
        setInfo("Verification successful. Please sign in.");
        setState("signin");
      } else {
        // If user is new, complete profile registration
        setState("register");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Execute registration via next-auth credentials authorization
      const res = await signIn("credentials", {
        email,
        password,
        code: otp,
        fullName,
        avatarUrl: avatarUrl || undefined,
        isRegister: "true",
        callbackUrl,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { detail?: string };
        throw new Error(data.detail || "Password reset failed.");
      }

      // Password reset succeeded, sign them in automatically
      const loginRes = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (loginRes?.error) {
        setInfo("Password reset successful. Please sign in.");
        setState("signin");
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Centered Histeeria Logo */}
      <div className="mb-6 flex items-center justify-center">
        <Image
          src="/logo-dark.png"
          alt="Histeeria Logo"
          width={40}
          height={40}
          priority
          className="h-10 w-auto object-contain"
        />
      </div>

      <AnimatePresence mode="wait">
        {state === "signin" && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-5"
          >
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-[#fafafa]">
                Sign in to Histeeria
              </h1>
              <p className="text-[12px] text-[#71717a]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setState("signup");
                    setError(null);
                    setInfo(null);
                  }}
                  className="font-medium text-[#10b981] hover:underline"
                >
                  Get started &rarr;
                </button>
              </p>
            </div>

            {error && (
              <div className="rounded-[10px] border border-red-900/40 bg-red-950/20 px-3 py-2 text-center text-[12px] text-red-400">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-[10px] border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-center text-[12px] text-emerald-400">
                {info}
              </div>
            )}

            <div className="grid gap-2">
              <Button
                type="button"
                variant="secondary"
                className="group relative w-full justify-center border border-[#27272a] bg-[#0a0a0a] text-[#ededed] hover:bg-[#141414] hover:text-[#fafafa] transition-all rounded-[10px] py-2"
                disabled={Boolean(loadingProvider)}
                onClick={() => void handleSocialSignIn("google")}
              >
                <span className="flex items-center gap-2">
                  {loadingProvider === "google" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="text-[13px] font-medium">
                    {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="group relative w-full justify-center border border-[#27272a] bg-[#0a0a0a] text-[#ededed] hover:bg-[#141414] hover:text-[#fafafa] transition-all rounded-[10px] py-2"
                disabled={Boolean(loadingProvider)}
                onClick={() => void handleSocialSignIn("github")}
              >
                <span className="flex items-center gap-2">
                  {loadingProvider === "github" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <GitHubIcon />
                  )}
                  <span className="text-[13px] font-medium">
                    {loadingProvider === "github" ? "Connecting..." : "Continue with GitHub"}
                  </span>
                </span>
              </Button>
            </div>

            <div className="relative flex py-2 items-center justify-center">
              <div className="flex-grow border-t border-[#27272a]" />
              <span className="flex-shrink mx-4 text-[11px] font-mono uppercase tracking-widest text-[#52525b]">or</span>
              <div className="flex-grow border-t border-[#27272a]" />
            </div>

            <form onSubmit={(e) => void handleEmailSignIn(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Enter your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  disabled={loading}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-[#a1a1aa]">Enter your password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setState("forgot");
                      setError(null);
                      setInfo(null);
                    }}
                    className="text-[11px] font-medium text-[#10b981] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 pr-10 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center rounded-[10px] bg-[#10b981] hover:bg-[#059669] text-[#fafafa] font-medium text-[13px] py-2 transition-all mt-2"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Continue"}
              </Button>
            </form>
          </motion.div>
        )}

        {state === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-5"
          >
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-[#fafafa]">
                Get Started with Histeeria
              </h1>
              <p className="text-[12px] text-[#71717a]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setState("signin");
                    setError(null);
                    setInfo(null);
                  }}
                  className="font-medium text-[#10b981] hover:underline"
                >
                  Sign in &rarr;
                </button>
              </p>
            </div>

            {error && (
              <div className="rounded-[10px] border border-red-900/40 bg-red-950/20 px-3 py-2 text-center text-[12px] text-red-400">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Button
                type="button"
                variant="secondary"
                className="group relative w-full justify-center border border-[#27272a] bg-[#0a0a0a] text-[#ededed] hover:bg-[#141414] hover:text-[#fafafa] transition-all rounded-[10px] py-2"
                disabled={Boolean(loadingProvider)}
                onClick={() => void handleSocialSignIn("google")}
              >
                <span className="flex items-center gap-2">
                  {loadingProvider === "google" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="text-[13px] font-medium">
                    Continue with Google
                  </span>
                </span>
              </Button>
            </div>

            <div className="relative flex py-2 items-center justify-center">
              <div className="flex-grow border-t border-[#27272a]" />
              <span className="flex-shrink mx-4 text-[11px] font-mono uppercase tracking-widest text-[#52525b]">or</span>
              <div className="flex-grow border-t border-[#27272a]" />
            </div>

            <form onSubmit={(e) => void handleSendOTP(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Enter your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  disabled={loading}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center rounded-[10px] bg-[#10b981] hover:bg-[#059669] text-[#fafafa] font-medium text-[13px] py-2 transition-all mt-2"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Continue"}
              </Button>
            </form>
          </motion.div>
        )}

        {state === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-5"
          >
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-[#fafafa]">
                Verify your email
              </h1>
              <p className="text-[12px] text-[#71717a]">
                We sent a 6-digit code to <span className="text-[#ededed] font-medium">{email}</span>.
              </p>
            </div>

            {error && (
              <div className="rounded-[10px] border border-red-900/40 bg-red-950/20 px-3 py-2 text-center text-[12px] text-red-400">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-[10px] border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-center text-[12px] text-emerald-400">
                {info}
              </div>
            )}

            <form onSubmit={(e) => void handleVerifyOTP(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Enter 6-digit code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  disabled={loading}
                  className="w-full text-center tracking-[0.25em] font-mono text-lg rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2.5 text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full justify-center rounded-[10px] bg-[#10b981] hover:bg-[#059669] text-[#fafafa] font-medium text-[13px] py-2 transition-all mt-2"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify Code"}
              </Button>
            </form>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setState("signup");
                  setError(null);
                  setInfo(null);
                }}
                className="text-[11px] font-medium text-[#71717a] hover:text-[#fafafa]"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={(e) => void handleSendOTP(e)}
                className="text-[11px] font-medium text-[#10b981] hover:underline"
              >
                Resend code
              </button>
            </div>
          </motion.div>
        )}

        {state === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-5"
          >
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-[#fafafa]">
                Complete your profile
              </h1>
              <p className="text-[12px] text-[#71717a]">
                Set your name and password to get started.
              </p>
            </div>

            {error && (
              <div className="rounded-[10px] border border-red-900/40 bg-red-950/20 px-3 py-2 text-center text-[12px] text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={(e) => void handleCompleteRegistration(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Enter your full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Profile Photo URL (optional)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  disabled={loading}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 pr-10 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center rounded-[10px] bg-[#10b981] hover:bg-[#059669] text-[#fafafa] font-medium text-[13px] py-2 transition-all mt-2"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </motion.div>
        )}

        {state === "forgot" && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-5"
          >
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-[#fafafa]">
                Reset your password
              </h1>
              <p className="text-[12px] text-[#71717a]">
                Enter your email address and we&apos;ll send you a 6-digit code.
              </p>
            </div>

            {error && (
              <div className="rounded-[10px] border border-red-900/40 bg-red-950/20 px-3 py-2 text-center text-[12px] text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={(e) => void handleSendOTP(e, true)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Enter your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  disabled={loading}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center rounded-[10px] bg-[#10b981] hover:bg-[#059669] text-[#fafafa] font-medium text-[13px] py-2 transition-all mt-2"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send Reset Code"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setState("signin");
                  setError(null);
                  setInfo(null);
                }}
                className="text-[11px] font-medium text-[#71717a] hover:text-[#fafafa]"
              >
                &larr; Back to sign in
              </button>
            </div>
          </motion.div>
        )}

        {state === "reset" && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-5"
          >
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-[#fafafa]">
                Reset your password
              </h1>
              <p className="text-[12px] text-[#71717a]">
                Enter the verification code and set your new password.
              </p>
            </div>

            {error && (
              <div className="rounded-[10px] border border-red-900/40 bg-red-950/20 px-3 py-2 text-center text-[12px] text-red-400">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-[10px] border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-center text-[12px] text-emerald-400">
                {info}
              </div>
            )}

            <form onSubmit={(e) => void handleResetPassword(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Enter 6-digit code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  disabled={loading}
                  className="w-full text-center tracking-[0.25em] font-mono text-lg rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 pr-10 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[#a1a1aa]">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full rounded-[10px] border border-[#27272a] bg-[#0a0a0a] px-3.5 py-2 text-sm text-[#ededed] placeholder:text-[#52525b] outline-none transition focus:border-[#3f3f46] focus:bg-[#141414]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full justify-center rounded-[10px] bg-[#10b981] hover:bg-[#059669] text-[#fafafa] font-medium text-[13px] py-2 transition-all mt-2"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Reset Password"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setState("signin");
                  setError(null);
                  setInfo(null);
                }}
                className="text-[11px] font-medium text-[#71717a] hover:text-[#fafafa]"
              >
                &larr; Back to sign in
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full pt-6">
        <p className="text-center text-[11px] leading-relaxed text-[#52525b]">
          By signing in, you agree to our{" "}
          <a
            href="https://histeeria.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#71717a] hover:text-[#fafafa] underline underline-offset-2 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://histeeria.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#71717a] hover:text-[#fafafa] underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
