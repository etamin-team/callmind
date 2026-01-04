import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import { BookText, Bot, Briefcase, Check, ChevronLeft, ChevronRight, Phone, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgentStore } from '@/features/agents/store'

import { 
  AgentBasicsStep,
  BusinessContextStep,
  CallFlowStep,
  KnowledgeStep,
  ReviewStep,
} from '@/features/agents/components'

const steps = [
  { title: 'Agent Basics', icon: Bot, description: 'Define your AI agent identity' },
  { title: 'Business Context', icon: Briefcase, description: 'Tell us about your business' },
  { title: 'Knowledge Base', icon: BookText, description: 'Upload your knowledge documents' },
  { title: 'Call Flow', icon: Phone, description: 'Design call interactions' },
  { title: 'Launch', icon: Zap, description: 'Review and activate your agent' },
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

function RouteComponent() {
  const [step, setStep] = useState(0)
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

  const createAgent = useAgentStore((state) => state.createAgent)
  
  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-muted rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create AI Agent</h1>
              <p className="text-sm text-muted-foreground">
                Step {step + 1} of {steps.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Navigation Steps */}
        <div className="flex items-center justify-center gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center">
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                i <= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <s.icon className="h-5 w-5" />
                {i < step && (
                  <Check className="absolute h-3 w-3 -bottom-0.5 -right-0.5 bg-green-500 text-white rounded-full p-0.5" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  i < step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {React.createElement(steps[step].icon, { className: "h-5 w-5 text-primary" })}
              </div>
              <CardTitle className="text-xl font-semibold">{steps[step].title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{steps[step].description}</p>
          </CardHeader>
          
          <CardContent className="py-8">
            {step === 0 && <AgentBasicsStep config={config} updateConfig={updateConfig} />}
            {step === 1 && <BusinessContextStep config={config} updateConfig={updateConfig} />}
            {step === 2 && <KnowledgeStep config={config} updateConfig={updateConfig} />}
            {step === 3 && <CallFlowStep config={config} updateConfig={updateConfig} />}
            {step === 4 && <ReviewStep config={config} />}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {step === steps.length - 1 ? (
            <Button onClick={() => createAgent(config)}>
              <Check className="h-4 w-4 mr-2" />
              Launch Agent
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/create')({
  component: RouteComponent,
})