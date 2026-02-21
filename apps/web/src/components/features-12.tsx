import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BorderBeam } from '@/components/ui/border-beam'
import { 
    TrendingUp,
    PhoneCall, 
    Sparkles, 
    MessageSquare, 
    AudioWaveform, 
    Smile, 
    Meh, 
    Frown, 
    Activity, 
    Users, 
    BarChart3, 
    ArrowUpRight, 
    Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type FeatureKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'

// Animated components for each feature
function CallCoachingAnimation() {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center p-4">
            <motion.div 
                className="w-full max-w-[260px] rounded-xl border border-border bg-background p-4 shadow-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <PhoneCall className="h-5 w-5 text-primary" />
                        <motion.div
                            className="absolute inset-0 rounded-full border border-primary/50"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                    <div>
                        <div className="h-2 w-16 rounded-full bg-muted-foreground/20 mb-2" />
                        <div className="h-2 w-24 rounded-full bg-muted-foreground/20" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            <MessageSquare className="h-3 w-3" /> Customer
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted-foreground/20 mb-1.5" />
                        <div className="h-2 w-4/5 rounded-full bg-muted-foreground/20" />
                    </div>

                    <motion.div 
                        className="relative overflow-hidden rounded-lg border border-primary/30 bg-primary/5 p-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    >
                        <motion.div
                            className="absolute left-0 top-0 h-full w-1 bg-primary"
                        />
                        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                            <Sparkles className="h-3 w-3" /> AI Suggestion
                        </div>
                        <div className="h-2 w-[90%] rounded-full bg-primary/20 mb-1.5" />
                        <div className="h-2 w-2/3 rounded-full bg-primary/20" />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

function SentimentAnimation() {
    const emojis = [<Smile className="text-emerald-500" />, <Meh className="text-amber-500" />, <Frown className="text-rose-500" />]
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((i) => (i + 1) % emojis.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center p-4">
            <div className="w-full max-w-[260px] space-y-4">
                <motion.div className="flex items-center justify-between rounded-xl border border-border bg-background p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <AudioWaveform className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <div className="text-xs font-medium">Live Sentiment</div>
                            <div className="text-[10px] text-muted-foreground">Analyzing voice...</div>
                        </div>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex h-10 w-10 items-center justify-center [&>svg]:h-6 [&>svg]:w-6"
                        >
                            {emojis[index]}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <div className="rounded-xl border border-border bg-background p-4 shadow-xl">
                    <div className="mb-3 flex justify-between text-xs">
                        <span className="font-medium">Emotional Journey</span>
                    </div>
                    <div className="flex h-12 w-full items-end gap-1">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={cn(
                                    "w-full rounded-t-sm",
                                    i > 10 ? "bg-emerald-500/50" : i > 5 ? "bg-amber-500/50" : "bg-rose-500/50"
                                )}
                                animate={{
                                    height: [`${20 + Math.random() * 40}%`, `${30 + Math.random() * 70}%`, `${20 + Math.random() * 40}%`],
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
                </div>
            </div>
        </div>
    )
}

function AnalyticsAnimation() {
    return (
        <div className="relative flex h-full w-full items-center justify-center p-4">
            <div className="grid w-full max-w-[280px] grid-cols-2 gap-3">
                {[
                    { icon: <PhoneCall />, label: 'Active Calls', val: '142', up: true },
                    { icon: <Zap />, label: 'Resolution', val: '89%', up: true },
                    { icon: <Activity />, label: 'Avg Handle', val: '4m 12s', up: false },
                    { icon: <Users />, label: 'Agents', val: '24', up: null },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        className="flex flex-col rounded-xl border border-border bg-background p-3 shadow-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-primary">
                                {stat.icon}
                            </div>
                            {stat.up !== null && (
                                <ArrowUpRight className={cn("h-3 w-3", stat.up ? "text-emerald-500" : "text-rose-500 rotate-90")} />
                            )}
                        </div>
                        <div className="text-xl font-bold">{stat.val}</div>
                        <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

function InsightsAnimation() {
    return (
        <div className="relative flex h-full w-full items-center justify-center p-4">
            <div className="w-full max-w-[280px] rounded-xl border border-border bg-background p-4 shadow-xl">
                <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Team Performance</span>
                </div>
                
                <div className="space-y-4">
                    {[
                        { name: 'Sarah J.', score: 98, width: '98%' },
                        { name: 'Marcus T.', score: 92, width: '92%' },
                        { name: 'Elena R.', score: 85, width: '85%' },
                    ].map((agent, i) => (
                        <div key={i}>
                            <div className="mb-1.5 flex justify-between text-xs">
                                <span className="font-medium text-muted-foreground">{agent.name}</span>
                                <span className="font-mono text-primary">{agent.score}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary/50 to-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: agent.width }}
                                    transition={{ duration: 1, delay: i * 0.2 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
                    <Zap className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                        <span className="font-medium text-foreground">Insight:</span> Sarah's empathy scoring improved by 14% after recent coaching.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function Features() {
    const [activeItem, setActiveItem] = useState<FeatureKey>('item-1')

    const featureComponents = {
        'item-1': CallCoachingAnimation,
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
                                    <Sparkles className="size-4" />
                                    Real-Time Call Coaching
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Get instant suggestions during live calls. Our AI analyzes conversations in real-time and provides contextual prompts to help agents overcome objections and guide conversations toward successful outcomes.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <AudioWaveform className="size-4" />
                                    Sentiment & Emotion Detection
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Detect customer emotions instantly with advanced NLP. Know when they're interested, skeptical, or frustrated so agents can adjust their approach and improve customer satisfaction.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <BarChart3 className="size-4" />
                                    Conversation Analytics
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Track performance metrics like talk-to-listen ratios, keyword frequency, and conversion patterns. Turn every conversation into actionable data that drives continuous improvement.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <TrendingUp className="size-4" />
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
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className="size-full rounded-2xl border bg-muted/20"
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
                            className="from-transparent via-primary/50 to-transparent dark:via-primary/30"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
