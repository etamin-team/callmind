import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface BusinessContextStepProps {
  config: {
    businessName: string
    businessDescription: string
    businessIndustry: string
    targetCallers: string
  }
  updateConfig: (field: string, value: any) => void
}

export function BusinessContextStep({ config, updateConfig }: BusinessContextStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessName" className="text-sm font-medium">Company Name</Label>
          <Input
            id="businessName"
            placeholder="e.g. Acme Solar"
            value={config.businessName}
            onChange={(e) => updateConfig('businessName', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
           <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
           <Select value={config.businessIndustry} onValueChange={(value) => updateConfig('businessIndustry', value)}>
             <SelectTrigger className="mt-2">
               <SelectValue placeholder="Select industry" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="real_estate">Real Estate</SelectItem>
               <SelectItem value="healthcare">Healthcare / Medical</SelectItem>
               <SelectItem value="solar">Solar / Energy</SelectItem>
               <SelectItem value="insurance">Insurance</SelectItem>
               <SelectItem value="legal">Legal</SelectItem>
               <SelectItem value="financial">Financial Services</SelectItem>
               <SelectItem value="ecommerce">E-commerce</SelectItem>
               <SelectItem value="other">Other</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="businessDescription" className="text-sm font-medium">Business Description</Label>
        <p className="text-xs text-muted-foreground mb-2">Briefly describe what your company does and its key value proposition.</p>
        <Textarea
          rows={4}
          maxLength={500}
          placeholder="e.g. We provide residential solar installation services in California. We focus on helping homeowners save money on electricity..."
          value={config.businessDescription}
          onChange={(e) => updateConfig('businessDescription', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="targetCallers" className="text-sm font-medium">Target Audience</Label>
        <Select value={config.targetCallers} onValueChange={(value) => updateConfig('targetCallers', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Who is the agent talking to?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_leads">New Leads (Cold)</SelectItem>
            <SelectItem value="existing_customers">Existing Customers</SelectItem>
            <SelectItem value="partners">Partners / Vendors</SelectItem>
            <SelectItem value="mixed">Mixed Audience</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
