import { Card, CardContent } from '@/components/ui/card'
import { Bot, Headphones, Layout, Plus, Target, Wrench, Shield, TrendingUp, Zap, MessageSquare } from 'lucide-react'
import { agentTemplates } from '../../utils/mock-data'
import { AgentTemplate } from '../../types'

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
  initialGreeting?: string
}

interface TemplateStepProps {
  data: CreateAgentData
  onChange: (data: CreateAgentData) => void
  onNext: () => void
}

export default function TemplateStep({ data, onChange, onNext }: TemplateStepProps) {
  const handleSelectTemplate = (template: AgentTemplate) => {
    onChange({
      ...data,
      name: template.name,
      description: template.description,
      capabilities: template.capabilities,
      model: template.recommendedSettings.model || data.model,
      temperature: template.recommendedSettings.temperature || data.temperature,
      maxTokens: template.recommendedSettings.maxTokens || data.maxTokens,
      language: template.recommendedSettings.configuration?.language || data.language,
      voice: template.recommendedSettings.configuration?.voice || data.voice,
      personality: template.recommendedSettings.configuration?.personality || data.personality,
      escalationThreshold: template.recommendedSettings.configuration?.escalationThreshold || data.escalationThreshold,
    })
    onNext()
  }

  const getIcon = (icon: string) => {
    switch (icon) {
      case '💰': return <TrendingUp className="w-6 h-6 text-zinc-400" />
      case '🤝': return <Shield className="w-6 h-6 text-zinc-400" />
      case '🔧': return <Zap className="w-6 h-6 text-zinc-400" />
      case '📅': return <MessageSquare className="w-6 h-6 text-zinc-400" />
      default: return <Layout className="w-6 h-6 text-zinc-400" />
    }
  }

  return (
    <div className="space-y-16 py-12">
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Select Analysis Blueprint
        </h2>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Choose a scenario optimized for your specific conversation intelligence needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {agentTemplates.map((template) => (
          <Card 
            key={template.id}
            className="group relative cursor-pointer bg-zinc-950 border border-zinc-800/50 hover:border-zinc-500 transition-all duration-500 rounded-[2rem] overflow-hidden"
            onClick={() => handleSelectTemplate(template as AgentTemplate)}
          >
            <CardContent className="p-10">
              <div className="flex flex-col h-full space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500">
                    <div className="group-hover:text-black group-hover:scale-110 transition-all duration-500">
                      {getIcon(template.icon)}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold px-4 py-1.5 border border-zinc-800/50 rounded-full">
                    {template.category}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-zinc-300 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    {template.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {template.capabilities.slice(0, 3).map((cap, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] font-mono py-1.5 px-3 bg-zinc-900/50 text-zinc-500 border border-zinc-900 rounded-lg group-hover:border-zinc-800/50 transition-colors"
                    >
                      {cap}
                    </span>
                  ))}
                  {template.capabilities.length > 3 && (
                    <span className="text-[10px] font-mono py-1.5 px-3 bg-zinc-900/50 text-zinc-500 border border-zinc-900 rounded-lg">
                      +{template.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
            
            {/* Subtle Gradient Hover Effect */}
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </Card>
        ))}

        {/* Custom Start Option */}
        <Card 
          className="group relative cursor-pointer bg-black border border-dashed border-zinc-800 hover:border-zinc-500 transition-all duration-500 rounded-[2rem] flex flex-col items-center justify-center min-h-[300px]"
          onClick={() => onNext()}
        >
          <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-500">
              <Plus className="w-8 h-8 text-zinc-500 group-hover:text-black transition-colors" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Build From Scratch</h3>
              <p className="text-sm text-zinc-500">For completely custom analysis workflows</p>
            </div>
          </CardContent>
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        </Card>
      </div>
    </div>
  )
}
