import { createFileRoute } from '@tanstack/react-router'
import { Bot, Phone, Settings2, Loader2, PhoneCall, Clock, Mic, MessageSquare, Sparkles, Activity } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAgentStore } from '@/features/agents/store'
import { useUserStore } from '@/features/users/store'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Uzbekistan phone number formatting
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `+${digits}`
  if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`
  if (digits.length <= 8) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
  if (digits.length <= 10) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  // Handle 12 digit Uzbekistan numbers: +998 XX XXX XX XX
  if (digits.length >= 12) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  // For numbers between 10-12 digits, show all available digits
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
}

const parsePhoneNumber = (formatted: string): string => {
  return formatted.replace(/\D/g, '')
}

const voiceOptions = [
  { value: 'Sarah Friendly', label: 'Sarah', description: 'Friendly & warm', color: 'bg-pink-500' },
  { value: 'Mike Professional', label: 'Mike', description: 'Professional & calm', color: 'bg-blue-500' },
  { value: 'Atlas Deep', label: 'Atlas', description: 'Deep & authoritative', color: 'bg-purple-500' },
  { value: 'Nova Energetic', label: 'Nova', description: 'Energetic & upbeat', color: 'bg-orange-500' },
]

function PlaygroundPage() {
  const { agents, currentAgent, updateAgent, fetchAgents } = useAgentStore()
  const { getToken, userId } = useAuth()
  const { agentId } = Route.useParams()
  const { credits, fetchUserCredits, decrementCreditsOnServer } = useUserStore()

  // Call details state
  const [phoneNumberDisplay, setPhoneNumberDisplay] = useState('+998 ')
  const [callDetails, setCallDetails] = useState({
    customerName: '',
    purpose: '',
    notes: ''
  })
  const [isCalling, setIsCalling] = useState(false)
  const [activeCallSid, setActiveCallSid] = useState<string | null>(null)
  const [callError, setCallError] = useState<string | null>(null)

  // Validate Uzbek phone number (12 digits with country code)
  const isValidUzbekNumber = useMemo(() => {
    const digits = parsePhoneNumber(phoneNumberDisplay)
    return digits.length === 12 && digits.startsWith('998')
  }, [phoneNumberDisplay])

  // Local configuration state (collapsed)
  const [showSettings, setShowSettings] = useState(false)
  const [tempConfig, setTempConfig] = useState({
    voice: currentAgent?.voice || 'sarah',
    greeting: currentAgent?.greeting || 'Hi, how can I help you today?'
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize config from current agent
  useEffect(() => {
    if (currentAgent && currentAgent.id === agentId) {
      setTempConfig({
        voice: currentAgent.voice || 'sarah',
        greeting: currentAgent.greeting || 'Hi, how can I help you today?'
      })
    }
  }, [currentAgent, agentId])

  // Load agent if not available
  useEffect(() => {
    const loadAgent = async () => {
      const token = await getToken()
      if (token) {
        await fetchAgents(token)
        // Also fetch user credits
        if (userId) {
          await fetchUserCredits(userId, token)
        }
      }
    }
    if (!currentAgent || currentAgent.id !== agentId) {
      loadAgent()
    }
  }, [agentId])

  // Track changes
  useEffect(() => {
    if (currentAgent) {
      const voiceChanged = tempConfig.voice !== currentAgent.voice
      const greetingChanged = tempConfig.greeting !== currentAgent.greeting
      setHasUnsavedChanges(voiceChanged || greetingChanged)
    }
  }, [tempConfig, currentAgent])

  const handleSaveConfig = async () => {
    if (!hasUnsavedChanges || !currentAgent) return

    setIsSaving(true)
    try {
      const token = await getToken()
      if (token) {
        await updateAgent(agentId, {
          voice: tempConfig.voice,
          greeting: tempConfig.greeting
        }, token)
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error('Failed to save config:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleMakeCall = async () => {
    if (!isValidUzbekNumber || !currentAgent) return

    // Check if user has enough credits
    if (credits < 1) {
      setCallError('Insufficient credits. Please upgrade your plan.')
      return
    }

    setIsCalling(true)
    setCallError(null)
    setActiveCallSid(null)

    try {
      // Build prompt from agent's business description and notes
      const prompt = currentAgent.businessDescription || 'You are a helpful AI assistant.'
      const enhancedPrompt = callDetails.notes
        ? `${prompt}\n\nAdditional context for this call: ${callDetails.notes}\n\nCustomer: ${callDetails.customerName || 'N/A'}\nPurpose: ${callDetails.purpose || 'General inquiry'}`
        : prompt

      // Map voice name to voice ID
      const voiceIdMap: Record<string, string> = {
        'Sarah Friendly': 'EXAVITQu4vr4xnSDxMaL', // Sarah
        'Mike Professional': 'TX3LPaxmHKxFdv7VOQHJ', // Liam
        'Atlas Deep': 'nPczCjzI2devNBz1zQrb', // Brian
        'Nova Energetic': 'Xb7hH8MSUJpSbSDYk0k2', // Alice
      }

      const voiceId = voiceIdMap[tempConfig.voice] || voiceIdMap['Mike Professional']

      const requestBody = {
        phone: `+${parsePhoneNumber(phoneNumberDisplay)}`,
        prompt: enhancedPrompt,
        greetingPrompt: tempConfig.greeting || undefined,
        voiceConfig: {
          voiceId: voiceId,
          stability: 0.5,
          similarityBoost: 0.5
        },
        maxDuration: 150,
        refusalPhrases: ["kerak emas", "olmayman", "hohaz yo'q"],
        goodbyeMessage: "Rahmat vaqtingiz uchun!"
      }

      console.log('Initiating call with payload:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('https://callmind.talabam.com/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data.success && data.callSid) {
        setActiveCallSid(data.callSid)
        console.log('Call initiated successfully:', data.callSid)

        // Decrement credits after successful call
        const token = await getToken()
        if (token && userId) {
          const success = await decrementCreditsOnServer(userId, 1, token)
          if (!success) {
            console.error('Failed to decrement credits')
          }
        }
      } else {
        throw new Error('Failed to initiate call')
      }
    } catch (error) {
      console.error('Failed to make call:', error)
      setCallError(error instanceof Error ? error.message : 'Failed to initiate call')
    } finally {
      setIsCalling(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumberDisplay(formatted)
  }

  const resetCall = () => {
    setActiveCallSid(null)
    setCallError(null)
    setPhoneNumberDisplay('+998 ')
    setCallDetails({
      customerName: '',
      purpose: '',
      notes: ''
    })
  }

  const selectedVoice = voiceOptions.find(v => v.value === tempConfig.voice) || voiceOptions[0]

  if (!currentAgent) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{currentAgent.name}</h1>
                <p className="text-xs text-muted-foreground">{currentAgent.businessDescription}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 rounded-lg border p-6">
            <h3 className="text-sm font-semibold mb-4">Agent Configuration</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Voice</Label>
                <Select
                  value={tempConfig.voice}
                  onValueChange={(value) => setTempConfig({ ...tempConfig, voice: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", selectedVoice.color)} />
                        <span className="text-sm">{selectedVoice.label}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {voiceOptions.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", voice.color)} />
                          <span>{voice.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Greeting</Label>
                <Input
                  value={tempConfig.greeting}
                  onChange={(e) => setTempConfig({ ...tempConfig, greeting: e.target.value })}
                  placeholder="Hi, how can I help you today?"
                  className="h-10"
                />
              </div>
            </div>

            {(hasUnsavedChanges || isSaving) && (
              <div className="mt-4 flex items-center gap-3 pt-4 border-t">
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  size="sm"
                  className="h-8 text-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                {hasUnsavedChanges && !isSaving && (
                  <span className="text-xs text-amber-600">Unsaved changes</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Call Interface - Interesting Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Phone & Call */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-semibold mb-2">Make a Call</h2>
              <p className="text-muted-foreground">Start a conversation with your AI agent</p>
            </div>

            {/* Phone Input - Hero */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <p className="text-xs text-muted-foreground mt-1">Enter Uzbekistan number (+998)</p>
              </div>
              <div className="flex gap-3">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phoneNumberDisplay}
                  onChange={handlePhoneChange}
                  className={cn(
                    "h-14 text-lg",
                    !isValidUzbekNumber && phoneNumberDisplay.length > 5 && "border-amber-500"
                  )}
                  autoFocus
                />
                <Button
                  onClick={handleMakeCall}
                  disabled={!isValidUzbekNumber || isCalling}
                  className="h-14 px-8 text-base"
                >
                  {isCalling ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Calling...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Call
                    </>
                  )}
                </Button>
              </div>

              {/* Call Status Messages */}
              {callError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{callError}</p>
                </div>
              )}

              {activeCallSid && !isCalling && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-sm font-medium text-green-600">Call initiated successfully!</p>
                      </div>
                      <p className="text-xs text-green-600">Call ID: {activeCallSid}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetCall}
                      className="h-8 text-xs"
                    >
                      New Call
                    </Button>
                  </div>
                </div>
              )}

              {!isValidUzbekNumber && phoneNumberDisplay.length > 5 && (
                <p className="text-xs text-amber-600">
                  Please enter a valid Uzbekistan phone number
                </p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="space-y-5">
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium mb-4">Call Details</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="John Doe"
                    value={callDetails.customerName}
                    onChange={(e) => setCallDetails({ ...callDetails, customerName: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm">Purpose</Label>
                  <Input
                    id="purpose"
                    placeholder="Sales follow-up"
                    value={callDetails.purpose}
                    onChange={(e) => setCallDetails({ ...callDetails, purpose: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional context for this call..."
                  value={callDetails.notes}
                  onChange={(e) => setCallDetails({ ...callDetails, notes: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Agent Status Card */}
            <div className="rounded-lg border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{currentAgent.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentAgent.type}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Voice</span>
                  <span className="font-medium">{selectedVoice.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium">{currentAgent.language === 'en' ? 'English' : currentAgent.language}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  {activeCallSid ? (
                    <span className="font-medium text-green-600">On Call</span>
                  ) : (
                    <span className="font-medium text-green-600">Active</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-medium mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Total Calls</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0m</p>
                  <p className="text-xs text-muted-foreground">Talk Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/')({
  component: PlaygroundPage,
})
