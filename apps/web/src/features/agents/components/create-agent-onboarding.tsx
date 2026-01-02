import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Check, Rocket } from 'lucide-react'

import BasicInfoStep from './create-agent-steps/basic-info-step'
import KnowledgeStep from './create-agent-steps/knowledge-step'
import PersonalityStep from './create-agent-steps/personality-step'

interface CreateAgentData {
  name: string
  description: string
  model: string
  temperature: number
  maxTokens: number
  language: string
  voice: string
  personality: string
  capabilities: Array<string>
  knowledgeBase: Array<string>
  escalationThreshold: number
}

const initialData: CreateAgentData = {
  name: '',
  description: '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  language: 'English',
  voice: 'professional',
  personality: 'professional',
  capabilities: [],
  knowledgeBase: [],
  escalationThreshold: 0.3
}

const steps = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Set up your agent\'s identity and capabilities',
    component: BasicInfoStep
  },
  {
    id: 'personality',
    title: 'Personality & Voice',
    description: 'Define how your agent communicates',
    component: PersonalityStep
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    description: 'Configure what your agent knows',
    component: KnowledgeStep
  }
]

interface CreateAgentOnboardingProps {
  onComplete?: (agentData: CreateAgentData) => void
  onCancel?: () => void
}

export default function CreateAgentOnboarding({ onComplete, onCancel }: CreateAgentOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [agentData, setAgentData] = useState<CreateAgentData>(initialData)

  const currentStepData = steps[currentStep]
  const CurrentStepComponent = currentStepData.component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete the onboarding
      onComplete?.(agentData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStepData.id) {
      case 'basic':
        return agentData.name.trim() && agentData.description.trim() && agentData.capabilities.length > 0
      case 'personality':
        return agentData.personality && agentData.voice
      case 'knowledge':
        return agentData.knowledgeBase.length > 0
      default:
        return false
    }
  }

  const getProgressPercentage = () => {
    return ((currentStep + 1) / steps.length) * 100
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agents
            </Button>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>

          {/* Step Title */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{currentStepData.title}</h1>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <CurrentStepComponent 
              data={agentData} 
              onChange={setAgentData} 
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button 
            onClick={handleNext}
            disabled={!isStepValid()}
            className={currentStep === steps.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Create Agent
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-blue-600' 
                  : index < currentStep 
                    ? 'bg-green-600' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
