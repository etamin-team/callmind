import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Phone } from 'lucide-react'

interface ContactFormData {
  firstName: string
  lastName: string
  business: string
  businessType: string
  phoneNumber: string
}

const businessTypes = [
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'technology', label: 'Technology & Software' },
  { value: 'education', label: 'Education & Training' },
  { value: 'restaurant', label: 'Restaurant & Food Service' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'transportation', label: 'Transportation & Logistics' },
  { value: 'consulting', label: 'Consulting & Professional Services' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'entertainment', label: 'Entertainment & Media' },
  { value: 'other', label: 'Other' },
]

export function WaitlistContactForm() {
  useTranslation()
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    business: '',
    businessType: '',
    phoneNumber: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' })
    }
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 5
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter your first and last name',
      })
      return
    }

    if (!formData.business.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter your business name',
      })
      return
    }

    if (!formData.businessType) {
      setSubmitStatus({
        type: 'error',
        message: 'Please select your business type',
      })
      return
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid phone number',
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact/waitlist-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Thank you! We will contact you soon.',
        })
        setFormData({
          firstName: '',
          lastName: '',
          business: '',
          businessType: '',
          phoneNumber: '',
        })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.message || 'Something went wrong. Please try again.',
        })
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="h-12"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business">
          Business Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="business"
          type="text"
          placeholder="Acme Corporation"
          value={formData.business}
          onChange={(e) => handleInputChange('business', e.target.value)}
          className="h-12"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">
          Business Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.businessType}
          onValueChange={(value) => handleInputChange('businessType', value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select your business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="h-12 pl-10"
            required
          />
        </div>
      </div>

      {submitStatus.type && (
        <div
          className={`p-4 rounded-lg text-sm ${
            submitStatus.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base font-medium"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By submitting this form, you agree to be contacted about our services.
      </p>
    </form>
  )
}
