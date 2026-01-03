import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Mic, Sparkles, Volume2, Search, Zap, Heart, Target, Info } from 'lucide-react'
import { onboardingStore, updateOnboardingData } from '../../store/onboarding-store'
import { useStore } from '@tanstack/react-store'

export default function PersonalityStep() {
  const state = useStore(onboardingStore)
  const { data } = state

  const analysisStyles = [
    { value: 'analytical', label: 'Deep Analytical', description: 'Logical, data-driven, and systematic feedback', icon: <Search className="w-5 h-5" /> },
    { value: 'empathetic', label: 'Empathetic', description: 'Focus on sentiment and emotional intelligence', icon: <Heart className="w-5 h-5" /> },
    { value: 'persuasive', label: 'Strategic/Sales', description: 'Conversion-focused with closing logic', icon: <Target className="w-5 h-5" /> },
    { value: 'professional', label: 'Standard Professional', description: 'Balanced, formal, and strictly business', icon: <Zap className="w-5 h-5" /> },
  ]

  const feedbackVoices = [
    { value: 'professional', label: 'Alpha One', description: 'Deep, masculine, authoritative' },
    { value: 'friendly', label: 'Luna Pulse', description: 'Soft, feminine, reassuring' },
    { value: 'elegant', label: 'Nova Prime', description: 'Sophisticated, clear, neutral' },
    { value: 'calm', label: 'Zen Master', description: 'Steady, slow, meditative' }
  ]

  return (
    <div className="space-y-20 py-10 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Phase 03</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Intelligence Style
        </h2>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Customize the analytical lens and the vocal feedback characteristics of your assistant.
        </p>
      </div>

      <div className="grid gap-16">
        {/* Style Selection */}
        <div className="space-y-8">
          <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Primary Analysis Style</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysisStyles.map((style) => (
              <Card 
                key={style.value}
                className={`group relative cursor-pointer bg-zinc-950 border transition-all duration-300 rounded-2xl overflow-hidden ${
                  data.personality === style.value 
                    ? 'border-white ring-1 ring-white' 
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
                onClick={() => updateOnboardingData({ personality: style.value })}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      data.personality === style.value ? 'bg-white text-black scale-110' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {style.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-white">{style.label}</h4>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        {style.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="space-y-8">
          <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Feedback Vocal Profile</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackVoices.map((voice) => (
              <Card 
                key={voice.value}
                className={`group cursor-pointer bg-zinc-950 border transition-all duration-300 rounded-2xl ${
                  data.voice === voice.value 
                    ? 'border-white ring-1 ring-white' 
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
                onClick={() => updateOnboardingData({ voice: voice.value })}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                        data.voice === voice.value ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}>
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{voice.label}</h4>
                        <p className="text-[10px] text-zinc-500">{voice.description}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-all cursor-pointer">
                      <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Parameters */}
        <div className="pt-12 border-t border-zinc-800/50 space-y-12">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold italic">Nuance Depth (Temp)</Label>
                <span className="text-xs font-mono bg-zinc-900 border border-zinc-800 text-white px-3 py-1 rounded-lg">
                  {data.temperature.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[data.temperature]}
                onValueChange={([value]) => updateOnboardingData({ temperature: value })}
                max={1}
                min={0}
                step={0.1}
                className="py-4"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                <span>Robotic</span>
                <span>Hyper-Fluid</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold italic">Analysis Sensitivity</Label>
                <span className="text-xs font-mono bg-zinc-900 border border-zinc-800 text-white px-3 py-1 rounded-lg">
                  {Math.round(data.escalationThreshold * 100)}%
                </span>
              </div>
              <Slider
                value={[data.escalationThreshold]}
                onValueChange={([value]) => updateOnboardingData({ escalationThreshold: value })}
                max={1}
                min={0}
                step={0.1}
                className="py-4"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                <span>Low Alert</span>
                <span>Max Critical</span>
              </div>
              <p className="text-[10px] text-zinc-500 flex items-center gap-2">
                <Info className="w-3 h-3" />
                Determines how aggressively the AI flags conversation deviations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
