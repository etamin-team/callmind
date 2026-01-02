'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {Link} from '@tanstack/react-router'

export default function FAQsFour() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How does the AI provide real-time guidance?',
            answer: 'Our AI analyzes live audio streams using advanced natural language processing. It detects key phrases, sentiment, and conversation patterns, then provides contextual suggestions to agents through a discreet interface within 200 milliseconds.',
        },
        {
            id: 'item-2',
            question: 'What phone systems do you integrate with?',
            answer: 'We integrate with major VoIP providers including RingCentral, Five9, Genesys, Aircall, and Twilio. We also offer a flexible API for custom integrations with legacy or proprietary systems.',
        },
        {
            id: 'item-3',
            question: 'How long does it take to implement?',
            answer: 'Most teams are up and running within 1-2 days. Cloud-based integrations can be completed in hours, while on-premise deployments typically take 1-3 business days depending on your infrastructure.',
        },
        {
            id: 'item-4',
            question: 'Is the AI coaching noticeable to customers?',
            answer: 'No, the AI guidance is completely invisible to customers. Agents receive suggestions through a subtle interface that doesn\'t interrupt the natural flow of conversation. The AI enhances human interaction without replacing it.',
        },
        {
            id: 'item-5',
            question: 'How do you ensure data security and compliance?',
            answer: 'We use enterprise-grade encryption, maintain SOC 2 Type II certification, and are GDPR compliant. All call data can be stored in your region, and we offer dedicated instances for enterprises with strict security requirements.',
        },
    ]

    return (
        <section className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Discover quick and comprehensive answers to common questions about our platform, services, and features.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-muted dark:bg-muted/50 w-full rounded-2xl p-1">
                        {faqItems.map((item) => (
                            <div
                                className="group"
                                key={item.id}>
                                <AccordionItem
                                    value={item.id}
                                    className="data-[state=open]:bg-card dark:data-[state=open]:bg-muted peer rounded-xl border-none px-7 py-1 data-[state=open]:border-none data-[state=open]:shadow-sm">
                                    <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-base">{item.answer}</p>
                                    </AccordionContent>
                                </AccordionItem>
                                <hr className="mx-7 border-dashed group-last:hidden peer-data-[state=open]:opacity-0" />
                            </div>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Can't find what you're looking for? Contact our{' '}
                        <Link
                            href="#"
                            className="text-primary font-medium hover:underline">
                            customer support team
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
