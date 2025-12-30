import { useEffect } from 'react'
import { RegisterForm } from '../components/RegisterForm'
import { Sparkles } from 'lucide-react'

export function RegisterPage() {
  useEffect(() => {
    document.title = 'Sign Up | Callmind'
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4 font-sans selection:bg-white selection:text-black">
      {/* Upper Title */}
      <div className="text-center space-y-2 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-3xl font-semibold tracking-tight">Create your workspace</h1>
        <p className="text-[#a1a1a1] text-sm">Join the next generation of AI-driven development</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-[440px] bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="size-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Sparkles className="size-7 text-black" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-medium tracking-tight">Welcome to Callmind</h2>
          <p className="text-[#a1a1a1] text-xs mt-1">Please enter your details to get started</p>
        </div>

        <RegisterForm />

        <div className="mt-8 text-center pt-6 border-t border-[#222222]">
          <p className="text-[#a1a1a1] text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-white hover:underline transition-all">Sign in</a>
          </p>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="mt-12 text-center animate-in fade-in duration-1000 delay-500">
        <p className="text-[#666666] text-sm tracking-widest font-light">Join 10,000+ engineers building with Callmind</p>
      </div>
    </div>
  )
}
