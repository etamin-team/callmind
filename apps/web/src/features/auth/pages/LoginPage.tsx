import { useEffect } from 'react'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  useEffect(() => {
    document.title = 'Sign In | Callmind'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] text-white px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/[0.03] rounded-full blur-[96px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo - more refined */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-black"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
              </svg>
            </div>
            <span className="text-lg font-medium tracking-tight text-white/90">
              Callmind
            </span>
          </div>
        </div>

        {/* Card - elevated with better depth */}
        <div className="bg-[#141414]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Header - better typography hierarchy */}
          <div className="text-center mb-10">
            <h1 className="text-[28px] font-semibold tracking-tight mb-3 text-white">
              Welcome back
            </h1>
            <p className="text-[#666666] text-[15px] leading-relaxed">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer - cleaner divider */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[#555555] text-sm">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-white/90 hover:text-white font-medium transition-colors"
              >
                Create one
              </a>
            </p>
          </div>
        </div>

        {/* Subtle footer */}
        <p className="text-center mt-10 text-[#444444] text-xs tracking-wide">
          Secure authentication powered by Clerk
        </p>
      </div>
    </div>
  )
}
