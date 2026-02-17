import { createFileRoute } from '@tanstack/react-router'
import { Bot, Phone, Settings2, Loader2, PhoneOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  const { currentAgent, updateAgent, fetchAgents } = useAgentStore()
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
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{currentAgent.name}</h1>
                <p className="text-sm text-muted-foreground">{currentAgent.businessDescription}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn("gap-2", showSettings && "bg-accent")}
            >
              <Settings2 className="w-4 h-4" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Settings Card */}
            {showSettings && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agent Configuration</CardTitle>
                  <CardDescription>Customize voice and greeting settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <Label htmlFor="voice" className="text-sm font-medium">Voice</Label>
                      <Select
                        value={tempConfig.voice}
                        onValueChange={(value) => setTempConfig({ ...tempConfig, voice: value })}
                      >
                        <SelectTrigger id="voice">
                          <SelectValue>
                            <div className="flex items-center gap-2.5">
                              <div className={cn("w-2 h-2 rounded-full", selectedVoice.color)} />
                              <span className="font-medium">{selectedVoice.label}</span>
                              <span className="text-muted-foreground">• {selectedVoice.description}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {voiceOptions.map((voice) => (
                            <SelectItem key={voice.value} value={voice.value}>
                              <div className="flex items-center gap-2.5">
                                <div className={cn("w-2 h-2 rounded-full", voice.color)} />
                                <div>
                                  <div className="font-medium">{voice.label}</div>
                                  <div className="text-xs text-muted-foreground">{voice.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="greeting" className="text-sm font-medium">Greeting Message</Label>
                      <Input
                        id="greeting"
                        value={tempConfig.greeting}
                        onChange={(e) => setTempConfig({ ...tempConfig, greeting: e.target.value })}
                        placeholder="Hi, how can I help you today?"
                      />
                    </div>
                  </div>

                  {(hasUnsavedChanges || isSaving) && (
                    <div className="flex items-center justify-between pt-5 border-t">
                      <span className="text-sm text-muted-foreground">
                        {hasUnsavedChanges && !isSaving && 'You have unsaved changes'}
                      </span>
                      <Button
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Phone Call Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Make a Call</CardTitle>
                <CardDescription>Enter a phone number to start an AI-powered call</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Phone Input */}
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="flex gap-3">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={phoneNumberDisplay}
                      onChange={handlePhoneChange}
                      className={cn(
                        "h-11 flex-1",
                         !isValidUzbekNumber && phoneNumberDisplay.length > 5 && "border-amber-500 focus-visible:ring-amber-500/20"
                      )}
                    />
                    <Button
                      onClick={handleMakeCall}
                      disabled={!isValidUzbekNumber || isCalling}
                      className="h-11 px-6"
                    >
                      {isCalling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Calling...
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          Call Now
                        </>
                      )}
                    </Button>
                  </div>
                  {!isValidUzbekNumber && phoneNumberDisplay.length > 5 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Please enter a valid Uzbekistan phone number (12 digits)
                    </p>
                  )}
                </div>

                {/* Status Messages */}
                {callError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-destructive">Call Failed</p>
                        <p className="text-xs text-destructive/80">{callError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeCallSid && !isCalling && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">Call Initiated Successfully</p>
                          <p className="text-xs text-green-600/80 dark:text-green-500/80 font-mono">ID: {activeCallSid}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={resetCall}
                        className="shrink-0 h-8"
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Call Details */}
                <div className="space-y-5">
                  <h4 className="text-sm font-medium text-foreground/90">Call Details (Optional)</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <Label htmlFor="customerName" className="text-sm">Customer Name</Label>
                      <Input
                        id="customerName"
                        placeholder="e.g. John Doe"
                        value={callDetails.customerName}
                        onChange={(e) => setCallDetails({ ...callDetails, customerName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="purpose" className="text-sm">Call Purpose</Label>
                      <Input
                        id="purpose"
                        placeholder="e.g. Sales follow-up"
                        value={callDetails.purpose}
                        onChange={(e) => setCallDetails({ ...callDetails, purpose: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="notes" className="text-sm">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add context or special instructions for this call..."
                      value={callDetails.notes}
                      onChange={(e) => setCallDetails({ ...callDetails, notes: e.target.value })}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agent Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Voice</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", selectedVoice.color)} />
                    <span className="text-sm font-medium">{selectedVoice.label}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <span className="text-sm font-medium capitalize">
                    {currentAgent.language === 'en' ? 'English' : currentAgent.language}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {currentAgent.type}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={activeCallSid ? "default" : "secondary"} className="gap-1.5 text-xs">
                    <div className={cn("w-1.5 h-1.5 rounded-full", activeCallSid ? "bg-white animate-pulse" : "bg-green-500")} />
                    {activeCallSid ? 'On Call' : 'Ready'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage Stats</CardTitle>
                <CardDescription>Track your calling activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums">0</span>
                    <span className="text-sm text-muted-foreground">calls</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total calls made</p>
                </div>
                
                <Separator />
                
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums">0</span>
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total talk time</p>
                </div>
              </CardContent>
            </Card>

            {/* Credits Info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Available Credits</span>
                  <span className="text-2xl font-bold tabular-nums">{credits}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Each call uses 1 credit
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/')({
  component: PlaygroundPage,
})
