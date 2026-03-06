import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center p-4">
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
            
            <motion.div 
                className="relative z-10 w-full max-w-[280px] rounded-2xl border border-primary/20 bg-background/60 backdrop-blur-xl p-5 shadow-2xl"
                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="mb-5 flex items-center gap-4 border-b border-border/50 pb-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                        <PhoneCall className="h-6 w-6 text-primary" />
                        <motion.div
                            className="absolute inset-0 rounded-2xl border border-primary/40"
                            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                    <div>
                        <div className="h-2.5 w-20 rounded-full bg-muted-foreground/30 mb-2.5" />
                        <div className="h-2 w-32 rounded-full bg-muted-foreground/20" />
                    </div>
                </div>

                <div className="space-y-4">
                    <motion.div 
                        className="rounded-xl border border-border/40 bg-muted/30 p-3.5"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <div className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            <MessageSquare className="h-3.5 w-3.5" /> {t('marketing.features_accordion.ui.customer')}
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted-foreground/30 mb-2" />
                        <div className="h-2.5 w-4/5 rounded-full bg-muted-foreground/20" />
                    </motion.div>

                    <motion.div 
                        className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-4 shadow-inner"
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.5, ease: "backOut" }}
                    >
                        <motion.div
                            className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-primary/30"
                            initial={{ y: "-100%" }}
                            animate={{ y: "0%" }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                        />
                        <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-widest">
                            <Sparkles className="h-3.5 w-3.5 fill-primary/30" /> {t('marketing.features_accordion.ui.ai_suggestion')}
                        </div>
                        <div className="h-2.5 w-[90%] rounded-full bg-primary/40 mb-2" />
                        <div className="h-2.5 w-2/3 rounded-full bg-primary/20 mb-2" />
                        <div className="h-2.5 w-1/2 rounded-full bg-primary/20" />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

function SentimentAnimation() {
    const { t } = useTranslation()
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="w-full max-w-[280px] space-y-4">
                <motion.div 
                    className="relative z-10 flex items-center justify-between rounded-2xl border border-border/50 bg-background/80 backdrop-blur-md p-4 shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border/50">
                            <AudioWaveform className="h-6 w-6 text-muted-foreground z-10" />
                            <motion.div
                                className="absolute inset-0 rounded-2xl border border-muted-foreground/30"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </div>
                        <div>
                            <div className="text-sm font-semibold">{t('marketing.features_accordion.ui.live_sentiment')}</div>
                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <span className="relative flex h-2 w-2 mt-0.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                {t('marketing.features_accordion.ui.analyzing')}
                            </div>
                        </div>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ scale: 0.2, opacity: 0, rotate: -45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.2, opacity: 0, rotate: 45 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 border border-primary/10 shadow-sm [&>svg]:h-7 [&>svg]:w-7"
                        >
                            {emojis[index]}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <motion.div 
                    className="relative z-10 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-md p-5 shadow-2xl"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="mb-4 flex justify-between text-xs">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider">{t('marketing.features_accordion.ui.journey')}</span>
                    </div>
                    <div className="flex h-14 w-full items-end gap-1.5">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={cn(
                                    "w-full rounded-t-md",
                                    i > 10 ? "bg-gradient-to-t from-emerald-500/30 to-emerald-500/80" : 
                                    i > 5 ? "bg-gradient-to-t from-amber-500/30 to-amber-500/80" : 
                                    "bg-gradient-to-t from-rose-500/30 to-rose-500/80"
                                )}
                                animate={{
                                    height: [`${30 + Math.random() * 30}%`, `${50 + Math.random() * 50}%`, `${30 + Math.random() * 30}%`],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

function AnalyticsAnimation() {
    const { t } = useTranslation()
    const stats = [
        { icon: <PhoneCall />, label: 'Active Calls', val: '142', up: true, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { icon: <Zap />, label: 'Resolution', val: '89%', up: true, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { icon: <Activity />, label: 'Avg Handle', val: '4m 12s', up: false, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        { icon: <Users />, label: 'Agents', val: '24', up: null, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    ]

    return (
        <div className="relative flex h-full w-full items-center justify-center p-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="grid w-full max-w-[320px] grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        className={cn("relative z-10 flex flex-col rounded-2xl border bg-background/80 backdrop-blur-xl p-4 shadow-xl", stat.border)}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ 
                            delay: i * 0.15, 
                            duration: 0.5,
                            type: "spring",
                            stiffness: 200,
                            damping: 20
                        }}
                        whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl [&>svg]:h-4 [&>svg]:w-4", stat.bg, stat.color)}>
                                {stat.icon}
                            </div>
                            {stat.up !== null && (
                                <motion.div 
                                    className={cn("flex items-center justify-center h-5 w-5 rounded-full bg-background shadow-sm border", stat.up ? "border-emerald-500/20" : "border-rose-500/20")}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: (i * 0.15) + 0.3 }}
                                >
                                    <ArrowUpRight className={cn("h-3 w-3", stat.up ? "text-emerald-500" : "text-rose-500 rotate-90")} />
                                </motion.div>
                            )}
                        </div>
                        <div className="text-2xl font-bold tracking-tight">{stat.val}</div>
                        <div className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

function InsightsAnimation() {
    const { t } = useTranslation()
    return (
        <div className="relative flex h-full w-full items-center justify-center p-4">
            <motion.div 
                className="absolute right-8 top-12 h-20 w-20 bg-primary/20 rounded-full blur-2xl"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            
            <motion.div 
                className="relative z-10 w-full max-w-[300px] rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl p-5 shadow-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                            <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{t('marketing.features_accordion.ui.team_perf')}</span>
                    </div>
                </div>
                
                <div className="space-y-5">
                    {[
                        { name: 'Sarah J.', score: 98, width: '98%', delay: 0.2 },
                        { name: 'Marcus T.', score: 92, width: '92%', delay: 0.4 },
                        { name: 'Elena R.', score: 85, width: '85%', delay: 0.6 },
                    ].map((agent, i) => (
                        <div key={i} className="group">
                            <div className="mb-2 flex justify-between text-xs">
                                <span className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{agent.name}</span>
                                <motion.span 
                                    className="font-mono font-bold text-primary"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: agent.delay + 0.5 }}
                                >
                                    {agent.score}
                                </motion.span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                                <motion.div
                                    className="relative h-full bg-gradient-to-r from-primary/60 to-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: agent.width }}
                                    transition={{ duration: 1.2, delay: agent.delay, ease: "easeOut" }}
                                >
                                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>

                <motion.div 
                    className="relative mt-6 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="flex items-start gap-3">
                        <Zap className="h-4 w-4 shrink-0 text-primary mt-0.5 fill-primary/20" />
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            <span className="font-semibold text-foreground block mb-1">{t('marketing.features_accordion.ui.insight')}</span>
                            {t('marketing.features_accordion.ui.insight_text')}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default function Features() {
    const { t } = useTranslation()
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
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">{t('marketing.features_accordion.title')}</h2>
                    <p>{t('marketing.features_accordion.desc')}</p>
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
                                    {t('marketing.features_accordion.items.coaching.title')}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>{t('marketing.features_accordion.items.coaching.desc')}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <AudioWaveform className="size-4" />
                                    {t('marketing.features_accordion.items.sentiment.title')}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>{t('marketing.features_accordion.items.sentiment.desc')}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <BarChart3 className="size-4" />
                                    {t('marketing.features_accordion.items.analytics.title')}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>{t('marketing.features_accordion.items.analytics.desc')}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <TrendingUp className="size-4" />
                                    {t('marketing.features_accordion.items.insights.title')}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>{t('marketing.features_accordion.items.insights.desc')}</AccordionContent>
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
