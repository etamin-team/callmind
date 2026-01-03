import { Store } from '@tanstack/store'

export interface OnboardingState {
  step: number
  data: {
    name: string
    description: string
    model: string
    temperature: number
    maxTokens: number
    language: string
    voice: string
    personality: string
    capabilities: string[]
    knowledgeBase: string[]
    escalationThreshold: number
    initialGreeting?: string
  }
}

export const initialOnboardingData = {
  name: '',
  description: '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 500,
  language: 'English',
  voice: 'professional',
  personality: 'analytical',
  capabilities: [],
  knowledgeBase: [],
  escalationThreshold: 0.3,
  initialGreeting: ''
}

export const onboardingStore = new Store<OnboardingState>({
  step: 0,
  data: initialOnboardingData
})

export const updateOnboardingData = (newData: Partial<OnboardingState['data']>) => {
  onboardingStore.setState((state) => ({
    ...state,
    data: { ...state.data, ...newData }
  }))
}

export const nextStep = () => {
  onboardingStore.setState((state) => ({
    ...state,
    step: state.step + 1
  }))
}

export const prevStep = () => {
  onboardingStore.setState((state) => ({
    ...state,
    step: Math.max(0, state.step - 1)
  }))
}

export const resetOnboarding = () => {
  onboardingStore.setState(() => ({
    step: 0,
    data: initialOnboardingData
  }))
}
