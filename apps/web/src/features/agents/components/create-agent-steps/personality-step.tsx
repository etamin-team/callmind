import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Mic, Settings, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface CreateAgentData {
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
}

interface PersonalityStepProps {
  data: CreateAgentData
  onChange: (data: CreateAgentData) => void
}

export default function PersonalityStep({ data, onChange }: PersonalityStepProps) {
  const personalities = [
    { value: 'professional', label: 'Professional', description: 'Formal, respectful, and business-oriented' },
    { value: 'friendly', label: 'Friendly', description: 'Warm, approachable, and conversational' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic, positive, and engaging' },
    { value: 'analytical', label: 'Analytical', description: 'Logical, detailed, and systematic' },
    { value: 'creative', label: 'Creative', description: 'Imaginative, innovative, and artistic' },
    { value: 'empathetic', label: 'Empathetic', description: 'Understanding, caring, and supportive' }
  ]

  const voices = [
    { value: 'professional', label: 'Professional', description: 'Clear, measured, and authoritative' },
    { value: 'friendly', label: 'Friendly', description: 'Warm, inviting, and casual' },
    { value: 'energetic', label: 'Energetic', description: 'Upbeat, dynamic, and lively' },
    { value: 'calm', label: 'Calm', description: 'Soothing, gentle, and reassuring' },
    { value: 'confident', label: 'Confident', description: 'Assured, strong, and decisive' }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Define Agent Personality</h2>
        <p className="text-muted-foreground">Customize how your agent communicates and interacts</p>
      </div>

      <div className="grid gap-6">
        {/* Personality Selection */}
        <div className="grid gap-3">
          <Label>Personality Type</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {personalities.map((personality) => (
              <Card 
                key={personality.value}
                className={`cursor-pointer transition-colors ${
                  data.personality === personality.value 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onChange({ ...data, personality: personality.value })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      data.personality === personality.value 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {data.personality === personality.value && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{personality.label}</h4>
                      <p className="text-sm text-muted-foreground">{personality.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="grid gap-3">
          <Label>Voice Style</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {voices.map((voice) => (
              <Card 
                key={voice.value}
                className={`cursor-pointer transition-colors ${
                  data.voice === voice.value 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onChange({ ...data, voice: voice.value })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Mic className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{voice.label}</h4>
                      <p className="text-sm text-muted-foreground">{voice.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Parameters */}
        <div className="grid gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Temperature (Creativity)</Label>
              <span className="text-sm text-muted-foreground">{data.temperature}</span>
            </div>
            <Slider
              value={[data.temperature]}
              onValueChange={([value]) => onChange({ ...data, temperature: value })}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              0 = Focused & Deterministic | 1 = Creative & Variable
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Max Tokens</Label>
              <span className="text-sm text-muted-foreground">{data.maxTokens}</span>
            </div>
            <Slider
              value={[data.maxTokens]}
              onValueChange={([value]) => onChange({ ...data, maxTokens: value })}
              max={4000}
              min={500}
              step={100}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum response length in tokens
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Escalation Threshold</Label>
              <span className="text-sm text-muted-foreground">{(data.escalationThreshold * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={[data.escalationThreshold]}
              onValueChange={([value]) => onChange({ ...data, escalationThreshold: value })}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              When to escalate to human agent
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
