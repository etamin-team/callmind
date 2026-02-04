import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useAgentStore } from '@/features/agents/store'
import { Bot, Sparkles, Save, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
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

  // Fetch current agent data on mount
  useEffect(() => {
    const loadAgent = async () => {
      const token = await getToken()
      if (token) {
        await fetchAgents(token)
        // Find the current agent from the list
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

  // Track changes
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
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Agent Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your agent's behavior, voice, and knowledge base.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Settings Form */}
      <Accordion
        type="multiple"
        defaultValue={['identity', 'prompt']}
        className="space-y-4"
      >

        {/* Identity & Voice */}
        <AccordionItem value="identity" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold">Identity & Voice</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="My Agent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound support">Inbound Support</SelectItem>
                    <SelectItem value="outbound sales">Outbound Sales</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="appointment setter">Appointment Setter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <Select value={formData.language} onValueChange={(value) => updateField('language', value)}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
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
                  <SelectTrigger id="voice">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
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
              <Label htmlFor="greeting">Greeting Message</Label>
              <Textarea
                id="greeting"
                value={formData.greeting || ''}
                onChange={(e) => updateField('greeting', e.target.value)}
                placeholder="Hi, this is {agent name} from {company name}, how can I help you today?"
                rows={2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Business Context */}
        <AccordionItem value="business" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold">Business Context</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName || ''}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder="Acme Corporation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessIndustry">Industry</Label>
              <Select value={formData.businessIndustry} onValueChange={(value) => updateField('businessIndustry', value)}>
                <SelectTrigger id="businessIndustry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription || ''}
                onChange={(e) => updateField('businessDescription', e.target.value)}
                placeholder="Describe what your business does..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCallers">Target Callers</Label>
              <Select value={formData.targetCallers} onValueChange={(value) => updateField('targetCallers', value)}>
                <SelectTrigger id="targetCallers">
                  <SelectValue placeholder="Who will call?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Leads">New Leads</SelectItem>
                  <SelectItem value="Existing Customers">Existing Customers</SelectItem>
                  <SelectItem value="Partners">Partners</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Call Behavior */}
        <AccordionItem value="behavior" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold">Call Behavior</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryGoal">Primary Goal</Label>
              <Select value={formData.primaryGoal} onValueChange={(value) => updateField('primaryGoal', value)}>
                <SelectTrigger id="primaryGoal">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
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
                <Label htmlFor="phoneTransfer">Transfer Phone Number</Label>
                <Input
                  id="phoneTransfer"
                  value={formData.phoneTransfer || ''}
                  onChange={(e) => updateField('phoneTransfer', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="objectionHandling">Objection Handling</Label>
              <Textarea
                id="objectionHandling"
                value={formData.objectionHandling || ''}
                onChange={(e) => updateField('objectionHandling', e.target.value)}
                placeholder="How should the agent handle objections?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Data to Collect</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Name', 'Email', 'Phone', 'Company', 'Budget', 'Timeline'].map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={formData.collectFields?.includes(field)}
                      onCheckedChange={(checked) => {
                        const current = formData.collectFields || []
                        const updated = checked
                          ? [...current, field]
                          : current.filter(f => f !== field)
                        updateField('collectFields', updated)
                      }}
                    />
                    <Label htmlFor={field} className="text-sm font-normal">{field}</Label>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* System Prompt */}
        <AccordionItem value="prompt" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">System Prompt</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                This defines how your agent behaves. You can edit it manually or regenerate with AI.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegeneratePrompt}
                disabled={isRegenerating || !formData.name || !formData.businessDescription || !formData.type}
                className="gap-2 whitespace-nowrap"
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Regenerate with AI
              </Button>
            </div>

            {generationError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">❌ Generation Error</p>
                <p className="text-xs text-destructive/80 mt-1">{generationError}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Check the browser console (F12) for more details. Make sure VITE_GEMINI_API_KEY is set in .env.local
                </p>
              </div>
            )}

            {(!formData.name || !formData.businessDescription || !formData.type) && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  ⚠️ To generate a system prompt, please fill in the Agent Name, Type, and Business Description fields in the sections above.
                </p>
              </div>
            )}

            <Textarea
              value={formData.systemPrompt || ''}
              onChange={(e) => updateField('systemPrompt', e.target.value)}
              placeholder="Agent's system prompt will appear here... You can also write it manually or use the AI generation button above."
              rows={12}
              className="font-mono text-sm"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Knowledge Base */}
        <AccordionItem value="knowledge" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold">Knowledge Base</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="knowledgeText">Knowledge Content</Label>
              <Textarea
                id="knowledgeText"
                value={formData.knowledgeText || ''}
                onChange={(e) => updateField('knowledgeText', e.target.value)}
                placeholder="Add knowledge base content, FAQs, product information..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                This information will be used to answer customer questions.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/settings')({
  component: AgentSettingsPage,
})
