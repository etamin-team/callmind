import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { onboardingStore, nextStep, prevStep } from '../store/onboarding-store'
import { motion, AnimatePresence } from 'motion/react'

import BasicInfoStep from './steps/basic-info-step'
import KnowledgeStep from './steps/knowledge-step'
import PersonalityStep from './steps/personality-step'
import TemplateStep from './steps/template-step'

const steps = [
  {
    id: 'template',
    title: 'Select Scenario',
    description: 'Start with a pre-configured analysis blueprint',
    component: TemplateStep
  },
  {
    id: 'basic',
    title: 'Assistant Identity',
    description: 'Define the analysis profile and core objectives',
    component: BasicInfoStep
  },
  {
    id: 'personality',
    title: 'Analysis Style',
    description: 'Set the guidance tone and vocal feedback',
    component: PersonalityStep
  },
  {
    id: 'knowledge',
    title: 'Battlecards',
    description: 'Connect internal knowledge and guidance rules',
    component: KnowledgeStep
  }
]

interface CreateAgentOnboardingProps {
  onComplete?: (agentData: any) => void
  onCancel?: () => void
}

export default function CreateAgentOnboarding({ onComplete, onCancel }: CreateAgentOnboardingProps) {
  const { step: currentStep, data: agentData } = useStore(onboardingStore)

  const currentStepData = steps[currentStep]
  const CurrentStepComponent = currentStepData.component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep()
    } else {
      onComplete?.(agentData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      prevStep()
    }
  }

  const isStepValid = () => {
    switch (currentStepData.id) {
      case 'template':
        return true
      case 'basic':
        return agentData.name.trim() && agentData.description.trim()
      case 'personality':
        return agentData.personality && agentData.voice
      case 'knowledge':
        return agentData.knowledgeBase.length > 0 || agentData.capabilities.length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-zinc-800">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-400/[0.03] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="h-24 border-b border-zinc-900 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-12 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <button 
            onClick={onCancel} 
            className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-white transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Cancel Build</span>
          </button>
          
          <div className="h-8 w-[1px] bg-zinc-900" />
          
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold mb-1">Intelligence Nexus</span>
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold tracking-tight text-white">Agent Constructor</h2>
              <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 font-mono">v4.0.12</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className="relative h-1 bg-zinc-900 overflow-hidden rounded-full transition-all duration-500"
                style={{ width: index === currentStep ? '60px' : '12px' }}
              >
                <motion.div 
                  initial={false}
                  animate={{ 
                    width: index === currentStep ? '100%' : index < currentStep ? '100%' : '0%',
                    backgroundColor: index <= currentStep ? '#fff' : '#18181b'
                  }}
                  className="absolute inset-0 h-full"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none mb-1">Deployment Progress</span>
            <span className="text-xs font-bold text-white tabular-nums tracking-tighter">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-20 px-6 overflow-x-hidden">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step Content */}
              <CurrentStepComponent />

              {/* Navigation Footer */}
              {currentStepData.id !== 'template' && (
                <div className="flex items-center justify-between mt-24 pt-16 border-t border-zinc-900">
                  <Button 
                    variant="ghost" 
                    onClick={handlePrevious}
                    className="h-16 px-10 text-zinc-500 hover:text-white hover:bg-zinc-900/50 rounded-3xl transition-all group"
                  >
                    <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                    Previous Phase
                  </Button>

                  <div className="flex gap-6">
                    <Button 
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className={`h-16 px-12 text-base font-bold rounded-3xl transition-all duration-500 shadow-2xl ${
                        currentStep === steps.length - 1 
                          ? 'bg-white text-black hover:bg-zinc-200' 
                          : 'bg-zinc-100 text-black hover:bg-white'
                      }`}
                    >
                      {currentStep === steps.length - 1 ? (
                        <>
                          Finalize Injection
                          <Rocket className="w-4 h-4 ml-3" />
                        </>
                      ) : (
                        <>
                          Proceed to Phase 0{currentStep + 2}
                          <ArrowRight className="w-4 h-4 ml-3" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
