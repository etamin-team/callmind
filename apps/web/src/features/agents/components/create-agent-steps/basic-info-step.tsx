import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Cpu, Globe, Mic, Settings, Sparkles } from 'lucide-react'
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

interface BasicInfoStepProps {
  data: CreateAgentData
  onChange: (data: CreateAgentData) => void
}

export default function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const [newCapability, setNewCapability] = useState('')

  const addCapability = () => {
    if (newCapability.trim() && !data.capabilities.includes(newCapability.trim())) {
      onChange({
        ...data,
        capabilities: [...data.capabilities, newCapability.trim()]
      })
      setNewCapability('')
    }
  }

  const removeCapability = (capability: string) => {
    onChange({
      ...data,
      capabilities: data.capabilities.filter(c => c !== capability)
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Create Your AI Agent</h2>
        <p className="text-muted-foreground">Let's start with the basic information about your agent</p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Agent Name</Label>
          <Input
            id="name"
            placeholder="e.g., Customer Support Pro"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what your agent does and its main purpose..."
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label>Capabilities</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a capability..."
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCapability()}
            />
            <Button onClick={addCapability} disabled={!newCapability.trim()}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.capabilities.map((capability, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeCapability(capability)}>
                {capability} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={data.model} onValueChange={(value) => onChange({ ...data, model: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Faster)</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Economical)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select value={data.language} onValueChange={(value) => onChange({ ...data, language: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
