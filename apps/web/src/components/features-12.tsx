import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BorderBeam } from '@/components/ui/border-beam'
import { ChartBarIncreasingIcon, Database, Fingerprint, IdCard, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type FeatureKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'

// Animated icon components for each feature
function DatabaseAnimation() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Outer rotating ring */}
            <motion.div
                className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--color-chart-1)]/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />

            {/* Middle pulsing ring */}
            <motion.div
                className="absolute inset-12 rounded-full border border-[var(--color-chart-2)]/40"
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Center icon */}
            <motion.div
                className="relative"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <motion.div
                    className="relative"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Database className="h-32 w-32 text-[var(--color-chart-1)]" strokeWidth={1.5} />
                    {/* Glowing effect */}
                    <motion.div
                        className="absolute inset-0 blur-3xl bg-[var(--color-chart-1)]/20"
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>

            {/* Floating data particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-[var(--color-chart-2)]/60"
                    initial={{ rotate: i * 60, radius: 80 }}
                    animate={{
                        rotate: i * 60,
                        radius: [80, 100, 80],
                    }}
                    transition={{
                        duration: 2 + i * 0.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.3,
                    }}
                    style={{
                        transformOrigin: 'center',
                    }}
                />
            ))}
        </div>
    )
}

function SentimentAnimation() {
    const emotions = ['😊', '🤔', '😐', '😟']
    const [emotionIndex, setEmotionIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setEmotionIndex((i) => (i + 1) % emotions.length)
        }, 1500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Scanning line effect */}
            <motion.div
                className="absolute inset-0 overflow-hidden rounded-full"
                style={{ background: 'radial-gradient(circle, var(--color-chart-3)/20 0%, transparent 70%)' }}
            >
                <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-chart-3)] to-transparent"
                    animate={{ top: ['0%', '50%', '100%', '50%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
            </motion.div>

            {/* Central fingerprint */}
            <motion.div
                className="relative"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Fingerprint className="h-32 w-32 text-[var(--color-chart-3)]" strokeWidth={1.5} />
                <motion.div
                    className="absolute inset-0 blur-3xl bg-[var(--color-chart-3)]/20"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>

            {/* Floating emotion indicators */}
            <div className="absolute inset-0">
                {emotions.map((emotion, i) => (
                    <motion.div
                        key={i}
                        className={cn(
                            'absolute text-4xl',
                            i === 0 && 'top-8 left-8',
                            i === 1 && 'top-8 right-8',
                            i === 2 && 'bottom-8 left-8',
                            i === 3 && 'bottom-8 right-8'
                        )}
                        animate={{
                            scale: i === emotionIndex ? [1, 1.3, 1] : 0.8,
                            opacity: i === emotionIndex ? 1 : 0.4,
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        {emotion}
                    </motion.div>
                ))}
            </div>

            {/* Pulse rings */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-[var(--color-chart-3)]/30"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 0.5, 0] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 1,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    )
}

function AnalyticsAnimation() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Background grid */}
            <div className="absolute inset-8 grid grid-cols-4 gap-2 opacity-20">
                {[...Array(16)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="rounded bg-[var(--color-chart-4)]"
                        animate={{
                            scaleY: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            {/* Central ID Card */}
            <motion.div
                className="relative"
                animate={{ rotateY: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <IdCard className="h-32 w-32 text-[var(--color-chart-4)]" strokeWidth={1.5} />
                <motion.div
                    className="absolute inset-0 blur-3xl bg-[var(--color-chart-4)]/20"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>

            {/* Orbiting stats */}
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs shadow-sm"
                    style={{
                        top: '50%',
                        left: '50%',
                    }}
                    animate={{
                        x: Math.cos((i * Math.PI) / 2) * 100,
                        y: Math.sin((i * Math.PI) / 2) * 80,
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeInOut',
                    }}
                >
                    <div className="h-2 w-2 rounded-full bg-[var(--color-chart-4)]" />
                    <span className="font-medium">+{10 + i * 5}%</span>
                </motion.div>
            ))}
        </div>
    )
}

function InsightsAnimation() {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Background chart lines */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 200">
                {[...Array(5)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M 0 ${150 - i * 25} Q 50 ${100 - i * 20}, 100 ${120 - i * 25} T 200 ${80 - i * 15}`}
                        stroke="var(--color-chart-5)"
                        strokeWidth="2"
                        fill="none"
                        opacity={0.1 + i * 0.05}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.1 + i * 0.05 }}
                        transition={{ duration: 2, delay: i * 0.2 }}
                    />
                ))}
            </svg>

            {/* Central trending icon */}
            <motion.div
                className="relative"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <ChartBarIncreasingIcon className="h-32 w-32 text-[var(--color-chart-5)]" strokeWidth={1.5} />
                <motion.div
                    className="absolute inset-0 blur-3xl bg-[var(--color-chart-5)]/20"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>

            {/* Growing bars animation */}
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-center gap-2">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-3 rounded-t bg-gradient-to-t from-[var(--color-chart-5)] to-transparent"
                        animate={{
                            height: [20, 40 + Math.random() * 40, 20],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            {/* Floating trend indicators */}
            <motion.div
                className="absolute top-8 right-8 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 shadow-sm"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <TrendingUp className="h-4 w-4 text-[var(--color-chart-5)]" />
                <span className="text-sm font-semibold text-[var(--color-chart-5)]">+127%</span>
            </motion.div>
        </div>
    )
}

export default function Features() {
    const [activeItem, setActiveItem] = useState<FeatureKey>('item-1')

    const featureComponents = {
        'item-1': DatabaseAnimation,
        'item-2': SentimentAnimation,
        'item-3': AnalyticsAnimation,
        'item-4': InsightsAnimation,
    }

    return (
        <section className="py-12 md:py-20 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">AI-Powered Call Excellence</h2>
                    <p>Transform your call center with real-time conversation intelligence. Get instant coaching, detect customer sentiment, and close more deals with AI-guided conversations.</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value) => setActiveItem(value as FeatureKey)}
                        className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Database className="size-4" />
                                    Real-Time Call Coaching
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Get instant suggestions during live calls. Our AI analyzes conversations in real-time and provides contextual prompts to help agents overcome objections and guide conversations toward successful outcomes.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Fingerprint className="size-4" />
                                    Sentiment & Emotion Detection
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Detect customer emotions instantly with advanced NLP. Know when they're interested, skeptical, or frustrated so agents can adjust their approach and improve customer satisfaction.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <IdCard className="size-4" />
                                    Conversation Analytics
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Track performance metrics like talk-to-listen ratios, keyword frequency, and conversion patterns. Turn every conversation into actionable data that drives continuous improvement.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <ChartBarIncreasingIcon className="size-4" />
                                    Performance Insights
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Monitor team performance, identify top performers, and replicate winning strategies across your entire team. Get detailed reports on call outcomes and agent effectiveness.</AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="bg-background relative flex min-h-[400px] overflow-hidden rounded-3xl border p-2">
                        <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
                        <div className="aspect-square w-full rounded-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeItem}
                                    initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className="size-full rounded-2xl border bg-gradient-to-br from-background to-muted/30"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    {(() => {
                                        const ActiveComponent = featureComponents[activeItem]
                                        return <ActiveComponent />
                                    })()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-[var(--color-chart-1)]/50 to-transparent dark:via-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
