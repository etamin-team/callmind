import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface KnowledgeStepProps {
  config: {
    knowledgeText: string
  }
  updateConfig: (field: string, value: any) => void
}

export function KnowledgeStep({ config, updateConfig }: KnowledgeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="knowledgeText" className="text-sm font-medium">Agent knowledge (text only)</Label>
        <Textarea
          rows={6}
          placeholder="FAQs, pricing rules, policies, product info…"
          value={config.knowledgeText}
          onChange={(e) => updateConfig('knowledgeText', e.target.value)}
        />
      </div>
    </div>
  )
}
