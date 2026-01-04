import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface CallFlowStepProps {
  config: {
    primaryGoal: string
    collectFields: Array<string>
  }
  updateConfig: (field: string, value: any) => void
}

export function CallFlowStep({ config, updateConfig }: CallFlowStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="primaryGoal" className="text-sm font-medium">Primary call goal</Label>
        <Select value={config.primaryGoal} onValueChange={(value) => updateConfig('primaryGoal', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="answer">Answer questions</SelectItem>
            <SelectItem value="qualify">Qualify lead</SelectItem>
            <SelectItem value="message">Take message</SelectItem>
            <SelectItem value="escalate">Escalate to human</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="collectFields" className="text-sm font-medium">Collect during call</Label>
        <div className="flex gap-4 mt-2">
          {['name', 'phone', 'email'].map((field) => (
            <label key={field} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={config.collectFields?.includes(field) || false}
                onCheckedChange={() => {
                  const currentFields = config.collectFields || []
                  const newFields = currentFields.includes(field)
                    ? currentFields.filter(f => f !== field)
                    : [...currentFields, field]
                  updateConfig('collectFields', newFields)
                }}
              />
              {field}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
