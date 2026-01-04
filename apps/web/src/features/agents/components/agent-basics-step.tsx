import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AgentBasicsStepProps {
  config: {
    name: string
    type: string
    language: string
  }
  updateConfig: (field: string, value: any) => void
}

export function AgentBasicsStep({ config, updateConfig }: AgentBasicsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-sm font-medium">Agent name</Label>
        <Input
          id="name"
          placeholder="e.g. Sarah, Assistant, Support Bot"
          value={config.name}
          onChange={(e) => updateConfig('name', e.target.value)}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1.5">
          This is how your agent will introduce itself to callers
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type" className="text-sm font-medium">Agent type</Label>
          <Select value={config.type} onValueChange={(value) => updateConfig('type', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="language" className="text-sm font-medium">Language</Label>
          <Select value={config.language} onValueChange={(value) => updateConfig('language', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="uz">Uzbek</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
