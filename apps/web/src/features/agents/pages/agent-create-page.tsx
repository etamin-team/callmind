import { useNavigate, useParams } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, Bot, Send, User, Sparkles, Rocket, ArrowRight, Check, Settings, MessageSquare } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '@tanstack/react-store'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { onboardingStore, updateOnboardingData, resetOnboarding } from '../store/onboarding-store'
import { BorderBeam } from '@/components/ui/border-beam'
import { Badge } from '@/components/ui/badge'

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
  const state = useStore(onboardingStore)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [step, setStep] = useState<'name' | 'description' | 'personality' | 'review'>('name')
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

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
    await new Promise(resolve => setTimeout(resolve, 1000))

    let aiResponse = ''
    if (step === 'name') {
      updateOnboardingData({ name: userEntry })
      aiResponse = `Great name! "${userEntry}" sounds powerful. Now, tell me a bit about what this agent will do. What's its primary mission or description?`
      setStep('description')
    } else if (step === 'description') {
      updateOnboardingData({ description: userEntry })
      aiResponse = `Understood. I've noted the mission. How should "${state.data.name}" interact with users? Should it be Professional, Friendly, Analytical, or Bold?`
      setStep('personality')
    } else if (step === 'personality') {
      const personality = userEntry.toLowerCase()
      updateOnboardingData({ personality })
      aiResponse = `Perfect. I've set the personality to ${personality}. We're all set! Review the details on the right and let me know when you're ready to launch.`
      setStep('review')
    } else if (step === 'review') {
      aiResponse = "Ready for takeoff! Click the 'Complete Launch' button whenever you're ready."
    }

    addMessage(aiResponse, 'assistant')
    setIsTyping(false)
  }

  const handleLaunch = async () => {
    setIsLaunching(true)
    await new Promise(resolve => setTimeout(resolve, 2500))
    setIsLaunching(false)
    resetOnboarding()
    navigate({ to: `/${workspaceId}/agents` })
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
                      <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
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
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-8 border-t border-slate-200 dark:border-zinc-800/50 bg-white/50 dark:bg-black/50 backdrop-blur-md">
            <div className="max-w-3xl mx-auto relative group">
              <BorderBeam className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-2">
                <Input
                  placeholder={step === 'review' ? "Creation complete! Review details on the right..." : "Type your message..."}
                  disabled={step === 'review' || isLaunching}
                  className="h-14 px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-primary focus:border-primary transition-all pr-16"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping || step === 'review'}
                  className="absolute right-2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="mt-3 text-[10px] text-center text-slate-400 dark:text-zinc-600 font-medium uppercase tracking-[0.2em]">
                Press Enter to send &bull; Your progress is saved automatically
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
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadata</span>
                  {state.data.name && <Check className="h-3 w-3 text-green-500" />}
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[10px] text-slate-400 block mb-1">Name</label>
                    <div className="text-sm font-semibold truncate">{state.data.name || <span className="text-zinc-400 font-normal">TBD</span>}</div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                    <label className="text-[10px] text-slate-400 block mb-1">Description</label>
                    <div className="text-sm line-clamp-2">{state.data.description || <span className="text-zinc-400">TBD</span>}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Behavior</span>
                  {state.data.personality && <Check className="h-3 w-3 text-green-500" />}
                </div>
                <div className="p-3 bg-gradient-to-br from-primary/5 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/10 rounded-xl border border-primary/10">
                   <div className="flex items-center gap-2 mb-2">
                     <Sparkles className="h-3 w-3 text-primary" />
                     <span className="text-[10px] font-bold text-primary uppercase">Core Tone</span>
                   </div>
                   <div className="text-sm font-bold capitalize">{state.data.personality || <span className="text-zinc-400 font-normal">TBD</span>}</div>
                </div>
              </div>

              {step === 'review' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-6"
                >
                  <Button 
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    className="w-full h-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/25 relative overflow-hidden group font-bold"
                  >
                    <AnimatePresence mode="wait">
                      {isLaunching ? (
                        <motion.div key="launching" className="flex items-center gap-2">
                           <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Initializing...
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
