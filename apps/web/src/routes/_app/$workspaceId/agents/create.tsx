import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BookText, Bot, Briefcase, ChevronLeft, ChevronRight, Phone, Zap, Sparkles, BrainCircuit, Globe, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAgentStore } from '@/features/agents/store'
import { 
  AgentBasicsStep,
  BusinessContextStep,
  CallFlowStep,
  KnowledgeStep,
  ReviewStep,
} from '@/features/agents/components'

const steps = [
  { 
    title: 'Identity', 
    icon: Bot, 
    description: 'Define your agent\'s core persona',
    details: 'Namem, Voice, Personality'
  },
  { 
    title: 'Context', 
    icon: Briefcase, 
    description: 'Set the business background',
    details: 'Company Info, Goals' 
  },
  { 
    title: 'Knowledge', 
    icon: BookText, 
    description: 'Equip with intelligence',
    details: 'Documents, FAQs' 
  },
  { 
    title: 'Behavior', 
    icon: Phone, 
    description: 'Design interaction flow',
    details: 'Call Structure, Rules' 
  },
  { 
    title: 'Launch', 
    icon: Zap, 
    description: 'Review and activate',
    details: 'Final Review' 
  },
]

type AgentConfig = {
  name: string
  type: string
  language: string
  voice: string
  businessName: string
  businessDescription: string
  targetCallers: string
  knowledgeText: string
  primaryGoal: string
  collectFields: Array<string>
}

// Visual component for the left sidebar based on current step
const StepVisual = ({ step }: { step: number }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-12 text-center z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          {step === 0 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Bot className="w-32 h-32 text-zinc-900 dark:text-white relative z-10" strokeWidth={1} />
                <motion.div 
                  className="absolute -right-4 -top-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-12 h-12 text-primary" fill="currentColor" />
                </motion.div>
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Agent Identity</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">Let's start by giving your agent a name and a voice.</p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                <Globe className="w-32 h-32 text-blue-600 dark:text-blue-400 relative z-10" strokeWidth={1} />
                <motion.div
                   className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full"
                   animate={{ rotate: -360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Business Context</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">Teach your agent about your company and its mission.</p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                <BrainCircuit className="w-32 h-32 text-amber-600 dark:text-amber-400 relative z-10" strokeWidth={1} />
                <motion.div
                   className="absolute -inset-8 bg-amber-500/5 rounded-full"
                   animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                   transition={{ duration: 4, repeat: Infinity }}
                />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Knowledge Base</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">Upload documents to build your agent's brain.</p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                <Phone className="w-32 h-32 text-green-600 dark:text-green-400 relative z-10" strokeWidth={1} />
                <motion.div
                   className="absolute -right-12 top-1/2 -translate-y-1/2"
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: 0.5 }}
                >
                   <MessageSquare className="w-12 h-12 text-green-600 dark:text-green-200" fill="currentColor" />
                </motion.div>
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Call Flow</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">Define how your agent handles conversations.</p>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                <Zap className="w-32 h-32 text-purple-600 dark:text-purple-400 relative z-10" strokeWidth={1} />
                <motion.div
                  className="absolute inset-0"
                  animate={{ filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Ready to Launch</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">Review your configuration and bring your agent to life.</p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function RouteComponent() {
  const { workspaceId } = useParams({ from: '/_app/$workspaceId/agents/create' })
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<AgentConfig>({
    name: '',
    type: '',
    language: '',
    voice: '',
    businessName: '',
    businessDescription: '',
    targetCallers: '',
    knowledgeText: '',
    primaryGoal: '',
    collectFields: [],
  })

  // Mock function if store not available or just for demo, but we import useAgentStore
  const createAgent = useAgentStore((state) => state.createAgent)
  
  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      await createAgent(config)
      navigate({ to: `/${workspaceId}/agents` })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex w-[45%] bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden flex-col">
        {/* Background Grid/Effects */}
        <div className="absolute inset-0 opacity-20 dark:opacity-20 opacity-5"
             style={{ 
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-950/50" />
        
        {/* Branding */}
        <div className="relative z-20 p-8">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold tracking-tight">
            <div className="p-1 bg-primary rounded-md">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            Callmind Agents
          </div>
        </div>

        {/* Dynamic Visual */}
        <div className="flex-1 relative">
           <StepVisual step={step} />
        </div>

        {/* Progress Dots */}
        <div className="relative z-20 pb-12 flex justify-center gap-2">
          {steps.map((_, i) => (
             <motion.div 
                key={i}
                initial={false}
                animate={{ 
                  width: i === step ? 32 : 8,
                  backgroundColor: i === step ? 'var(--primary)' : 'var(--muted)',
                  opacity: i === step ? 1 : 0.5
                }}
                className="h-2 rounded-full transition-all"
                style={{ backgroundColor: i === step ? undefined : 'currentColor', color: i === step ? undefined : 'gray' }}
             />
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background/50 backdrop-blur-sm">
        {/* Mobile Header (Progress) */}
        <div className="lg:hidden p-4 border-b">
           <div className="flex items-center justify-between mb-2">
             <h1 className="font-semibold">Step {step + 1} of {steps.length}</h1>
             <span className="text-xs text-muted-foreground">{steps[step].title}</span>
           </div>
           <div className="h-1 bg-muted rounded-full w-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
           </div>
        </div>

        {/* Breadcrumb / Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-8 border-b">
          <div>
            <Button variant="ghost" size="sm" className="pl-0 hover:pl-0 text-muted-foreground hover:text-foreground" onClick={() => navigate({ to: `/${workspaceId}/agents` })}>
               <ChevronLeft className="h-4 w-4 mr-1" />
               Exit Setup
            </Button>
          </div>
          <div className="flex gap-4">
             {/* Could add help/support links here */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto p-6 lg:p-12 space-y-8">
             <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {React.createElement(steps[step].icon, { className: "h-3.5 w-3.5" })}
                  Step {step + 1}: {steps[step].title}
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{steps[step].description}</h1>
                <p className="text-muted-foreground">{steps[step].details}.</p>
             </div>

             <div className="pt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step === 0 && <AgentBasicsStep config={config} updateConfig={updateConfig} />}
                    {step === 1 && <BusinessContextStep config={config} updateConfig={updateConfig} />}
                    {step === 2 && <KnowledgeStep config={config} updateConfig={updateConfig} />}
                    {step === 3 && <CallFlowStep config={config} updateConfig={updateConfig} />}
                    {step === 4 && <ReviewStep config={config} />}
                  </motion.div>
                </AnimatePresence>
             </div>
          </div>
        </main>

        {/* Footer */}
        <div className="p-6 lg:px-12 lg:py-8 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
           <div className="max-w-xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="w-24"
              >
                Back
              </Button>

              {step === steps.length - 1 ? (
                 <Button onClick={handleCreate} disabled={loading} className="w-32">
                   {loading ? (
                     <Sparkles className="h-4 w-4 animate-spin" />
                   ) : (
                     <span className="flex items-center gap-2">Launch <RocketIcon className="w-4 h-4" /></span>
                   )}
                 </Button>
              ) : (
                <Button onClick={() => setStep(s => s + 1)} className="w-32 group">
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/create')({
  component: RouteComponent,
})