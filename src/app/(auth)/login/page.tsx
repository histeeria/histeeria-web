import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030407] px-4 py-12">
      {/* 1. Linear-style Grid Background */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" 
      />

      {/* 2. Premium Radial Ambient Light Glows */}
      <div className="pointer-events-none absolute inset-0">
        {/* Soft center-top indigo light */}
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,140,255,0.12)_0%,transparent_60%)] blur-[80px]" />
        
        {/* Warm gold ambient accent on the right */}
        <div className="absolute right-[-10%] top-[20%] h-[400px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.04)_0%,transparent_60%)] blur-[60px]" />
        
        {/* Deep blue accent on the left */}
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(80,100,255,0.05)_0%,transparent_60%)] blur-[70px]" />
      </div>

      {/* 3. High-End Abstract "Machine Judgment" Illustrative Mesh SVG */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <svg
          className="h-[800px] w-[1200px] shrink-0 opacity-[0.22]"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#242938" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#7c8cff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#242938" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#242938" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#c9a84c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#242938" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7c8cff" stopOpacity="1" />
              <stop offset="100%" stopColor="#7c8cff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="1" />
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Judgment Nodes Network */}
          {/* Node 1 to 2 */}
          <line x1="250" y1="200" x2="450" y2="150" stroke="url(#lineGrad1)" strokeWidth="1" />
          {/* Node 2 to 3 */}
          <line x1="450" y1="150" x2="750" y2="180" stroke="url(#lineGrad1)" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* Node 3 to 4 */}
          <line x1="750" y1="180" x2="950" y2="250" stroke="url(#lineGrad2)" strokeWidth="1" />
          {/* Node 1 to 5 */}
          <line x1="250" y1="200" x2="350" y2="450" stroke="url(#lineGrad2)" strokeWidth="1" />
          {/* Node 5 to 6 */}
          <line x1="350" y1="450" x2="600" y2="600" stroke="url(#lineGrad1)" strokeWidth="1" />
          {/* Node 6 to 7 */}
          <line x1="600" y1="600" x2="850" y2="520" stroke="url(#lineGrad2)" strokeWidth="1.5" />
          {/* Node 7 to 4 */}
          <line x1="850" y1="520" x2="950" y2="250" stroke="url(#lineGrad1)" strokeWidth="1" />
          {/* Cross connections (Inner Mesh) */}
          <line x1="450" y1="150" x2="350" y2="450" stroke="#1d2230" strokeWidth="1" />
          <line x1="450" y1="150" x2="600" y2="350" stroke="#1d2230" strokeWidth="1" />
          <line x1="750" y1="180" x2="600" y2="350" stroke="#1d2230" strokeWidth="1" />
          <line x1="750" y1="180" x2="850" y2="520" stroke="#1d2230" strokeWidth="1" />
          <line x1="350" y1="450" x2="600" y2="350" stroke="#1d2230" strokeWidth="1" />
          <line x1="850" y1="520" x2="600" y2="350" stroke="#1d2230" strokeWidth="1" />
          <line x1="600" y1="600" x2="600" y2="350" stroke="#1d2230" strokeWidth="1" />

          {/* Concentric evaluation orbits */}
          <circle cx="600" cy="350" r="140" stroke="#1c2130" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="600" cy="350" r="280" stroke="#161b26" strokeWidth="1" />
          <circle cx="600" cy="350" r="420" stroke="#121620" strokeWidth="1" strokeDasharray="10 5" />

          {/* Judgment Node Dots with Glow */}
          {/* Center Hub */}
          <circle cx="600" cy="350" r="12" fill="url(#dotGlow)" />
          <circle cx="600" cy="350" r="4" fill="#7c8cff" />
          
          {/* Node 1 */}
          <circle cx="250" cy="200" r="8" fill="url(#dotGlow)" />
          <circle cx="250" cy="200" r="3" fill="#7c8cff" />
          <text x="210" y="185" fill="#4e5668" fontSize="10" fontFamily="var(--font-geist-mono)" letterSpacing="0.05em">[hst_eval_01]</text>
          
          {/* Node 2 */}
          <circle cx="450" cy="150" r="10" fill="url(#goldGlow)" />
          <circle cx="450" cy="150" r="3.5" fill="#c9a84c" />
          <text x="430" y="130" fill="#4e5668" fontSize="10" fontFamily="var(--font-geist-mono)" letterSpacing="0.05em">score_9.8</text>

          {/* Node 3 */}
          <circle cx="750" cy="180" r="8" fill="url(#dotGlow)" />
          <circle cx="750" cy="180" r="3" fill="#7c8cff" />

          {/* Node 4 */}
          <circle cx="950" cy="250" r="9" fill="url(#dotGlow)" />
          <circle cx="950" cy="250" r="3" fill="#7c8cff" />
          <text x="965" y="254" fill="#4e5668" fontSize="10" fontFamily="var(--font-geist-mono)" letterSpacing="0.05em">[hst_eval_04]</text>

          {/* Node 5 */}
          <circle cx="350" cy="450" r="10" fill="url(#dotGlow)" />
          <circle cx="350" cy="450" r="3" fill="#7c8cff" />

          {/* Node 6 */}
          <circle cx="600" cy="600" r="8" fill="url(#goldGlow)" />
          <circle cx="600" cy="600" r="2.5" fill="#c9a84c" />
          <text x="560" y="625" fill="#4e5668" fontSize="10" fontFamily="var(--font-geist-mono)" letterSpacing="0.05em">dimension_07</text>

          {/* Node 7 */}
          <circle cx="850" cy="520" r="9" fill="url(#dotGlow)" />
          <circle cx="850" cy="520" r="3" fill="#7c8cff" />

          {/* Decorative floating indicators */}
          <path d="M 400 300 L 415 300 L 415 315" stroke="#32394b" strokeWidth="1" />
          <path d="M 800 380 L 785 380 L 785 395" stroke="#32394b" strokeWidth="1" />
          <rect x="580" y="260" width="40" height="15" rx="3" fill="#0b0e14" stroke="#1d2230" strokeWidth="1" />
          <text x="586" y="271" fill="#7c8cff" fontSize="9" fontFamily="var(--font-geist-mono)" fontWeight="600">JUDGE</text>
        </svg>
      </div>

      {/* 4. Elegant Glassmorphism Login Container */}
      <div className="relative z-10 w-full max-w-[420px] animate-fade-up">
        {/* Subtle top-border gradient line overlay */}
        <div className="absolute left-1/2 top-0 h-px w-[90%] -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        
        <div className="rounded-2xl border border-border bg-[#0a0e14]/75 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-[12px]">
          <Suspense fallback={
            <div className="flex h-[320px] flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-surface-2" />
              <div className="h-4 w-32 animate-pulse rounded-md bg-surface-2" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-2" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-2" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
