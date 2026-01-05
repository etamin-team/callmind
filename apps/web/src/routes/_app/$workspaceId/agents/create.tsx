import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BookText, Bot, Briefcase, ChevronLeft, ChevronRight, Phone, Zap, Sparkles } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

import { Button } from '@/components/ui/button'

import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { useAgentStore } from '@/features/agents/store'
import { CreateAgentRequest } from '@/features/agents/types'
import { 
  AgentBasicsStep,
  BusinessContextStep,
  CallFlowStep,
  KnowledgeStep,
  ReviewStep,
} from '@/features/agents/components'

// Local form state type to ensure compatibility with step components
type AgentFormState = {
  name: string
  type: string
  language: string
  voice: string
  greeting: string
  phoneTransfer: string
  objectionHandling: string
  businessName: string
  businessDescription: string
  businessIndustry: string
  targetCallers: string
  knowledgeText: string
  primaryGoal: string
  collectFields: string[]
}

const steps = [
  { 
    title: 'Identity', 
    icon: Bot, 
    description: 'Design your agent',
    details: 'Name, Voice, Personality'
  },
  { 
    title: 'Context', 
    icon: Briefcase, 
    description: 'Business context',
    details: 'Company Info, Goals' 
  },
  { 
    title: 'Knowledge', 
    icon: BookText, 
    description: 'Knowledge base',
    details: 'Documents, FAQs' 
  },
  { 
    title: 'Behavior', 
    icon: Phone, 
    description: 'Interaction flow',
    details: 'Call Structure, Rules' 
  },
  { 
    title: 'Launch', 
    icon: Zap, 
    description: 'Review & Launch',
    details: 'Final Review' 
  },
]



// Visual component for the left sidebar based on current step
const StepVisual = ({ step, config }: { step: number; config: AgentFormState }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 lg:p-12 z-10">
      <AnimatedGroup
        className="w-full max-w-sm perspective-1000"
        variants={{
           container: { visible: { transition: { staggerChildren: 0.1 } } },
           item: { 
             hidden: { opacity: 0, y: 10, filter: 'blur(4px)' }, 
             visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: "easeOut" } } 
           }
        }}
      >
        <div className="relative group">
          <motion.div
             key={step}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             transition={{ duration: 0.4, ease: "circOut" }}
             className="relative z-10"
          >
             {step === 0 && <IdentityPreview config={config} />}
             {step === 1 && <ContextPreview config={config} />}
             {step === 2 && <KnowledgePreview />}
             {step === 3 && <BehaviorPreview />}
             {step === 4 && <LaunchPreview />}
          </motion.div>
        
          {/* Subtle Shadow */}
          <div className="absolute -bottom-8 left-8 right-8 h-8 bg-zinc-500/10 blur-xl rounded-[100%] z-0" />
        </div>

        {/* Text description below the visual */}
        <div className="mt-12 text-center space-y-3 max-w-xs mx-auto relative z-20">
          <TextEffect 
            key={`title-${step}`} 
            as="h2" 
            preset="fade" 
            className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            {steps[step].title === 'Identity' ? "Persona Design" :
             steps[step].title === 'Context' ? "Business Context" :
             steps[step].title === 'Knowledge' ? "Knowledge Base" :
             steps[step].title === 'Behavior' ? "Interaction Flow" :
             "Ready to Launch"}
          </TextEffect>
          
          <TextEffect 
             key={`desc-${step}`} 
             as="p" 
             preset="fade" 
             delay={0.1}
             className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium"
          >
            {steps[step].title === 'Identity' ? "Craft a unique voice and personality." :
             steps[step].title === 'Context' ? "Define who your agent represents." :
             steps[step].title === 'Knowledge' ? "Upload docs to train your agent." :
             steps[step].title === 'Behavior' ? "Control how your agent handles calls." :
             "Activate your new AI employee."}
          </TextEffect>
        </div>
      </AnimatedGroup>
    </div>
  )
}

// --- Minimalist Preview Components ---

