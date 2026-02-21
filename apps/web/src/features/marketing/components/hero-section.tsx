import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Phone,
  Bot,
  MessageSquare,
} from 'lucide-react'
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
        type: 'spring' as const,
        bounce: 0.2,
        duration: 0.6,
      },
    },
  },
}

const features = [
  {
    icon: Phone,
    title: '24/7 Calls',
    description: 'Never miss a customer call',
  },
  {
    icon: Bot,
    title: 'AI Agents',
    description: 'Intelligent voice assistants',
  },
  {
    icon: MessageSquare,
    title: 'Multi-language',
    description: 'Uzbek, English, Russian',
  },
]

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
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
                  <a
                    href="#link"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      Real-Time Conversation Intelligence
                    </span>
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
                  </a>
                </AnimatedGroup>

                <TextEffect
                  preset="fade"
                  speedSegment={0.225}
                  as="h1"
                  className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                  style={{
                    fontFamily: 'Geist, sans-serif',
                    willChange: 'opacity, transform',
                  }}
                >
                  Automate Customer Calls with AI
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade"
                  speedSegment={0.225}
                  delay={0.3}
                  as="p"
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground"
                  style={{
                    fontFamily: 'Geist, sans-serif',
                    willChange: 'opacity, transform',
                  }}
                >
                  Deploy AI voice agents that handle customer calls in Uzbek,
                  capture leads, analyze sentiment, and provide reliable 24/7
                  support.
                </TextEffect>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.1,
                        },
                      },
                    },
                    item: {
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
                    },
                  }}
                  className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row relative z-10"
                >
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full px-8 text-base"
                  >
                    <Link to="/register">Start Free Trial</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-12 rounded-full px-8 text-base hover:bg-transparent hover:underline underline-offset-4"
                  >
                    <a href="#demo">Watch Demo</a>
                  </Button>
                </AnimatedGroup>

                {/* Minimalist Feature List */}
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
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { duration: 0.5 } },
                    },
                  }}
                  className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground relative z-10"
                >
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <feature.icon className="h-4 w-4" />
                      <span>{feature.title}</span>
                    </div>
                  ))}
                </AnimatedGroup>
              </div>
            </div>
          </div>
        </section>
        
      </main>
    </>
  )
}
