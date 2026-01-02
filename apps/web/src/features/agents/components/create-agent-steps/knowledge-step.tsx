import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Database, FileText, Globe, Plus, Trash2 } from 'lucide-react'
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
  capabilities: Array<string>
  knowledgeBase: Array<string>
  escalationThreshold: number
}

interface KnowledgeStepProps {
  data: CreateAgentData
  onChange: (data: CreateAgentData) => void
}

export default function KnowledgeStep({ data, onChange }: KnowledgeStepProps) {
  const [newKnowledgeItem, setNewKnowledgeItem] = useState('')

  const knowledgeSources = [
    { id: 'products', name: 'Product Catalog', icon: '📦', description: 'Product information, pricing, and specifications' },
    { id: 'policies', name: 'Company Policies', icon: '📋', description: 'Return policies, terms of service, and guidelines' },
    { id: 'faq', name: 'FAQ Database', icon: '❓', description: 'Frequently asked questions and answers' },
    { id: 'training', name: 'Training Materials', icon: '📚', description: 'Agent training guides and best practices' },
    { id: 'technical', name: 'Technical Docs', icon: '🔧', description: 'API documentation and technical guides' },
    { id: 'custom', name: 'Custom Knowledge', icon: '📄', description: 'Your own documents and content' }
  ]

  const addKnowledgeItem = () => {
    if (newKnowledgeItem.trim() && !data.knowledgeBase.includes(newKnowledgeItem.trim())) {
      onChange({
        ...data,
        knowledgeBase: [...data.knowledgeBase, newKnowledgeItem.trim()]
      })
      setNewKnowledgeItem('')
    }
  }

  const removeKnowledgeItem = (item: string) => {
    onChange({
      ...data,
      knowledgeBase: data.knowledgeBase.filter(k => k !== item)
    })
  }

  const toggleKnowledgeSource = (sourceId: string) => {
    const source = knowledgeSources.find(s => s.id === sourceId)
    if (source) {
      const isAlreadyIncluded = data.knowledgeBase.includes(source.name)
      if (isAlreadyIncluded) {
        removeKnowledgeItem(source.name)
      } else {
        onChange({
          ...data,
          knowledgeBase: [...data.knowledgeBase, source.name]
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Configure Knowledge Base</h2>
        <p className="text-muted-foreground">Define what information your agent can access</p>
      </div>

      <div className="grid gap-6">
        {/* Predefined Knowledge Sources */}
        <div className="grid gap-3">
          <Label>Knowledge Sources</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {knowledgeSources.map((source) => {
              const isIncluded = data.knowledgeBase.includes(source.name)
              return (
                <Card 
                  key={source.id}
                  className={`cursor-pointer transition-colors ${
                    isIncluded 
                      ? 'ring-2 ring-green-500 bg-green-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleKnowledgeSource(source.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isIncluded 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {isIncluded && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{source.icon}</span>
                          <h4 className="font-medium">{source.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Custom Knowledge Items */}
        <div className="grid gap-3">
          <Label>Custom Knowledge Items</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom knowledge source..."
              value={newKnowledgeItem}
              onChange={(e) => setNewKnowledgeItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKnowledgeItem()}
            />
            <Button onClick={addKnowledgeItem} disabled={!newKnowledgeItem.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {data.knowledgeBase
              .filter(item => !knowledgeSources.some(source => source.name === item))
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{item}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKnowledgeItem(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="grid gap-3">
          <Label htmlFor="instructions">Special Instructions</Label>
          <Textarea
            id="instructions"
            placeholder="Add any special instructions or guidelines for your agent..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            These instructions will guide your agent's behavior and decision-making process
          </p>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Knowledge Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{data.knowledgeBase.length}</div>
                <div className="text-sm text-muted-foreground">Knowledge Sources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{data.capabilities.length}</div>
                <div className="text-sm text-muted-foreground">Capabilities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{data.model}</div>
                <div className="text-sm text-muted-foreground">AI Model</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{data.maxTokens}</div>
                <div className="text-sm text-muted-foreground">Max Tokens</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
