import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useAgentStore } from '@/features/agents/store'
import { Sparkles, Save, Loader2, Bot, Briefcase, Phone, Brain } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateSystemPrompt } from '@/lib/ai/gemini'

function AgentSettingsPage() {
  const { agents, currentAgent, updateAgent, fetchAgents } = useAgentStore()
  const { getToken } = useAuth()
  const { agentId } = Route.useParams()

  const [formData, setFormData] = useState(currentAgent || {})
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  useEffect(() => {
    const loadAgent = async () => {
      const token = await getToken()
      if (token) {
        await fetchAgents(token)
        const agent = agents.find(a => a.id === agentId)
        if (agent) {
          setFormData(agent)
        }
      }
    }
    if (!currentAgent || currentAgent.id !== agentId) {
      loadAgent()
    } else {
      setFormData(currentAgent)
    }
  }, [agentId])

  useEffect(() => {
    if (currentAgent) {
      const changes = Object.keys(formData).some(key => formData[key] !== currentAgent[key])
      setHasChanges(changes)
    }
  }, [formData, currentAgent])

  const handleSave = async () => {
    if (!hasChanges || !currentAgent) return
    setIsSaving(true)
    try {
      const token = await getToken()
      if (token) {
        await updateAgent(agentId, formData, token)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Failed to update agent:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegeneratePrompt = async () => {
    setIsRegenerating(true)
    setGenerationError(null)
    try {
      const newPrompt = await generateSystemPrompt({
        name: formData.name,
        description: formData.businessDescription || '',
        personality: formData.type
      })
      setFormData({ ...formData, systemPrompt: newPrompt })
      setHasChanges(true)
    } catch (error: any) {
      console.error('Failed to regenerate prompt:', error)
      setGenerationError(error?.message || 'Failed to generate system prompt')
    } finally {
      setIsRegenerating(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  if (!currentAgent) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your agent
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Basics */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span className="text-sm font-medium">Basics</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Agent name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inbound support">Inbound Support</SelectItem>
                <SelectItem value="outbound sales">Outbound Sales</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="appointment setter">Appointment Setter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={formData.language} onValueChange={(value) => updateField('language', value)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Uzbek">Uzbek</SelectItem>
                <SelectItem value="Russian">Russian</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select value={formData.voice} onValueChange={(value) => updateField('voice', value)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Sarah Friendly">Sarah Friendly</SelectItem>
                <SelectItem value="Mike Professional">Mike Professional</SelectItem>
                <SelectItem value="Atlas Deep">Atlas Deep</SelectItem>
                <SelectItem value="Nova Energetic">Nova Energetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="greeting">Greeting</Label>
          <Textarea
            id="greeting"
            value={formData.greeting || ''}
            onChange={(e) => updateField('greeting', e.target.value)}
            placeholder="Hi, this is {name} from {company}. How can I help?"
            rows={2}
          />
        </div>
      </section>

      {/* Business */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span className="text-sm font-medium">Business</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Company</Label>
            <Input
              id="businessName"
              value={formData.businessName || ''}
              onChange={(e) => updateField('businessName', e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessIndustry">Industry</Label>
            <Select value={formData.businessIndustry} onValueChange={(value) => updateField('businessIndustry', value)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Solar">Solar</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessDescription">Description</Label>
          <Textarea
            id="businessDescription"
            value={formData.businessDescription || ''}
            onChange={(e) => updateField('businessDescription', e.target.value)}
            placeholder="What does your business do?"
            rows={2}
          />
        </div>
      </section>

      {/* Behavior */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">Behavior</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryGoal">Goal</Label>
            <Select value={formData.primaryGoal} onValueChange={(value) => updateField('primaryGoal', value)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Information/Support">Information/Support</SelectItem>
                <SelectItem value="Lead Qualification">Lead Qualification</SelectItem>
                <SelectItem value="Appointment Booking">Appointment Booking</SelectItem>
                <SelectItem value="Direct Transfer">Direct Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(formData.primaryGoal === 'Direct Transfer' || formData.phoneTransfer) && (
            <div className="space-y-2">
              <Label htmlFor="phoneTransfer">Transfer Number</Label>
              <Input
                id="phoneTransfer"
                value={formData.phoneTransfer || ''}
                onChange={(e) => updateField('phoneTransfer', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          )}
        </div>
      </section>

      {/* System Prompt */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">System Prompt</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegeneratePrompt}
            disabled={isRegenerating || !formData.name || !formData.businessDescription || !formData.type}
          >
            {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate
          </Button>
        </div>
        {generationError && (
          <p className="text-sm text-destructive">{generationError}</p>
        )}
        <Textarea
          value={formData.systemPrompt || ''}
          onChange={(e) => updateField('systemPrompt', e.target.value)}
          placeholder="Define how your agent thinks and responds..."
          rows={8}
          className="font-mono text-sm"
        />
      </section>

      {/* Knowledge */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Brain className="h-4 w-4" />
          <span className="text-sm font-medium">Knowledge</span>
        </div>
        <Textarea
          value={formData.knowledgeText || ''}
          onChange={(e) => updateField('knowledgeText', e.target.value)}
          placeholder="Add FAQs, product info, or any context the agent should know..."
          rows={6}
        />
      </section>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/settings')({
  component: AgentSettingsPage,
})
