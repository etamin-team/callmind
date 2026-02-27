import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'

const faqs = [
  {
    question: 'How does the AI coaching work?',
    answer: 'Our AI listens to your calls in real-time and suggests responses based on successful sales patterns. It learns from your best performers and helps everyone improve.',
  },
  {
    question: 'What integrations do you support?',
    answer: 'We integrate with Zoom, Google Meet, Microsoft Teams, Salesforce, HubSpot, and more via API.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We\'re SOC 2 Type II certified with end-to-end encryption. Your recordings are stored securely and never shared.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
  },
  {
    question: 'How long is the free trial?',
    answer: 'We offer a 14-day free trial with full access to all Pro features. No credit card required.',
  },
]

export function FAQ() {
  return (
    <section className="section-padding">
      <div className="page-wrap">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="mb-4">Questions?</h2>
            <p>Everything you need to know about Callmind.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="card overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-[var(--color-bg-hover)] [&[data-state=open]]:bg-[var(--color-bg-hover)]">
                  <span className="font-medium text-sm">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