const IdentityPreview = ({ config }: { config: AgentFormState }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
      <div className="p-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-1.5">
          <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <div className="p-8 flex flex-col items-center">
         <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 relative">
            {config.name ? (
               <span className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
               {config.name[0]?.toUpperCase()}
               </span>
            ) : (
               <Bot className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
            )}
            
            {/* Minimal Voice Indicator */}
            <div className="absolute -bottom-3 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-sm flex items-center gap-1">
               <div className="w-1 h-3 bg-primary rounded-full" />
               <div className="w-1 h-2 bg-primary/50 rounded-full" />
               <div className="w-1 h-3 bg-primary rounded-full" />
            </div>
         </div>

         <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {config.name || 'Untitled Agent'}
         </h3>
         <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-6">
            {config.type || 'Assistant'}
         </p>

         <div className="w-full flex gap-3 text-xs">
            <div className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
               <span className="block text-zinc-400 mb-1">Language</span>
               <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {config.language === 'en' ? 'English' : config.language.toUpperCase()}
               </span>
            </div>
            <div className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
               <span className="block text-zinc-400 mb-1">Voice</span>
               <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[80px] mx-auto">
                  {config.voice || 'Default'}
               </span>
            </div>
         </div>
      </div>
    </div>
  )
}

const ContextPreview = ({ config }: { config: AgentFormState }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
      <div className="p-6">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              <Briefcase className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Profile</h3>
              <p className="text-xs text-zinc-500">Business Details</p>
            </div>
         </div>
         
         <div className="space-y-3">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
               <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">Organization</span>
               <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                  {config.businessName || 'Not Set'}
               </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
               <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">Industry</span>
               <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                  {config.businessIndustry || 'Not Set'}
               </p>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
               <div className="h-1 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[60%] rounded-full" />
               </div>
               <span className="text-[10px] font-medium text-zinc-400">60% Complete</span>
            </div>
         </div>
      </div>
    </div>
  )
}

const KnowledgePreview = () => {
  return (
   <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
      <div className="p-6">
         <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                   <BookText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                   <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Knowledge</h3>
                   <p className="text-xs text-zinc-500">Sources</p>
                </div>
             </div>
             <span className="w-2 h-2 bg-green-500 rounded-full" />
         </div>

         <div className="space-y-2">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div className="w-8 h-8 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                     <div className="w-3 h-4 bg-zinc-200 dark:bg-zinc-600 rounded-[1px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="h-1.5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded mb-1.5" />
                     <div className="h-1 w-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  </div>
               </div>
             ))}
         </div>
      </div>
    </div>
  )
}

const BehaviorPreview = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500 h-[380px] flex flex-col">
       <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
             <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Simulation</span>
          </div>
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
       </div>

       <div className="flex-1 p-5 space-y-4 overflow-hidden relative">
          <div className="flex flex-col space-y-3">
             <motion.div 
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex gap-2"
             >
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-2xl rounded-tl-sm max-w-[85%]">
                   <div className="h-2 w-24 bg-zinc-300 dark:bg-zinc-600 rounded opacity-50" />
                </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="flex gap-2 flex-row-reverse"
             >
                <div className="w-6 h-6 rounded-full bg-primary/20" />
                <div className="bg-primary/5 dark:bg-primary/10 px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%] border border-primary/10">
                   <div className="h-2 w-32 bg-primary/20 dark:bg-primary/30 rounded" />
                </div>
             </motion.div>
             
             <motion.div 
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1 }}
               className="flex gap-2"
             >
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                 <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-2xl rounded-tl-sm max-w-[85%]">
                   <div className="h-2 w-20 bg-zinc-300 dark:bg-zinc-600 rounded opacity-50" />
                </div>
             </motion.div>
          </div>
       </div>
    </div>
  )
}

