import { createFileRoute } from '@tanstack/react-router'
import {
  Bot,
  Phone,
  Settings2,
  Loader2,
  PhoneOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgentStore } from '@/features/agents/store'
import { useUserStore } from '@/features/users/store'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { env } from '@/env'

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `+${digits}`
  if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`
  if (digits.length <= 8)
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
  if (digits.length <= 10)
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  if (digits.length >= 12)
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
}

const parsePhoneNumber = (formatted: string): string => {
  return formatted.replace(/\D/g, '')
}

const voiceOptions = [
  {
    value: 'Sarah Friendly',
    label: 'Sarah',
    description: 'Friendly & warm',
    color: 'bg-pink-500',
  },
  {
    value: 'Mike Professional',
    label: 'Mike',
    description: 'Professional & calm',
    color: 'bg-blue-500',
  },
  {
    value: 'Atlas Deep',
    label: 'Atlas',
    description: 'Deep & authoritative',
    color: 'bg-purple-500',
  },
  {
    value: 'Nova Energetic',
    label: 'Nova',
    description: 'Energetic & upbeat',
    color: 'bg-orange-500',
  },
]

function PlaygroundPage() {
  const { currentAgent, updateAgent, fetchAgents } = useAgentStore()
  const { getToken, userId } = useAuth()
  const { agentId } = Route.useParams()
  const { credits, fetchUserCredits, setCredits } = useUserStore()
  const resolvedAgentId = currentAgent?.id

  const [phoneNumberDisplay, setPhoneNumberDisplay] = useState('+998 ')
  const [callDetails, setCallDetails] = useState({
    customerName: '',
    purpose: '',
    notes: '',
  })
  const [isCalling, setIsCalling] = useState(false)
  const [activeCallSid, setActiveCallSid] = useState<string | null>(null)
  const [callError, setCallError] = useState<string | null>(null)

  const isValidUzbekNumber = useMemo(() => {
    const digits = parsePhoneNumber(phoneNumberDisplay)
    return digits.length === 12 && digits.startsWith('998')
  }, [phoneNumberDisplay])

  const [showSettings, setShowSettings] = useState(false)
  const [tempConfig, setTempConfig] = useState({
    voice: currentAgent?.voice || 'sarah',
    greeting: currentAgent?.greeting || 'Hi, how can I help you today?',
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (resolvedAgentId && currentAgent?.id === resolvedAgentId) {
      setTempConfig({
        voice: currentAgent?.voice || 'sarah',
        greeting: currentAgent?.greeting || 'Hi, how can I help you today?',
      })
    }
  }, [currentAgent, resolvedAgentId])

  useEffect(() => {
    const loadAgent = async () => {
      const token = await getToken()
      if (token) {
        await fetchAgents(token)
        if (userId) {
          await fetchUserCredits(userId, token)
        }
      }
    }
    if (!resolvedAgentId || currentAgent?.id !== resolvedAgentId) {
      loadAgent()
    }
  }, [resolvedAgentId, agentId])

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
        await updateAgent(
          resolvedAgentId || agentId,
          {
            voice: tempConfig.voice,
            greeting: tempConfig.greeting,
          },
          token,
        )
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

    const token = await getToken()
    if (!token || !userId) {
      setCallError('Authentication required')
      return
    }

    setIsCalling(true)
    setCallError(null)
    setActiveCallSid(null)

    try {
      const prompt =
        currentAgent.businessDescription || 'You are a helpful AI assistant.'
      const enhancedPrompt = callDetails.notes
        ? `${prompt}\n\nAdditional context for this call: ${callDetails.notes}\n\nCustomer: ${callDetails.customerName || 'N/A'}\nPurpose: ${callDetails.purpose || 'General inquiry'}`
        : prompt

      const voiceIdMap: Record<string, string> = {
        'Sarah Friendly': 'EXAVITQu4vr4xnSDxMaL',
        'Mike Professional': 'TX3LPaxmHKxFdv7VOQHJ',
        'Atlas Deep': 'nPczCjzI2devNBz1zQrb',
        'Nova Energetic': 'Xb7hH8MSUJpSbSDYk0k2',
      }

      const voiceId =
        voiceIdMap[tempConfig.voice] || voiceIdMap['Mike Professional']

      const requestBody = {
        phone: `+${parsePhoneNumber(phoneNumberDisplay)}`,
        prompt: enhancedPrompt,
        greetingPrompt: tempConfig.greeting || undefined,
        voiceConfig: {
          voiceId: voiceId,
          stability: 0.5,
          similarityBoost: 0.5,
        },
        maxDuration: 150,
        refusalPhrases: ['kerak emas', 'olmayman', "hohaz yo'q"],
        goodbyeMessage: 'Rahmat vaqtingiz uchun!',
      }

      const response = await fetch(`${env.VITE_API_URL}/api/calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...requestBody,
          agentId: resolvedAgentId || agentId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.callSid) {
        if (typeof data.creditsRemaining === 'number') {
          setCredits(data.creditsRemaining)
        }
        setActiveCallSid(data.callSid)
      } else {
        throw new Error(data.error || data.message || 'Failed to initiate call')
      }
    } catch (error) {
      console.error('Failed to make call:', error)

      setCallError(
        error instanceof Error ? error.message : 'Failed to initiate call',
      )
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
      notes: '',
    })
  }

  const selectedVoice =
    voiceOptions.find((v) => v.value === tempConfig.voice) || voiceOptions[0]

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
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-semibold">{currentAgent.name}</h1>
                <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                  {currentAgent.businessDescription}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn('gap-2', showSettings && 'bg-accent')}
            >
              <Settings2 className="w-4 h-4" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Settings Panel */}
            {showSettings && (
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">
                    Agent Configuration
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Customize voice and greeting settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="voice" className="text-xs font-medium">
                        Voice
                      </Label>
                      <Select
                        value={tempConfig.voice}
                        onValueChange={(value) =>
                          setTempConfig({ ...tempConfig, voice: value })
                        }
                      >
                        <SelectTrigger id="voice" className="h-9">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  selectedVoice.color,
                                )}
                              />
                              <span className="text-sm font-medium">
                                {selectedVoice.label}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {voiceOptions.map((voice) => (
                            <SelectItem key={voice.value} value={voice.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    'w-2 h-2 rounded-full',
                                    voice.color,
                                  )}
                                />
                                <div>
                                  <div className="font-medium text-sm">
                                    {voice.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {voice.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="greeting" className="text-xs font-medium">
                        Greeting Message
                      </Label>
                      <Input
                        id="greeting"
                        value={tempConfig.greeting}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            greeting: e.target.value,
                          })
                        }
                        placeholder="Hi, how can I help you today?"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  {(hasUnsavedChanges || isSaving) && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-muted-foreground">
                        {hasUnsavedChanges &&
                          !isSaving &&
                          'You have unsaved changes'}
                      </span>
                      <Button
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
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

            {/* Main Call Card */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Make a Call
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enter a phone number to start an AI-powered call
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Phone Input Section */}
                <div className="space-y-3">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Phone Number
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
                        +998
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="90 123 45 67"
                        value={phoneNumberDisplay.replace('+998', '').trim()}
                        onChange={(e) =>
                          handlePhoneChange({
                            target: { value: '+998 ' + e.target.value },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                        className={cn(
                          'h-12 pl-14 text-lg font-medium tracking-wide',
                          !isValidUzbekNumber &&
                            phoneNumberDisplay.length > 5 &&
                            'border-amber-500 focus-visible:ring-amber-500/20',
                        )}
                      />
                    </div>
                    <Button
                      onClick={handleMakeCall}
                      disabled={!isValidUzbekNumber || isCalling}
                      className="h-12 px-8 gap-2"
                      size="lg"
                    >
                      {isCalling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Calling...
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          Call
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

                {/* Error Message */}
                {callError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Call Failed
                        </p>
                        <p className="text-xs text-destructive/80 mt-0.5">
                          {callError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {activeCallSid && !isCalling && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            Call Initiated Successfully
                          </p>
                          <p className="text-xs text-green-600/80 dark:text-green-500/80 font-mono mt-0.5">
                            ID: {activeCallSid}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={resetCall}
                        className="shrink-0 h-8 text-xs"
                      >
                        <PhoneOff className="w-3.5 h-3.5 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Call Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-muted-foreground/30" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Call Details (Optional)
                    </h4>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="customerName"
                          className="text-xs font-medium"
                        >
                          Customer Name
                        </Label>
                        <Input
                          id="customerName"
                          placeholder="e.g. John Doe"
                          value={callDetails.customerName}
                          onChange={(e) =>
                            setCallDetails({
                              ...callDetails,
                              customerName: e.target.value,
                            })
                          }
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="purpose"
                          className="text-xs font-medium"
                        >
                          Call Purpose
                        </Label>
                        <Input
                          id="purpose"
                          placeholder="e.g. Sales follow-up"
                          value={callDetails.purpose}
                          onChange={(e) =>
                            setCallDetails({
                              ...callDetails,
                              purpose: e.target.value,
                            })
                          }
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-xs font-medium">
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Add context or special instructions for this call..."
                        value={callDetails.notes}
                        onChange={(e) =>
                          setCallDetails({
                            ...callDetails,
                            notes: e.target.value,
                          })
                        }
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Agent Info */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Agent Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between py-2.5 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Voice</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        selectedVoice.color,
                      )}
                    />
                    <span className="text-sm font-medium">
                      {selectedVoice.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">
                    Language
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {currentAgent.language === 'en'
                      ? 'English'
                      : currentAgent.language}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge
                    variant="secondary"
                    className="capitalize text-xs font-medium"
                  >
                    {currentAgent.type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={activeCallSid ? 'default' : 'outline'}
                    className={cn(
                      'gap-1.5 text-xs font-medium',
                      !activeCallSid &&
                        'border-green-500/30 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400',
                    )}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        activeCallSid
                          ? 'bg-white animate-pulse'
                          : 'bg-green-500',
                      )}
                    />
                    {activeCallSid ? 'On Call' : 'Ready'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Credits Card - Highlighted */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Available Credits
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Each call uses 1 credit
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-bold tabular-nums text-primary">
                      {credits}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Usage Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold tabular-nums">0</p>
                    <p className="text-xs text-muted-foreground">
                      Total calls made
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold tabular-nums">0</p>
                    <p className="text-xs text-muted-foreground">
                      Minutes used
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  </div>
                </div>
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
