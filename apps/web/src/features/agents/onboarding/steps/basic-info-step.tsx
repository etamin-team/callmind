import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, X, Target, Info } from 'lucide-react'
import { useState } from 'react'
import { onboardingStore, updateOnboardingData } from '../../store/onboarding-store'
import { useStore } from '@tanstack/react-store'

export default function BasicInfoStep() {
  const [newCapability, setNewCapability] = useState('')
  const state = useStore(onboardingStore)
  const { data } = state

  const addCapability = () => {
    if (newCapability.trim() && !data.capabilities.includes(newCapability.trim())) {
      updateOnboardingData({
        capabilities: [...data.capabilities, newCapability.trim()]
      })
      setNewCapability('')
    }
  }

  const removeCapability = (capability: string) => {
    updateOnboardingData({
      capabilities: data.capabilities.filter(c => c !== capability)
    })
  }

  return (
    <div className="space-y-20 py-10 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-black" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Phase 02</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Assistant Profile & Scope
        </h2>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Define the primary intelligence profile and the specific conversation guardrails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-12 space-y-12">
          {/* Identity Fields */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Assistant Designation</Label>
              <Input
                placeholder="e.g. Enterprise Sales Specialist"
                value={data.name}
                onChange={(e) => updateOnboardingData({ name: e.target.value })}
                className="h-16 bg-zinc-950 border-zinc-800 focus:border-white transition-all text-lg font-medium rounded-2xl px-6"
              />
              <p className="text-[10px] text-zinc-600 flex items-center gap-2 px-2">
                <Info className="w-3 h-3" />
                This name identifies the analysis profile in your dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Intelligence Model</Label>
              <Select value={data.model} onValueChange={(value) => updateOnboardingData({ model: value })}>
                <SelectTrigger className="h-16 bg-zinc-950 border-zinc-800 focus:border-white transition-all text-lg font-medium rounded-2xl px-6 text-zinc-400">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="gpt-4">GPT-4.0 (Advanced Reasoning)</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo (High Speed)</SelectItem>
                  <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Nuanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Operational Mission</Label>
            <Textarea
              placeholder="Describe the specific objectives for this assistant... (e.g. Focus on identifying budget constraints and competitor mentions during discovery calls)"
              value={data.description}
              onChange={(e) => updateOnboardingData({ description: e.target.value })}
              rows={4}
              className="bg-zinc-950 border-zinc-800 focus:border-white transition-all text-lg leading-relaxed rounded-2xl p-6 min-h-[160px]"
            />
          </div>

          <div className="space-y-8 pt-6">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Core Analysis Vectors</Label>
              <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full">
                {data.capabilities.length} Active
              </span>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Add a required analysis point (e.g. Tone Monitoring)..."
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                className="h-14 bg-zinc-950 border-zinc-800 focus:border-white transition-all rounded-xl px-4"
              />
              <Button 
                onClick={addCapability} 
                disabled={!newCapability.trim()} 
                className="h-14 px-8 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold"
              >
                Add Vector
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {data.capabilities.map((capability, index) => (
                <Badge 
                  key={index} 
                  className="px-4 py-2 text-xs bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center gap-3 transition-all cursor-default"
                >
                  {capability}
                  <button 
                    onClick={() => removeCapability(capability)}
                    className="text-zinc-600 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
              {data.capabilities.length === 0 && (
                <div className="w-full p-8 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-600">
                  <Sparkles className="w-6 h-6 mb-3 opacity-20" />
                  <p className="text-xs uppercase tracking-widest font-bold">No vectors defined</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
