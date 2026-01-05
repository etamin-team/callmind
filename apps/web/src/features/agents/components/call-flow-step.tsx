import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface CallFlowStepProps {
  config: {
    primaryGoal: string
    collectFields: Array<string>
    phoneTransfer: string
    objectionHandling: string
  }
  updateConfig: (field: string, value: any) => void
}

export function CallFlowStep({ config, updateConfig }: CallFlowStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="primaryGoal" className="text-sm font-medium">Primary Goal</Label>
        <Select value={config.primaryGoal} onValueChange={(value) => updateConfig('primaryGoal', value)}>
          <SelectTrigger className="mt-2 text-left h-auto py-3">
             <SelectValue placeholder="Select primary goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="answer">
               <span className="font-medium">Information / Support</span>
               <p className="text-xs text-muted-foreground">Answer questions based on knowledge base</p>
            </SelectItem>
            <SelectItem value="qualify">
               <span className="font-medium">Lead Qualification</span>
               <p className="text-xs text-muted-foreground">Gather info and qualify prospects</p>
            </SelectItem>
            <SelectItem value="schedule">
               <span className="font-medium">Appointment Booking</span>
               <p className="text-xs text-muted-foreground">Schedule meetings or calls</p>
            </SelectItem>
            <SelectItem value="escalate">
               <span className="font-medium">Direct Transfer</span>
               <p className="text-xs text-muted-foreground">Transfer call to a human immediately</p>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.primaryGoal === 'escalate' && (
        <div className="p-4 bg-muted/50 rounded-lg border">
           <Label htmlFor="phoneTransfer" className="text-sm font-medium">Transfer Phone Number</Label>
           <Input 
             id="phoneTransfer"
             placeholder="+1 (555) 000-0000"
             value={config.phoneTransfer}
             onChange={(e) => updateConfig('phoneTransfer', e.target.value)}
             className="mt-2"
           />
           <p className="text-xs text-muted-foreground mt-1">Number to forward calls to.</p>
        </div>
      )}

      <div>
        <Label htmlFor="objectionHandling" className="text-sm font-medium">Objection Handling</Label>
        <p className="text-xs text-muted-foreground mb-2">How should the agent respond to "I'm not interested" or similar objections?</p>
        <Textarea
          rows={3}
          placeholder="e.g. Acknowledge, pivot to value proposition, then ask one qualifying question..."
          value={config.objectionHandling}
          onChange={(e) => updateConfig('objectionHandling', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="collectFields" className="text-sm font-medium">Data Collection</Label>
        <p className="text-xs text-muted-foreground mb-3">Select information the agent must collect before ending the call.</p>
        <div className="grid grid-cols-2 gap-3">
          {['Name', 'Phone Number', 'Email Address', 'Company Name', 'Budget', 'Timeline'].map((field) => (
            <label key={field} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
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
              <span className="text-sm font-medium">{field}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