const LaunchPreview = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative">
         <div className="w-48 h-48 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm relative z-10">
            <div className="absolute inset-1 rounded-full border border-zinc-100 dark:border-zinc-800 border-dashed animate-[spin_30s_linear_infinite]" />
            
            <div className="text-center">
               <div className="w-12 h-12 mx-auto bg-green-500 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg shadow-green-500/20">
                  <Zap className="w-6 h-6 fill-current" />
               </div>
               <span className="text-xl font-bold text-zinc-900 dark:text-white block">Ready</span>
               <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Online</span>
            </div>
         </div>
         
         {/* Simple Orbit */}
         <div className="absolute inset-0 -m-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-full" />
      </div>
    </div>
  )
}

function RouteComponent() {
  const { workspaceId } = useParams({ from: '/_app/$workspaceId/agents/create' })
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Use local strict type for form state
  const [config, setConfig] = useState<AgentFormState>({
    name: '',
    type: '',
    language: 'en',
    voice: '',
    greeting: '',
    phoneTransfer: '',
    objectionHandling: '',
    businessName: '',
    businessDescription: '',
    businessIndustry: '',
    targetCallers: '',
    knowledgeText: '',
    primaryGoal: '',
    collectFields: [],
  })

  // Use store
  const { createAgent } = useAgentStore()
  
  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      if (token) {
        const createdAgent = await createAgent(config as CreateAgentRequest, token)
        if (createdAgent) {
           navigate({ to: `/${workspaceId}/agents/${createdAgent.id}` })
        } else {
           // Fallback if no agent returned
           navigate({ to: `/${workspaceId}/agents` })
        }
      } else {
        console.error('No auth token available')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background">
      {/* Shared Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{ 
               backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
               backgroundSize: '24px 24px'
             }} 
      />

      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex w-[45%] relative flex-col border-r border-border/40">
        
        {/* Branding */}
        <div className="relative z-20 p-8">
          <div className="flex items-center gap-2 text-foreground font-bold tracking-tight">
            <div className="p-1 bg-primary/10 rounded-md">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            Callmind Agents
          </div>
        </div>

        {/* Dynamic Visual */}
        <div className="flex-1 relative">
           <StepVisual step={step} config={config} />
        </div>

        {/* Progress Dots */}
        <div className="relative z-20 pb-12 flex justify-center gap-2">
          {steps.map((_, i) => (
             <motion.div 
                key={i}
                initial={false}
                animate={{ 
                  width: i === step ? 24 : 6,
                  backgroundColor: i === step ? 'var(--primary)' : 'var(--muted)',
                  opacity: i === step ? 1 : 0.3
                }}
                className="h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === step ? undefined : 'currentColor' }}
             />
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
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
        <header className="hidden lg:flex items-center justify-between p-8">
          <div>
            <Button variant="ghost" size="sm" className="pl-0 hover:pl-0 text-muted-foreground hover:text-foreground -ml-2" onClick={() => navigate({ to: `/${workspaceId}/agents` })}>
               <ChevronLeft className="h-4 w-4 mr-1" />
               Exit Setup
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto p-6 lg:p-12 space-y-8">
             <div className="space-y-1">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Step {step + 1} of {steps.length}</span>
                <h1 className="text-2xl font-semibold tracking-tight">{steps[step].description}</h1>
                <p className="text-muted-foreground text-sm">{steps[step].details}</p>
             </div>

             <div className="pt-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
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
        <div className="p-6 lg:px-12 lg:py-8">
           <div className="max-w-xl mx-auto flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="hover:bg-transparent hover:text-foreground text-muted-foreground"
              >
                Back
              </Button>

              {step === steps.length - 1 ? (
                 <Button onClick={handleCreate} disabled={loading} className="w-32 rounded-full shadow-lg shadow-primary/20">
                   {loading ? (
                     <Sparkles className="h-4 w-4 animate-spin" />
                   ) : (
                     <span className="flex items-center gap-2">Launch Agent</span>
                   )}
                 </Button>
              ) : (
                <Button onClick={() => setStep(s => s + 1)} className="w-32 rounded-full shadow-lg shadow-primary/20 group">
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



export const Route = createFileRoute('/_app/$workspaceId/agents/create')({
  component: RouteComponent,
})