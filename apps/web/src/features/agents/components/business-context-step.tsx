import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface BusinessContextStepProps {
  config: {
    businessName: string
    businessDescription: string
    targetCallers: string
  }
  updateConfig: (field: string, value: any) => void
}

export function BusinessContextStep({ config, updateConfig }: BusinessContextStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="businessName" className="text-sm font-medium">Business name</Label>
        <Input
          id="businessName"
          placeholder="Your company name"
          value={config.businessName}
          onChange={(e) => updateConfig('businessName', e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="businessDescription" className="text-sm font-medium">What does your business do?</Label>
        <Textarea
          rows={3}
          maxLength={300}
          placeholder="Describe your business, services, and target audience..."
          value={config.businessDescription}
          onChange={(e) => updateConfig('businessDescription', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="targetCallers" className="text-sm font-medium">Who usually calls you?</Label>
        <Select value={config.targetCallers} onValueChange={(value) => updateConfig('targetCallers', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select callers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customers">Customers</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
