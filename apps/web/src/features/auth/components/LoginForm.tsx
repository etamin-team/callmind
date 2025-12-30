import { SignIn } from '@clerk/clerk-react'

export function LoginForm() {
  return (
    <SignIn 
      routing="path"
      path="/login"
      signUpUrl="/register"
      afterSignInUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'shadow-none border-0 bg-transparent p-0',
          header: 'hidden', // We have custom header in page
          formButtonPrimary: 'w-full bg-[#f4f4f4] hover:bg-white text-black font-semibold py-3 rounded-lg transition-all text-sm h-11 shadow-none border-0',
          formFieldLabel: 'text-[11px] font-semibold text-[#a1a1a1] uppercase tracking-wider mb-1',
          formFieldInput: 'flex h-12 w-full rounded-lg border border-[#222222] bg-[#1a1a1a] px-4 py-2 text-sm text-white placeholder:text-[#444444] focus:border-[#444444] focus:ring-0 transition-all outline-none',
          footer: 'hidden', // Handled customly in page
          socialButtons: 'flex gap-3',
          socialButtonsBlockButton: 'flex-1 border border-[#222222] bg-[#1a1a1a] hover:bg-[#222222] transition-all h-11 rounded-lg',
          socialButtonsBlockButtonText: 'font-medium text-white text-xs',
          socialButtonsIconButton: 'border border-[#222222] bg-[#1a1a1a] hover:bg-[#222222] transition-all h-11 w-full rounded-lg',
          dividerLine: 'bg-[#222222]',
          dividerText: 'text-[#444444] text-[10px] uppercase font-bold tracking-widest bg-[#111111] px-4',
          formFieldAction: 'text-xs text-[#a1a1a1] hover:text-white transition-all',
          identityPreviewText: 'text-white',
          identityPreviewEditButtonIcon: 'text-[#444444]',
        },
        layout: {
          socialButtonsPlacement: 'top',
          socialButtonsVariant: 'blockButton',
        },
      }}
    />
  )
}
