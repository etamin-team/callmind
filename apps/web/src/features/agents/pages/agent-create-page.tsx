import { useNavigate, useParams } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, Bot, Send, User, Sparkles, Rocket, Check, Settings } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '@tanstack/react-store'
import { useAuth } from '@clerk/clerk-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { onboardingStore, updateOnboardingData, resetOnboarding } from '../store/onboarding-store'
import { BorderBeam } from '@/components/ui/border-beam'
import { Badge } from '@/components/ui/badge'
import { generateSystemPrompt } from '@/lib/ai/gemini'
import { createAgent } from '../api'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "Hi! I'm your AI Agent Architect. Let's build your next intelligent workforce together. What should we name your new agent?",
  timestamp: new Date()
}

export default function AgentCreateChatPage() {
  const navigate = useNavigate()
  const { workspaceId } = useParams({ from: '/_app/$workspaceId/agents/create' })
  const { getToken } = useAuth()
  const state = useStore(onboardingStore)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [step, setStep] = useState<'name' | 'type' | 'languageVoice' | 'businessName' | 'industry' | 'businessDescription' | 'targetCallers' | 'primaryGoal' | 'greeting' | 'systemPrompt' | 'launch'>('name')

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Fallback: if we somehow get to launch without a prompt, try to generate one
  useEffect(() => {
    const generatePrompt = async () => {
      if (step === 'launch' && !state.data.systemPrompt && !isGeneratingPrompt) {
        console.log('⚠️ Reached launch without system prompt, generating now...')
        setIsGeneratingPrompt(true)
        try {
          const currentState = onboardingStore.state.data;
          const systemPrompt = await generateSystemPrompt({
            name: currentState.name || 'Agent',
            description: currentState.businessDescription || 'AI assistant',
            personality: currentState.type || 'Helpful assistant'
          })
          console.log('✅ System prompt generated successfully, length:', systemPrompt.length)
          updateOnboardingData({ systemPrompt })
        } catch (error: any) {
          console.error('❌ Failed to generate system prompt:', error)
        } finally {
          setIsGeneratingPrompt(false)
        }
      }
    }
    generatePrompt()
  }, [step, state.data.systemPrompt])

  const addMessage = (content: string, role: 'assistant' | 'user') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return

    const userEntry = inputValue.trim()
    setInputValue('')
    addMessage(userEntry, 'user')
    setIsTyping(true)

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 800))

    let aiResponse = ''

    switch (step) {
      case 'name': {
        updateOnboardingData({ name: userEntry })
        aiResponse = `Great name! "${userEntry}" sounds powerful. What type of agent are we creating?\n\nOptions: Inbound Support, Outbound Sales, Receptionist, or Appointment Setter?`
        setStep('type')
        break
      }

      case 'type': {
        const validTypes = ['inbound support', 'outbound sales', 'receptionist', 'appointment setter']
        const typeLower = userEntry.toLowerCase()

        if (validTypes.includes(typeLower)) {
          updateOnboardingData({ type: userEntry })
          aiResponse = `Understood. Now let's give your agent its voice. What language should it speak? (e.g., English, Uzbek, Russian)`
          setStep('languageVoice')
        } else {
          aiResponse = `Please select one of the following: Inbound Support, Outbound Sales, Receptionist, or Appointment Setter.`
        }
        break
      }

      case 'languageVoice': {
        // First input is language
        updateOnboardingData({ language: userEntry })
        aiResponse = `Got it. Which voice profile fits best? Options: Sarah Friendly, Mike Professional, Atlas Deep, or Nova Energetic.`
        // Note: We stay in this step, but need to track if we're collecting voice next
        // For simplicity, let's make a separate step or handle it differently
        break
      }

      case 'businessName': {
        updateOnboardingData({ businessName: userEntry })
        aiResponse = `Thanks! What industry does ${userEntry} operate in? (e.g., Real Estate, Healthcare, Solar, Insurance, Legal, Financial, E-commerce, Other)`
        setStep('industry')
        break
      }

      case 'industry': {
        updateOnboardingData({ businessIndustry: userEntry })
        aiResponse = `Got it. Could you briefly describe what ${state.data.businessName} does? This helps me understand the context.`
        setStep('businessDescription')
        break
      }

      case 'businessDescription': {
        updateOnboardingData({ businessDescription: userEntry })
        aiResponse = `Perfect. Who will your agent be talking to primarily? (e.g., New Leads, Existing Customers, Partners, Mixed)`
        setStep('targetCallers')
        break
      }

      case 'targetCallers': {
        updateOnboardingData({ targetCallers: userEntry })
        aiResponse = `Excellent. What's the main goal for each call?\n\nOptions:\n• Information/Support - Answer questions based on knowledge base\n• Lead Qualification - Gather info and qualify prospects\n• Appointment Booking - Schedule meetings or calls\n• Direct Transfer - Transfer to human immediately`
        setStep('primaryGoal')
        break
      }

      case 'primaryGoal': {
        updateOnboardingData({ primaryGoal: userEntry })

        if (userEntry.toLowerCase().includes('direct transfer')) {
          aiResponse = `Got it. What phone number should we transfer to?`
          // Stay in this step but collect phone transfer
        } else {
          aiResponse = `Great! What should the agent say when answering the phone? You can use: "Hi, this is ${state.data.name} from ${state.data.businessName}, how can I help you today?"`
          setStep('greeting')
        }
        break
      }

      case 'greeting': {
        updateOnboardingData({ greeting: userEntry })

        // Trigger generation immediately, then show message
        setIsGeneratingPrompt(true)
        setIsTyping(false) // Hide typing indicator

        try {
          const systemPrompt = await generateSystemPrompt({
            name: state.data.name || 'Agent',
            description: state.data.businessDescription || 'AI assistant',
            personality: state.data.type || 'Helpful assistant'
          })

          console.log('✅ System prompt generated successfully')
          updateOnboardingData({ systemPrompt })

          addMessage(`Perfect! I have everything I need. I've crafted the custom system DNA for "${state.data.name}" (${systemPrompt.length} characters). Click the 'Complete Launch' button when you're ready to activate your agent.`, 'assistant')
          setStep('launch')
        } catch (error: any) {
          console.error('❌ Failed to generate system prompt:', error)
          addMessage(`I had trouble generating the system prompt (${error?.message || 'unknown error'}). We can still proceed! You can add a system prompt later in Settings.\n\nTip: Make sure your VITE_GEMINI_API_KEY is configured in your .env file.`, 'assistant')
          setStep('launch')
        } finally {
          setIsGeneratingPrompt(false)
        }
        break
      }

      case 'launch': {
        aiResponse = "Ready for takeoff! Click the 'Complete Launch' button whenever you're ready."
        break
      }
    }

    // Handle voice collection edge case
    if (step === 'languageVoice') {
      const validVoices = ['sarah friendly', 'mike professional', 'atlas deep', 'nova energetic']
      if (validVoices.includes(userEntry.toLowerCase())) {
        updateOnboardingData({ voice: userEntry })
        aiResponse = `Excellent choice. What company or organization will this agent represent?`
        setStep('businessName')
      } else if (!state.data.voice) {
        // First message was language, now asking for voice
        aiResponse = `Got it. Which voice profile fits best? Options: Sarah Friendly, Mike Professional, Atlas Deep, or Nova Energetic.`
      }
    }

    // Handle phone transfer edge case
    if (step === 'primaryGoal' && state.data.primaryGoal?.toLowerCase().includes('direct transfer') && !state.data.phoneTransfer) {
      if (userEntry.match(/^[\d\s\-+()]+$/)) {
        updateOnboardingData({ phoneTransfer: userEntry })
        aiResponse = `Got it. What should the agent say when answering the phone?`
        setStep('greeting')
      }
    }

    addMessage(aiResponse, 'assistant')
    setIsTyping(false)
  }

  const handleLaunch = async () => {
    console.log('🎯 handleLaunch called!')
    setIsLaunching(true)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      // Ensure system prompt exists or regenerate
      let systemPrompt = onboardingStore.state.data.systemPrompt // Read direct state
      
      if (!systemPrompt || systemPrompt.trim() === '') {
        console.log('⚠️ System prompt missing. Attempting final generation...')
        // Force a UI update to show we are working
        updateOnboardingData({ systemPrompt: '' }) 
        
        try {
          const currentState = onboardingStore.state.data
          systemPrompt = await generateSystemPrompt({
            name: currentState.name || 'Agent',
            description: currentState.businessDescription || 'AI assistant',
            personality: currentState.type || 'Helpful assistant'
          })
          
          if (!systemPrompt) throw new Error("Generated empty prompt")
          updateOnboardingData({ systemPrompt })
          
        } catch (genError) {
          console.error("❌ Critical: Failed to generate system prompt at launch", genError)
          setIsLaunching(false) // Stop spinner
          addMessage("I couldn't generate the system prompt. Please check your internet connection or API key and try clicking 'Complete Launch' again.", 'assistant')
          return // ABORT LAUNCH
        }
      }

      // Proceed to create agent ONLY if we have a prompt
      console.log('📦 Creating agent...')
      const agentData = {
        name: state.data.name,
        type: state.data.type,
        language: state.data.language,
        voice: state.data.voice,
        businessName: state.data.businessName,
        businessDescription: state.data.businessDescription,
        businessIndustry: state.data.businessIndustry,
        targetCallers: state.data.targetCallers,
        primaryGoal: state.data.primaryGoal,
        phoneTransfer: state.data.phoneTransfer,
        greeting: state.data.greeting,
        systemPrompt: systemPrompt,
        knowledgeText: '',
        objectionHandling: '',
        collectFields: [],
      }

      const createdAgent = await createAgent(agentData, token)
      
      // Success!
      addMessage("Agent created successfully! Redirecting...", 'assistant')
      await new Promise(r => setTimeout(r, 1000)) // Small delay for effect
      
      navigate({ to: `/${workspaceId}/agents/${createdAgent.id}` })
      // We reset AFTER navigation logic initiates
      setTimeout(resetOnboarding, 500)
      
    } catch (error) {
      console.error('❌ Failed to create agent:', error)
      setIsLaunching(false)
      addMessage("I had trouble creating your agent. Please try again.", 'assistant')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030303] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/50 bg-white/50 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: `/${workspaceId}/agents` })} className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Agent Architect</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live Assistant
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <Badge variant="outline" className="hidden md:flex gap-1 border-primary/20 bg-primary/5 text-primary">
             <Sparkles className="h-3 w-3" />
             AI Assisted Creation
           </Badge>
           <Button variant="ghost" size="sm" onClick={() => navigate({ to: `/${workspaceId}/agents` })} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            Exit
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950/20 relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
            <div className="max-w-3xl mx-auto w-full space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                        message.role === 'assistant'
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                        message.role === 'assistant'
                          ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200'
                          : 'bg-primary text-white font-medium'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl flex gap-1 items-center h-10">
                      <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}

              {isGeneratingPrompt && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl flex items-center gap-2 h-10">
                      <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Generating system prompt...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-8 border-t border-slate-200 dark:border-zinc-800/50 bg-white/50 dark:bg-black/50 backdrop-blur-md">
            <div className="max-w-3xl mx-auto relative group">
              <BorderBeam className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-2">
                <Input
                  placeholder={step === 'launch' ? "Creation complete! Review details on the right..." : "Type your message..."}
                  disabled={step === 'launch' || isLaunching}
                  className="h-14 px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-primary focus:border-primary transition-all pr-16"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping || step === 'launch'}
                  className="absolute right-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="mt-3 text-[10px] text-center text-slate-400 dark:text-zinc-600 font-medium uppercase tracking-[0.2em]">
                Press Enter to send • Your progress is saved automatically
              </p>
            </div>
          </div>
        </main>

        {/* Sidebar Status (Hidden on small screens) */}
        <aside className="hidden lg:flex w-80 border-l border-slate-200 dark:border-zinc-800/50 flex-col bg-white dark:bg-[#050505]">
          <div className="p-6 border-b border-slate-200 dark:border-zinc-800/50">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Agent Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-1">Real-time compilation of your agent's core.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="space-y-6">
              {/* Identity Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity</span>
                  {state.data.name && state.data.type && <Check className="h-3 w-3 text-green-500" />}
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[9px] text-slate-400 block mb-0.5">Name</label>
                    <div className="text-xs font-semibold truncate">{state.data.name || <span className="text-zinc-400 font-normal">TBD</span>}</div>
                  </div>
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[9px] text-slate-400 block mb-0.5">Type</label>
                    <div className="text-xs font-semibold truncate">{state.data.type || <span className="text-zinc-400 font-normal">TBD</span>}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                      <label className="text-[9px] text-slate-400 block mb-0.5">Language</label>
                      <div className="text-xs font-medium truncate">{state.data.language || <span className="text-zinc-400">TBD</span>}</div>
                    </div>
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                      <label className="text-[9px] text-slate-400 block mb-0.5">Voice</label>
                      <div className="text-xs font-medium truncate">{state.data.voice || <span className="text-zinc-400">TBD</span>}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business</span>
                  {state.data.businessName && state.data.businessDescription && <Check className="h-3 w-3 text-green-500" />}
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[9px] text-slate-400 block mb-0.5">Company</label>
                    <div className="text-xs font-semibold truncate">{state.data.businessName || <span className="text-zinc-400 font-normal">TBD</span>}</div>
                  </div>
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[9px] text-slate-400 block mb-0.5">Industry</label>
                    <div className="text-xs font-medium truncate">{state.data.businessIndustry || <span className="text-zinc-400">TBD</span>}</div>
                  </div>
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[9px] text-slate-400 block mb-0.5">Description</label>
                    <div className="text-xs line-clamp-2">{state.data.businessDescription || <span className="text-zinc-400">TBD</span>}</div>
                  </div>
                </div>
              </div>

              {/* Behavior Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Behavior</span>
                  {state.data.primaryGoal && state.data.greeting && <Check className="h-3 w-3 text-green-500" />}
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-gradient-to-br from-primary/5 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/10 rounded-lg border border-primary/10">
                    <label className="text-[9px] text-slate-400 block mb-0.5">Target Callers</label>
                    <div className="text-xs font-bold truncate">{state.data.targetCallers || <span className="text-zinc-400 font-normal">TBD</span>}</div>
                  </div>
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[9px] text-slate-400 block mb-0.5">Primary Goal</label>
                    <div className="text-xs line-clamp-2">{state.data.primaryGoal || <span className="text-zinc-400">TBD</span>}</div>
                  </div>
                  <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[9px] text-slate-400 block mb-0.5">Greeting</label>
                    <div className="text-xs line-clamp-2">{state.data.greeting || <span className="text-zinc-400">TBD</span>}</div>
                  </div>
                </div>
              </div>

              {/* System Prompt Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Prompt</span>
                  {isGeneratingPrompt ? (
                    <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : state.data.systemPrompt ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : null}
                </div>
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50 max-h-32 overflow-y-auto">
                  {isGeneratingPrompt ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-[10px] text-muted-foreground">Generating...</span>
                    </div>
                  ) : state.data.systemPrompt ? (
                    <p className="text-[10px] text-muted-foreground whitespace-pre-wrap line-clamp-4">{state.data.systemPrompt}</p>
                  ) : (
                    <span className="text-xs text-zinc-400">Waiting for generation...</span>
                  )}
                </div>
              </div>

              {step === 'launch' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-4"
                >
                  <Button
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    className="w-full h-12 rounded-xl bg-primary text-white shadow-xl shadow-primary/25 relative overflow-hidden group font-bold"
                  >
                    <AnimatePresence mode="wait">
                      {isLaunching ? (
                        <motion.div key="launching" className="flex items-center gap-2">
                           <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Creating Agent...
                        </motion.div>
                      ) : (
                        <motion.div key="deploy" className="flex items-center gap-2">
                           <Rocket className="h-4 w-4" />
                           Complete Launch
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}
