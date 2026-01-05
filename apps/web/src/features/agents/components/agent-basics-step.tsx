import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface AgentBasicsStepProps {
  config: {
    name: string
    type: string
    language: string
    voice: string
    greeting: string
  }
  updateConfig: (field: string, value: any) => void
}

export function AgentBasicsStep({ config, updateConfig }: AgentBasicsStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Agent name</Label>
          <Input
            id="name"
            placeholder="e.g. Sarah"
            value={config.name}
            onChange={(e) => updateConfig('name', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
           <Label htmlFor="type" className="text-sm font-medium">Role</Label>
           <Select value={config.type} onValueChange={(value) => updateConfig('type', value)}>
             <SelectTrigger className="mt-2">
               <SelectValue placeholder="Select role" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="inbound_support">Inbound Support</SelectItem>
               <SelectItem value="outbound_sales">Outbound Sales</SelectItem>
               <SelectItem value="receptionist">Receptionist</SelectItem>
               <SelectItem value="appointment_setter">Appointment Setter</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="voice" className="text-sm font-medium">Voice</Label>
          <Select value={config.voice} onValueChange={(value) => updateConfig('voice', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sarah_friendly">Sarah (Friendly, US)</SelectItem>
              <SelectItem value="mike_professional">Mike (Professional, US)</SelectItem>
              <SelectItem value="atlas_deep">Atlas (Deep, US)</SelectItem>
              <SelectItem value="nova_energetic">Nova (Energetic, UK)</SelectItem>
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
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="en-gb">English (UK)</SelectItem>
              <SelectItem value="uz">Uzbek</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="greeting" className="text-sm font-medium">Opening Greeting</Label>
        <p className="text-xs text-muted-foreground mb-2">What should the agent say when answering the phone?</p>
        <Textarea
          id="greeting"
          rows={2}
          placeholder="e.g. Hi, this is Sarah from Callmind, how can I help you today?"
          value={config.greeting}
          onChange={(e) => updateConfig('greeting', e.target.value)}
        />
      </div>
    </div>
  )
}
