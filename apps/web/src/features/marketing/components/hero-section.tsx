import { useState, useEffect } from 'react'
import {Link} from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Phone, Bot, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            y: 8,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.2,
                duration: 0.6,
            },
        },
    },
}

const features = [
  {
    icon: Phone,
    title: "24/7 Calls",
    description: "Never miss a customer call"
  },
  {
    icon: Bot,
    title: "AI Agents",
    description: "Intelligent voice assistants"
  },
  {
    icon: MessageSquare,
    title: "Multi-language",
    description: "Uzbek, English, Russian"
  },
]

export default function HeroSection() {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        // Small delay to ensure hydration is complete before triggering animations
        const id = requestAnimationFrame(() => setHasMounted(true))
        return () => cancelAnimationFrame(id)
    }, [])

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section className="min-h-screen flex flex-col">
                    <div className="relative pt-24 md:pt-36 flex-1 flex flex-col">
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="#link"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">Real-Time Conversation Intelligence</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade"
                                    speedSegment={0.225}
                                    as="h1"
                                    trigger={hasMounted}
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                                    style={{ fontFamily: 'Geist, sans-serif', willChange: 'opacity, transform' }}>
                                    Automate Customer Calls with AI
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade"
                                    speedSegment={0.225}
                                    delay={0.3}
                                    trigger={hasMounted}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground"
                                    style={{ fontFamily: 'Geist, sans-serif', willChange: 'opacity, transform' }}>
                                    Deploy AI voice agents that handle customer calls in Uzbek, capture leads, analyze sentiment, and provide reliable 24/7 support.
                                </TextEffect>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.1,
                                                },
                                            },
                                        },
                                        item: {
                                            hidden: {
                                                opacity: 0,
                                                y: 8,
                                            },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    type: 'spring',
                                                    bounce: 0.2,
                                                    duration: 0.5,
                                                },
                                            },
                                        },
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <Link href="/sign-up">
                                                <span className="text-nowrap">Start Free Trial</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <Link href="#demo">
                                            <span className="text-nowrap">Watch Demo</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>

                                {/* Feature Cards */}
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.1,
                                                    delayChildren: 0.3,
                                                },
                                            },
                                        },
                                        item: {
                                            hidden: {
                                                opacity: 0,
                                                y: 20,
                                            },
                                            visible: {
                                                opacity: 1,
                                                y: 0,
                                                transition: {
                                                    type: 'spring',
                                                    bounce: 0.2,
                                                    duration: 0.6,
                                                },
                                            },
                                        },
                                    }}
                                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
                                >
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="group relative rounded-xl border bg-muted/30 p-6 text-left transition-all hover:bg-muted/50 hover:border-primary/50"
                                        >
                                            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                                                <feature.icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                                        </div>
                                    ))}
                                </AnimatedGroup>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/"
                                className="block text-sm duration-150 hover:opacity-75">
                                <span> Meet Our Customers</span>

                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                    alt="Nvidia Logo"
                                    loading="lazy"
                                />
                            </div>

                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/column.svg"
                                    alt="Column Logo"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/github.svg"
                                    alt="GitHub Logo"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/nike.svg"
                                    alt="Nike Logo"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                                    alt="Lemon Squeezy Logo"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/laravel.svg"
                                    alt="Laravel Logo"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-7 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/lilly.svg"
                                    alt="Lilly Logo"
                                    loading="lazy"
                                />
                            </div>

                            <div className="flex">
                                <img
                                    className="mx-auto h-6 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/openai.svg"
                                    alt="OpenAI Logo"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
