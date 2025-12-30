import { useEffect } from 'react'
import { LoginForm } from '../components/LoginForm'
import { Boxes } from 'lucide-react'

export function LoginPage() {
  useEffect(() => {
    document.title = 'Login | Callmind'
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4 font-sans selection:bg-white selection:text-black">
      {/* Upper Title */}
      <div className="text-center space-y-2 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-[#a1a1a1] text-sm">Sign in to continue to your workspace</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-[440px] bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="size-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Boxes className="size-7 text-black" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-medium tracking-tight">Sign in to Callmind</h2>
          <p className="text-[#a1a1a1] text-xs mt-1">Welcome back! Please sign in to continue</p>
        </div>

        <LoginForm />

        <div className="mt-8 text-center pt-6 border-t border-[#222222]">
          <p className="text-[#a1a1a1] text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-white hover:underline transition-all">Sign up</a>
          </p>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="mt-12 text-center animate-in fade-in duration-1000 delay-500">
        <p className="text-[#666666] text-sm tracking-widest font-light">10x your coding workflow with Callmind</p>
      </div>
    </div>
  )
}
