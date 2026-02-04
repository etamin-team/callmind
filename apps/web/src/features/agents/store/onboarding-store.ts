import { Store } from '@tanstack/store'

export interface OnboardingState {
  step: number
  data: {
    // Core identity
    name: string
    type: string
    language: string
    voice: string
    greeting: string

    // Business context
    businessName: string
    businessDescription: string
    businessIndustry: string
    targetCallers: string

    // Call behavior
    primaryGoal: string
    phoneTransfer?: string

    // Generated
    systemPrompt?: string

    // Optional fields with defaults
    knowledgeText?: string
    objectionHandling?: string
    collectFields?: string[]
  }
}

export const initialOnboardingData = {
  name: '',
  type: '',
  language: 'English',
  voice: '',
  greeting: '',
  businessName: '',
  businessDescription: '',
  businessIndustry: '',
  targetCallers: '',
  primaryGoal: '',
  phoneTransfer: '',
  systemPrompt: '',
  knowledgeText: '',
  objectionHandling: '',
  collectFields: []
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
