import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  User,
  MessageSquare,
  MapPin,
  Phone,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { HeroHeader } from '@/features/marketing/components/header'
import FooterSection from '@/features/marketing/components/footer'

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8466346127:AAF_fA4Ku5oGZigIZfzyeGEvTwMl0yh_MVI'
const TELEGRAM_CHAT_ID = '6802457909'

interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

function ContactPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('contact.errors.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.errors.emailInvalid')
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.errors.messageRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const sendToTelegram = async (): Promise<boolean> => {
    const text = `
📨 <b>New Contact Form Submission</b>

👤 <b>Name:</b> ${formData.name}
📧 <b>Email:</b> ${formData.email}
📱 <b>Phone:</b> ${formData.phone || 'Not provided'}

💬 <b>Message:</b>
${formData.message}

---
Sent from: ${window.location.origin}
    `.trim()

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'HTML',
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to send')
      }

      return true
    } catch (error) {
      console.error('Telegram API error:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('idle')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    const success = await sendToTelegram()

    if (success) {
      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } else {
      setSubmitStatus('error')
    }

    setIsSubmitting(false)
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@callmind.uz',
      href: 'mailto:hello@callmind.uz',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'Tashkent, Uzbekistan',
      href: null,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+998 90 123 45 67',
      href: 'tel:+998901234567',
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeroHeader />

      <main className="flex-1">
        <section className="relative pt-32 pb-24 md:pt-40">
          {/* Background */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
          />

          <div className="mx-auto max-w-6xl px-6">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
              {/* Left Side - Contact Info */}
              <div className="pt-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  {t('contact.title')}
                </h1>

                <p className="text-lg text-muted-foreground mb-12 max-w-md">
                  {t('contact.subtitle')}
                </p>

                {/* Contact Info */}
                <div className="space-y-6">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#387DCD]/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-[#387DCD]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-foreground font-medium hover:text-[#387DCD] transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-foreground font-medium">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="relative">
                <div className="bg-card rounded-2xl shadow-xl border border-border p-8 md:p-10">
                  {submitStatus === 'success' ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {t('contact.successTitle')}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {t('contact.successMessage')}
                      </p>
                      <Button
                        onClick={() => setSubmitStatus('idle')}
                        variant="outline"
                        className="rounded-full px-6"
                      >
                        {t('contact.sendAnother')}
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {submitStatus === 'error' && (
                        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{t('contact.errors.sendFailed')}</span>
                        </div>
                      )}

                      {/* Name Field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {t('contact.nameLabel')}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder={t('contact.namePlaceholder')}
                          disabled={isSubmitting}
                          className={`h-12 rounded-xl border-0 bg-muted focus:bg-background focus:ring-2 focus:ring-[#387DCD]/20 transition-all ${
                            errors.name
                              ? 'ring-2 ring-red-500 bg-red-500/10'
                              : ''
                          }`}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {t('contact.emailLabel')}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleChange('email', e.target.value)
                          }
                          placeholder={t('contact.emailPlaceholder')}
                          disabled={isSubmitting}
                          className={`h-12 rounded-xl border-0 bg-muted focus:bg-background focus:ring-2 focus:ring-[#387DCD]/20 transition-all ${
                            errors.email
                              ? 'ring-2 ring-red-500 bg-red-500/10'
                              : ''
                          }`}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {t('contact.phoneLabel')}
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleChange('phone', e.target.value)
                          }
                          placeholder={t('contact.phonePlaceholder')}
                          disabled={isSubmitting}
                          className="h-12 rounded-xl border-0 bg-muted focus:bg-background focus:ring-2 focus:ring-[#387DCD]/20 transition-all"
                        />
                      </div>

                      {/* Message Field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          {t('contact.messageLabel')}
                          <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) =>
                            handleChange('message', e.target.value)
                          }
                          placeholder={t('contact.messagePlaceholder')}
                          disabled={isSubmitting}
                          rows={4}
                          className={`rounded-xl border-0 bg-muted resize-none focus:bg-background focus:ring-2 focus:ring-[#387DCD]/20 transition-all ${
                            errors.message
                              ? 'ring-2 ring-red-500 bg-red-500/10'
                              : ''
                          }`}
                        />
                        {errors.message && (
                          <p className="text-sm text-red-500">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl text-base font-medium bg-[#387DCD] hover:bg-[#2d6ab8] text-white shadow-lg shadow-[#387DCD]/25 transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('contact.sending')}
                          </>
                        ) : (
                          <>
                            {t('contact.sendButton')}
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}

export const Route = createFileRoute('/contact')({ component: ContactPage })
