import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, FileText, Trash2, CheckCircle2, ShieldAlert, FileSearch, Library, Zap, Info } from 'lucide-react'
import { useState } from 'react'
import { onboardingStore, updateOnboardingData } from '../../store/onboarding-store'
import { useStore } from '@tanstack/react-store'

export default function KnowledgeStep() {
  const [newKnowledgeItem, setNewKnowledgeItem] = useState('')
  const state = useStore(onboardingStore)
  const { data } = state

  const knowledgeSources = [
    { id: 'battlecards', name: 'Battlecards', icon: <Zap className="w-5 h-5" />, description: 'Quick-response objection handling' },
    { id: 'compliance', name: 'Compliance Registry', icon: <ShieldAlert className="w-5 h-5" />, description: 'Legal and regulatory boundaries' },
    { id: 'products', name: 'Product Index', icon: <FileSearch className="w-5 h-5" />, description: 'Detailed technical specifications' },
    { id: 'competitors', name: 'Competitor Maps', icon: <Library className="w-5 h-5" />, description: 'Comparison data and weak points' }
  ]

  const addKnowledgeItem = () => {
    if (newKnowledgeItem.trim() && !data.knowledgeBase.includes(newKnowledgeItem.trim())) {
      updateOnboardingData({
        knowledgeBase: [...data.knowledgeBase, newKnowledgeItem.trim()]
      })
      setNewKnowledgeItem('')
    }
  }

  const removeKnowledgeItem = (item: string) => {
    updateOnboardingData({
      knowledgeBase: data.knowledgeBase.filter(k => k !== item)
    })
  }

  const toggleKnowledgeSource = (sourceName: string) => {
    const isAlreadyIncluded = data.knowledgeBase.includes(sourceName)
    if (isAlreadyIncluded) {
      removeKnowledgeItem(sourceName)
    } else {
      updateOnboardingData({
        knowledgeBase: [...data.knowledgeBase, sourceName]
      })
    }
  }

  return (
    <div className="space-y-20 py-10 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-black" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Phase 04</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Battlecards & Directives
        </h2>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Inject real-time reference data and set concrete behavioral rules for the analysis engine.
        </p>
      </div>

      <div className="grid gap-16">
        {/* Registry Sources */}
        <div className="space-y-8">
          <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Standard Intelligence Registries</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeSources.map((source) => {
              const isIncluded = data.knowledgeBase.includes(source.name)
              return (
                <Card 
                  key={source.id}
                  className={`group relative cursor-pointer bg-zinc-950 border transition-all duration-300 rounded-2xl overflow-hidden ${
                    isIncluded 
                      ? 'border-white ring-1 ring-white' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                  onClick={() => toggleKnowledgeSource(source.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                        isIncluded ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}>
                        {source.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-white">{source.name}</h4>
                        <p className="text-[10px] text-zinc-500">{source.description}</p>
                      </div>
                      {isIncluded && (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Custom Guidelines */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Custom Directives & Knowledge Sync</Label>
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full">
              {data.knowledgeBase.length} Assets
            </span>
          </div>
          <div className="flex gap-4">
            <Input
              placeholder="Inject PDF URL or reference identifier..."
              value={newKnowledgeItem}
              onChange={(e) => setNewKnowledgeItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKnowledgeItem())}
              className="h-14 bg-zinc-950 border-zinc-800 focus:border-white transition-all rounded-xl px-4"
            />
            <Button 
              onClick={addKnowledgeItem} 
              disabled={!newKnowledgeItem.trim()} 
              className="h-14 px-8 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold"
            >
              Sync Asset
            </Button>
          </div>
          
          <div className="space-y-3">
            {data.knowledgeBase
              .filter(item => !knowledgeSources.some(source => source.name === item))
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl group hover:border-zinc-600 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="text-xs font-medium text-zinc-300">{item}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKnowledgeItem(item)}
                    className="h-8 w-8 text-zinc-600 hover:text-white hover:bg-zinc-900 transition-all rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
          </div>
        </div>

        {/* Behavioral Constraints */}
        <div className="space-y-8 pt-6 border-t border-zinc-800/50">
          <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Behavioral Constraints & Guardrails</Label>
          <Textarea
            placeholder="Define strict limitations and phrase logic... (e.g. 'Never offer a discount without a competitor mention. Flag any interruptions immediately.')"
            rows={5}
            className="bg-zinc-950 border-zinc-800 focus:border-white transition-all text-lg leading-relaxed rounded-2xl p-6 min-h-[160px]"
          />
          <p className="text-[10px] text-zinc-600 flex items-center gap-2 px-2">
            <Info className="w-3 h-3" />
            These rules weight the analysis engine's real-time suggestions.
          </p>
        </div>

        {/* Global Overview Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 bg-zinc-950 border border-zinc-800 rounded-[2.5rem]">
          <div className="space-y-2">
             <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold block">Assigned Profile</span>
             <p className="text-sm font-bold text-white truncate">{data.name || 'Undefined'}</p>
          </div>
          <div className="space-y-2">
             <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold block">Analysis Lens</span>
             <p className="text-sm font-bold text-white capitalize">{data.personality}</p>
          </div>
          <div className="space-y-2">
             <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold block">Core Vectors</span>
             <p className="text-sm font-bold text-white">{data.capabilities.length} Active</p>
          </div>
          <div className="space-y-2">
             <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold block">Registry Assets</span>
             <p className="text-sm font-bold text-white uppercase">{data.knowledgeBase.length} Sync'd</p>
          </div>
        </div>
      </div>
    </div>
  )
}
