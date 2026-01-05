'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {Link} from '@tanstack/react-router'

export default function FAQsFour() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'Which languages do your AI agents support?',
            answer: 'Our AI agents are fluent in English, Uzbek, and Russian. They understand natural conversation patterns, cultural nuances, and regional dialects in all three languages, providing authentic customer interactions.',
        },
        {
            id: 'item-2',
            question: 'Can the AI agents collect and qualify leads?',
            answer: 'Absolutely. Our AI agents are trained to engage prospects naturally, collect names, contact information, company details, and specific requirements. They qualify leads based on your criteria and sync everything directly to your CRM.',
        },
        {
            id: 'item-3',
            question: 'What platforms do your AI agents work on?',
            answer: 'Our AI agents work across all platforms—desktop computers, mobile phones, tablets, and web browsers. They provide consistent service whether your team is in the office or working remotely, with native mobile apps for iOS and Android.',
        },
        {
            id: 'item-4',
            question: 'How accurate is the sentiment analysis?',
            answer: 'Our sentiment analysis achieves over 95% accuracy across all three languages. It detects happiness, frustration, confusion, and urgency by analyzing tone, word choice, and conversation patterns, allowing you to respond appropriately in real-time.',
        },
        {
            id: 'item-5',
            question: 'Can I customize the AI agent scripts and workflows?',
            answer: 'Yes, you have complete control. Customize conversation flows, brand voice, qualifying questions, and response patterns. Our no-code workflow builder lets you design agent behaviors for different scenarios, products, and customer types.',
        },
    ]

    return (
        <section className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Discover quick and comprehensive answers to common questions about our AI call center agents and multilingual capabilities.</p>
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
